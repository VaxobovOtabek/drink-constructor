'use client';

import React, { useState, useEffect } from 'react';
import { BottleSize, Flavor, Additive } from '@/types';
import {
  getStoredBottleSizes,
  saveStoredBottleSizes,
  getStoredFlavors,
  saveStoredFlavors,
  getStoredAdditives,
  saveStoredAdditives,
  resetStoredPricesToDefault,
} from '@/lib/storage';
import { X, Check, DollarSign, RotateCcw, Sparkles, Tag, Layers, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface PriceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPricesUpdated?: () => void;
}

export const PriceManagementModal: React.FC<PriceManagementModalProps> = ({
  isOpen,
  onClose,
  onPricesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'sizes' | 'flavors' | 'additives'>('sizes');
  const [sizes, setSizes] = useState<BottleSize[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [additives, setAdditives] = useState<Additive[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncedSheets, setSyncedSheets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSizes(getStoredBottleSizes());
      setFlavors(getStoredFlavors());
      setAdditives(getStoredAdditives());
      setSaveSuccess(false);
      setSyncedSheets(false);

      // Try fetching latest prices from server/sheets in background
      fetch('/api/prices')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.sizes && data.sizes.length > 0) {
            // merge with stored
            const currentSizes = getStoredBottleSizes();
            const mergedSizes = currentSizes.map((cs) => {
              const fromApi = data.sizes.find((s: any) => s.id === cs.id);
              return fromApi ? { ...cs, basePrice: fromApi.basePrice } : cs;
            });
            const currentFlavors = getStoredFlavors();
            const mergedFlavors = currentFlavors.map((cf) => {
              const fromApi = data.flavors.find((f: any) => f.id === cf.id);
              return fromApi ? { ...cf, pricePerMg: fromApi.pricePerMg } : cf;
            });
            const currentAdditives = getStoredAdditives();
            const mergedAdditives = currentAdditives.map((ca) => {
              const fromApi = data.additives.find((a: any) => a.id === ca.id);
              return fromApi ? { ...ca, price: fromApi.price } : ca;
            });
            setSizes(mergedSizes);
            setFlavors(mergedFlavors);
            setAdditives(mergedAdditives);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateSizePrice = (id: string, newPrice: number) => {
    setSizes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, basePrice: Math.max(0, newPrice) } : s))
    );
  };

  const handleUpdateFlavorPrice = (id: string, newPricePer100Mg: number) => {
    setFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pricePerMg: Math.max(0, newPricePer100Mg) } : f))
    );
  };

  const handleUpdateAdditivePrice = (id: string, newPrice: number) => {
    setAdditives((prev) =>
      prev.map((a) => (a.id === id ? { ...a, price: Math.max(0, newPrice) } : a))
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // 1. Save locally for instant reactivity
    saveStoredBottleSizes(sizes);
    saveStoredFlavors(flavors);
    saveStoredAdditives(additives);

    let sheetsOk = false;
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizes, flavors, additives }),
      });
      const data = await res.json();
      sheetsOk = !!data.syncedExcel;
    } catch (err) {
      console.error('Failed to sync prices to server/Google Sheets:', err);
    }

    setIsSaving(false);
    setSyncedSheets(sheetsOk);
    setSaveSuccess(true);
    if (onPricesUpdated) onPricesUpdated();

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Barcha narxlar standart (boshlang\'ich) holatiga qaytarilsinmi?')) {
      const defaults = resetStoredPricesToDefault();
      setSizes(defaults.sizes);
      setFlavors(defaults.flavors);
      setAdditives(defaults.additives);
      if (onPricesUpdated) onPricesUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" /> Narxlar va Menyu Boshqaruvi
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Ichimliklar, Bankalar va Qo'shimchalar Narxlarini O'zgartirish
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bu yerda o'zgartirilgan narxlar konstruktorda darhol hisoblanadi va amal qiladi
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sizes'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" /> Bankalar Bazaviy Narxi ({sizes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flavors')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'flavors'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Flame className="w-4 h-4" /> Ta'mlar Narxi ({flavors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('additives')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'additives'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Qo'shimchalar Narxi ({additives.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-[380px] overflow-y-auto pr-1">
          {/* TAB 1: BOTTLE SIZES */}
          {activeTab === 'sizes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sizes.map((size) => (
                <div
                  key={size.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {size.liters} Litr
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {size.nameUz}
                    </h4>
                    <p className="text-[10px] text-slate-400">Maks: {size.maxCapacityMg} mg</p>
                  </div>

                  <div className="text-right">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                      Baza narxi (so'm):
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={size.basePrice}
                      onChange={(e) => handleUpdateSizePrice(size.id, parseInt(e.target.value, 10) || 0)}
                      className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: FLAVORS */}
          {activeTab === 'flavors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {flavors.map((flavor) => {
                const perGram = flavor.pricePerMg * 10;
                return (
                  <div
                    key={flavor.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-2xl">{flavor.icon}</span>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {flavor.nameUz}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          1 grammi: {perGram.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        100mg narxi:
                      </label>
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={flavor.pricePerMg}
                          onChange={(e) =>
                            handleUpdateFlavorPrice(flavor.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">so'm</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: ADDITIVES */}
          {activeTab === 'additives' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {additives.map((additive) => (
                <div
                  key={additive.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{additive.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {additive.nameUz}
                      </h4>
                      <span className="text-[10px] text-slate-400">+{additive.calories} kkal</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Dona narxi:
                    </label>
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        step="any"
                        min={0}
                        value={additive.price}
                        onChange={(e) =>
                          handleUpdateAdditivePrice(additive.id, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500">so'm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success alert banner */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between gap-2 animate-bounce">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Barcha narxlar muvaffaqiyatli saqlandi va konstruktorga tatbiq etildi!</span>
            </div>
            {syncedSheets && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-[10px] font-bold">
                Online Excel (Sheets)ga yozildi
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Standart narxlarga qaytarish
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Yopish
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Narxlarni Saqlash
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
