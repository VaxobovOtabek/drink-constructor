'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BottleSize, CustomDrink, Flavor, SelectedFlavor, Additive, Order } from '@/types';
import { BOTTLE_SIZES } from '@/data/bottleSizes';
import { FLAVORS_DATA } from '@/data/flavors';
import { ADDITIVES_DATA } from '@/data/additives';
import { BottleVisualizer } from '@/components/BottleVisualizer';
import { SizeSelector } from '@/components/SizeSelector';
import { FlavorSelector } from '@/components/FlavorSelector';
import { CustomizerOptions } from '@/components/CustomizerOptions';
import { OrderSummary } from '@/components/OrderSummary';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { Navbar } from '@/components/Navbar';
import {
  getStoredOrders,
  addStoredOrder,
  getStoredBottleSizes,
  getStoredFlavors,
  getStoredAdditives,
} from '@/lib/storage';
import { Sparkles, Flame, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

const INITIAL_DRINK: CustomDrink = {
  drinkName: 'Coca-Cola Kraft Cherry & Moxito',
  bottleSize: BOTTLE_SIZES[0], // 0.5L Sleek Can
  flavors: [
    { flavorId: 'strawberry', flavor: FLAVORS_DATA[0], amountMg: 400 },
    { flavorId: 'lemon_mint', flavor: FLAVORS_DATA[1], amountMg: 250 },
  ],
  carbonation: 'high',
  iceLevel: 50,
  sweetnessLevel: 50,
  sweetenerType: 'sugar',
  additives: [],
  totalPrice: 20500,
  totalCalories: 60,
  totalFlavorMg: 650,
};

export default function DrinkConstructorPage() {
  const [availableSizes, setAvailableSizes] = useState<BottleSize[]>(BOTTLE_SIZES);
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>(FLAVORS_DATA);
  const [availableAdditives, setAvailableAdditives] = useState<Additive[]>(ADDITIVES_DATA);

  const [drink, setDrink] = useState<CustomDrink>(INITIAL_DRINK);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    const orders = getStoredOrders();
    setOrderCount(orders.length);

    const sizes = getStoredBottleSizes();
    const flavors = getStoredFlavors();
    const additives = getStoredAdditives();

    setAvailableSizes(sizes);
    setAvailableFlavors(flavors);
    setAvailableAdditives(additives);

    // Synchronize initial drink with stored pricing
    setDrink((prev) => {
      const currentSize = sizes.find((s) => s.id === prev.bottleSize.id) || prev.bottleSize;
      const updatedFlavors = prev.flavors.map((f) => {
        const found = flavors.find((fl) => fl.id === f.flavorId);
        return found ? { ...f, flavor: found } : f;
      });
      const updatedAdditives = prev.additives.map((a) => {
        const found = additives.find((ad) => ad.id === a.id);
        return found ? found : a;
      });

      const basePrice = currentSize.basePrice;
      const flavorsPrice = updatedFlavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = updatedAdditives.reduce((sum, a) => sum + a.price, 0);

      return {
        ...prev,
        bottleSize: currentSize,
        flavors: updatedFlavors,
        additives: updatedAdditives,
        totalPrice: basePrice + flavorsPrice + additivesPrice,
      };
    });

    // Fetch centralized prices from Google Sheets via /api/prices
    fetch('/api/prices')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sizes && data.sizes.length > 0) {
          const freshSizes = sizes.map((s) => {
            const found = data.sizes.find((ds: any) => ds.id === s.id);
            return found ? { ...s, basePrice: found.basePrice } : s;
          });
          const freshFlavors = flavors.map((f) => {
            const found = data.flavors.find((df: any) => df.id === f.id);
            return found ? { ...f, pricePerMg: found.pricePerMg } : f;
          });
          const freshAdditives = additives.map((a) => {
            const found = data.additives.find((da: any) => da.id === a.id);
            return found ? { ...a, price: found.price } : a;
          });

          setAvailableSizes(freshSizes);
          setAvailableFlavors(freshFlavors);
          setAvailableAdditives(freshAdditives);

          setDrink((prev) => {
            const currentSize = freshSizes.find((s) => s.id === prev.bottleSize.id) || prev.bottleSize;
            const updatedFlavors = prev.flavors.map((f) => {
              const found = freshFlavors.find((fl) => fl.id === f.flavorId);
              return found ? { ...f, flavor: found } : f;
            });
            const updatedAdditives = prev.additives.map((a) => {
              const found = freshAdditives.find((ad) => ad.id === a.id);
              return found ? found : a;
            });

            const basePrice = currentSize.basePrice;
            const flavorsPrice = updatedFlavors.reduce(
              (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
              0
            );
            const additivesPrice = updatedAdditives.reduce((sum, a) => sum + a.price, 0);

            return {
              ...prev,
              bottleSize: currentSize,
              flavors: updatedFlavors,
              additives: updatedAdditives,
              totalPrice: basePrice + flavorsPrice + additivesPrice,
            };
          });
        }
      })
      .catch(() => {});
  }, []);

  // Recalculate prices and nutrition whenever drink parameters change
  const recalculateDrink = useCallback((updated: Partial<CustomDrink>) => {
    setDrink((prev) => {
      const merged = { ...prev, ...updated };
      
      const totalFlavorMg = merged.flavors.reduce((sum, f) => sum + f.amountMg, 0);
      const basePrice = merged.bottleSize.basePrice;
      const flavorsPrice = merged.flavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = merged.additives.reduce((sum, a) => sum + a.price, 0);
      const totalPrice = basePrice + flavorsPrice + additivesPrice;

      const flavorsCalories = merged.flavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.caloriesPer100Mg),
        0
      );
      const additivesCalories = merged.additives.reduce((sum, a) => sum + a.calories, 0);
      const sweetnessCalories = merged.sweetenerType === 'sugar' ? Math.round(merged.sweetnessLevel * 0.8) : 0;
      const totalCalories = flavorsCalories + additivesCalories + sweetnessCalories;

      return {
        ...merged,
        totalFlavorMg,
        totalPrice,
        totalCalories,
      };
    });
  }, []);

  const triggerPourAnimation = useCallback(() => {
    setIsPouring(true);
    setTimeout(() => setIsPouring(false), 350);
  }, []);

  const handleSelectSize = useCallback((size: BottleSize) => {
    setDrink((prev) => {
      let updatedFlavors = [...prev.flavors];
      const currentTotal = updatedFlavors.reduce((s, f) => s + f.amountMg, 0);
      if (currentTotal > size.maxCapacityMg) {
        const ratio = size.maxCapacityMg / currentTotal;
        updatedFlavors = updatedFlavors.map((f) => ({
          ...f,
          amountMg: Math.max(50, Math.round((f.amountMg * ratio) / 50) * 50),
        }));
      }

      const totalFlavorMg = updatedFlavors.reduce((sum, f) => sum + f.amountMg, 0);
      const flavorsPrice = updatedFlavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = prev.additives.reduce((sum, a) => sum + a.price, 0);
      const totalPrice = size.basePrice + flavorsPrice + additivesPrice;

      return {
        ...prev,
        bottleSize: size,
        flavors: updatedFlavors,
        totalFlavorMg,
        totalPrice,
      };
    });
  }, []);

  const handleAddFlavor = useCallback((flavor: Flavor, initialMg?: number) => {
    const defaultAmount = initialMg || flavor.defaultMg;
    setDrink((prev) => {
      const existingIndex = prev.flavors.findIndex((f) => f.flavorId === flavor.id);
      let updatedFlavors: SelectedFlavor[];
      if (existingIndex >= 0) {
        updatedFlavors = prev.flavors.map((f, idx) =>
          idx === existingIndex ? { ...f, amountMg: f.amountMg + 100 } : f
        );
      } else {
        updatedFlavors = [
          ...prev.flavors,
          { flavorId: flavor.id, flavor, amountMg: defaultAmount },
        ];
      }

      const totalFlavorMg = updatedFlavors.reduce((sum, f) => sum + f.amountMg, 0);
      const flavorsPrice = updatedFlavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = prev.additives.reduce((sum, a) => sum + a.price, 0);

      return {
        ...prev,
        flavors: updatedFlavors,
        totalFlavorMg,
        totalPrice: prev.bottleSize.basePrice + flavorsPrice + additivesPrice,
      };
    });
    triggerPourAnimation();
  }, [triggerPourAnimation]);

  const handleUpdateFlavorAmount = useCallback((flavorId: string, amountMg: number) => {
    setDrink((prev) => {
      const updatedFlavors = prev.flavors.map((f) =>
        f.flavorId === flavorId ? { ...f, amountMg } : f
      );
      const totalFlavorMg = updatedFlavors.reduce((sum, f) => sum + f.amountMg, 0);
      const flavorsPrice = updatedFlavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = prev.additives.reduce((sum, a) => sum + a.price, 0);

      return {
        ...prev,
        flavors: updatedFlavors,
        totalFlavorMg,
        totalPrice: prev.bottleSize.basePrice + flavorsPrice + additivesPrice,
      };
    });
    triggerPourAnimation();
  }, [triggerPourAnimation]);

  const handleRemoveFlavor = useCallback((flavorId: string) => {
    setDrink((prev) => {
      const updatedFlavors = prev.flavors.filter((f) => f.flavorId !== flavorId);
      const totalFlavorMg = updatedFlavors.reduce((sum, f) => sum + f.amountMg, 0);
      const flavorsPrice = updatedFlavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );
      const additivesPrice = prev.additives.reduce((sum, a) => sum + a.price, 0);

      return {
        ...prev,
        flavors: updatedFlavors,
        totalFlavorMg,
        totalPrice: prev.bottleSize.basePrice + flavorsPrice + additivesPrice,
      };
    });
  }, []);

  const handleToggleAdditive = useCallback((additive: Additive) => {
    setDrink((prev) => {
      const exists = prev.additives.some((a) => a.id === additive.id);
      const updated = exists
        ? prev.additives.filter((a) => a.id !== additive.id)
        : [...prev.additives, additive];
      const additivesPrice = updated.reduce((sum, a) => sum + a.price, 0);
      const flavorsPrice = prev.flavors.reduce(
        (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
        0
      );

      return {
        ...prev,
        additives: updated,
        totalPrice: prev.bottleSize.basePrice + flavorsPrice + additivesPrice,
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setDrink({
      ...INITIAL_DRINK,
      flavors: [],
      additives: [],
      drinkName: 'Mening Yangi Bankam',
      totalPrice: INITIAL_DRINK.bottleSize.basePrice,
      totalCalories: 0,
      totalFlavorMg: 0,
    });
  }, []);

  const handleOrderSuccess = useCallback((order: Order) => {
    const updated = addStoredOrder(order);
    setOrderCount(updated.length);
    setIsCheckoutOpen(false);
    setSuccessOrder(order);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar orderCount={orderCount} onResetConstructor={handleReset} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent py-7 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>0.5L Can • Maxsus Retsept • Gazli &amp; Salqin</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Kraft Ichimligingizni <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Bankada Yarating</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Meva, sitrus, berry va energetik konsentratlarni milligrammgacha aralashtiring,
            jonli metall bankada natijani ko'ring va buyurtma bering!
          </p>
        </div>
      </section>

      {/* Main Interactive Constructor Studio */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Live Visual Can Studio (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center">
              
              <div className="w-full flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> 0.5L Banka Vizualizatsiyasi
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {drink.bottleSize.label} • {drink.totalFlavorMg} mg
                </span>
              </div>

              {/* Can Visualizer */}
              <BottleVisualizer drink={drink} isPouring={isPouring} />

              {/* Quick Specs Under Can */}
              <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{drink.iceLevel}%</div>
                  <div>Muz</div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-700 px-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{drink.carbonation}</div>
                  <div>Gazlilik</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{drink.sweetnessLevel}%</div>
                  <div>Shirinlik</div>
                </div>
              </div>
            </div>

            {/* Live Pricing & Checkout Card */}
            <OrderSummary
              drink={drink}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              onReset={handleReset}
            />
          </div>

          {/* RIGHT: Step-by-Step Customization Controls */}
          <div className="lg:col-span-7 space-y-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
            
            {/* Step 1: Bottle / Can Size Selection */}
            <SizeSelector
              selectedSize={drink.bottleSize}
              availableSizes={availableSizes}
              onSelectSize={handleSelectSize}
            />

            <hr className="border-slate-200/80 dark:border-slate-800" />

            {/* Step 2: Flavors & Dosage in Milligrams (mg) */}
            <FlavorSelector
              selectedFlavors={drink.flavors}
              bottleSize={drink.bottleSize}
              availableFlavors={availableFlavors}
              onAddFlavor={handleAddFlavor}
              onUpdateAmount={handleUpdateFlavorAmount}
              onRemoveFlavor={handleRemoveFlavor}
            />

            <hr className="border-slate-200/80 dark:border-slate-800" />

            {/* Step 3: Carbonation, Ice, Sweetness, Additives, Custom Label */}
            <CustomizerOptions
              drink={drink}
              availableAdditives={availableAdditives}
              onChangeName={(name) => recalculateDrink({ drinkName: name })}
              onChangeCarbonation={(carbonation) => recalculateDrink({ carbonation })}
              onChangeIce={(iceLevel) => recalculateDrink({ iceLevel })}
              onChangeSweetness={(sweetnessLevel) => recalculateDrink({ sweetnessLevel })}
              onChangeSweetenerType={(sweetenerType) => recalculateDrink({ sweetenerType })}
              onToggleAdditive={handleToggleAdditive}
            />
          </div>

        </div>
      </main>

      {/* Feature Highlights */}
      <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Toza Tabiiy Ekstraktlar</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">100% tabiiy meva sharbati va o'tlar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Milligramgacha Aniq Doza</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Retsept bo'yicha aniq tayyorlanadi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Muzdek Yetkazish</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Muzdek banka eshigingizgacha</p>
            </div>
          </div>
        </div>

        
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        drink={drink}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Success Celebration & Receipt Modal */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onNewMix={handleReset}
      />
    </div>
  );
}
