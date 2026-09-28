'use client';

import React, { useMemo, memo } from 'react';
import { Flavor, SelectedFlavor, BottleSize } from '@/types';
import { FLAVORS_DATA } from '@/data/flavors';
import { Plus, Trash2, AlertCircle, Sliders } from 'lucide-react';

interface FlavorSelectorProps {
  selectedFlavors: SelectedFlavor[];
  bottleSize: BottleSize;
  onAddFlavor: (flavor: Flavor, initialMg?: number) => void;
  onUpdateAmount: (flavorId: string, amountMg: number) => void;
  onRemoveFlavor: (flavorId: string) => void;
  availableFlavors?: Flavor[];
}

export const FlavorSelector: React.FC<FlavorSelectorProps> = memo(({
  selectedFlavors,
  bottleSize,
  onAddFlavor,
  onUpdateAmount,
  onRemoveFlavor,
  availableFlavors = FLAVORS_DATA,
}) => {
  const totalMg = useMemo(() => {
    return selectedFlavors.reduce((sum, f) => sum + f.amountMg, 0);
  }, [selectedFlavors]);

  const remainingMg = Math.max(0, bottleSize.maxCapacityMg - totalMg);
  const capacityPct = Math.min(100, Math.round((totalMg / bottleSize.maxCapacityMg) * 100));

  return (
    <div className="w-full space-y-4">
      {/* Header & Capacity Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">2</span>
            Ta'mlarni Tanlang va Dozasini Belgilang (mg)
          </label>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Jami: <span className="text-amber-600 dark:text-amber-400 font-bold">{totalMg} mg</span> / {bottleSize.maxCapacityMg} mg
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              capacityPct > 90
                ? 'bg-red-500'
                : capacityPct > 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        {remainingMg === 0 && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Ushbu banka uchun maksimal ta'm sig'imi to'ldi!
          </p>
        )}
      </div>

      {/* Selected Flavors Active List (Dosage Adjustments) */}
      {selectedFlavors.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-3 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Bankadagi Ta'mlar ({selectedFlavors.length})
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Qolgan bo'sh joy: <b>{remainingMg} mg</b>
            </span>
          </div>

          <div className="space-y-2">
            {selectedFlavors.map((item) => {
              const maxAllowedForThis = item.amountMg + remainingMg;
              const costForThis = Math.round((item.amountMg / 100) * item.flavor.pricePerMg);

              const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const targetVal = parseInt(e.target.value, 10) || 50;
                // Cap the value to the max allowed by the bottle's remaining capacity
                const finalVal = Math.min(targetVal, maxAllowedForThis, item.flavor.maxMg);
                onUpdateAmount(item.flavorId, Math.max(50, finalVal));
              };

              return (
                <div
                  key={item.flavorId}
                  className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.flavor.icon}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                          {item.flavor.nameUz}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          +{costForThis.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Current mg badge */}
                      <div
                        className="px-2 py-0.5 rounded-md text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: item.flavor.color }}
                      >
                        {item.amountMg} mg
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => onRemoveFlavor(item.flavorId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Slider and Fast Increment Buttons */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        id={`flavor-range-${item.flavorId}`}
                        name={`flavor-range-${item.flavorId}`}
                        min={50}
                        max={item.flavor.maxMg}
                        step={50}
                        value={item.amountMg}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>50 mg</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateAmount(item.flavorId, Math.max(50, item.amountMg - 100))}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          -100mg
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateAmount(item.flavorId, Math.min(maxAllowedForThis, item.flavor.maxMg, item.amountMg + 100))}
                          disabled={remainingMg < 50 || item.amountMg >= item.flavor.maxMg}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
                        >
                          +100mg
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateAmount(item.flavorId, Math.min(maxAllowedForThis, item.flavor.maxMg, item.amountMg + 250))}
                          disabled={remainingMg < 50 || item.amountMg >= item.flavor.maxMg}
                          className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-900 dark:text-amber-200 disabled:opacity-40 transition-colors"
                        >
                          +250mg
                        </button>
                      </div>
                      <span>Maks: {item.flavor.maxMg} mg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Flavors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {availableFlavors.map((flavor) => {
          const isSelected = selectedFlavors.some((f) => f.flavorId === flavor.id);
          const currentSelected = selectedFlavors.find((f) => f.flavorId === flavor.id);

          return (
            <div
              key={flavor.id}
              className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1 rounded-xl bg-slate-50 dark:bg-slate-800">
                      {flavor.icon}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {flavor.nameUz}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {flavor.caloriesPer100Mg} kkal / 100mg
                      </span>
                    </div>
                  </div>

                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-xs flex-shrink-0"
                    style={{ backgroundColor: flavor.color }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                  {flavor.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {flavor.pricePerMg * 10} so'm / 1g
                </span>

                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                    {currentSelected?.amountMg}mg qo'shilgan
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={remainingMg < 50}
                    onClick={() => onAddFlavor(flavor, Math.min(flavor.defaultMg, remainingMg))}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white font-semibold text-xs flex items-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" /> Qo'shish
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

FlavorSelector.displayName = 'FlavorSelector';
