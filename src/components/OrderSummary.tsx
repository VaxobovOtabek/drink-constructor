'use client';

import React, { memo } from 'react';
import { CustomDrink } from '@/types';
import { ShoppingBag, Zap, Flame, ArrowRight, HeartPulse } from 'lucide-react';

interface OrderSummaryProps {
  drink: CustomDrink;
  onOpenCheckout: () => void;
  onReset: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = memo(({ drink, onOpenCheckout, onReset }) => {
  const { bottleSize, flavors, additives, totalPrice, totalCalories, totalFlavorMg } = drink;

  const basePrice = bottleSize.basePrice;
  const flavorsPrice = flavors.reduce(
    (sum, f) => sum + Math.round((f.amountMg / 100) * f.flavor.pricePerMg),
    0
  );
  const additivesPrice = additives.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-extrabold">
            Hisob-kitob &amp; Retsept
          </span>
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
            {drink.drinkName || 'Maxsus Banka'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-red-500 font-semibold transition"
        >
          Tozalash
        </button>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span>Banka bazasi ({bottleSize.label}):</span>
          <span className="font-semibold">{basePrice.toLocaleString()} so'm</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Ta'mlar konsentrati ({totalFlavorMg} mg):</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            +{flavorsPrice.toLocaleString()} so'm
          </span>
        </div>

        {additives.length > 0 && (
          <div className="flex items-center justify-between">
            <span>Toppinglar ({additives.length} ta):</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{additivesPrice.toLocaleString()} so'm
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-base">
          <span className="font-bold text-slate-900 dark:text-white">Birlik narxi:</span>
          <span className="font-black text-2xl text-amber-600 dark:text-amber-400">
            {totalPrice.toLocaleString()} <span className="text-xs font-normal">so'm</span>
          </span>
        </div>
      </div>

      {/* Nutrition & Recipe Quick Badges */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
            <Flame className="w-3 h-3 text-orange-500" /> Kaloriya
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">~{totalCalories} kkal</span>
        </div>

        <div className="text-center border-x border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
            <Zap className="w-3 h-3 text-amber-500" /> Hajm
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{bottleSize.label}</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
            <HeartPulse className="w-3 h-3 text-emerald-500" /> Sifat
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Tabiiy</span>
        </div>
      </div>

      {/* Order Action Button */}
      <button
        type="button"
        onClick={onOpenCheckout}
        disabled={flavors.length === 0}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Buyurtma Berish</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>

      {flavors.length === 0 && (
        <p className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium">
          Buyurtma berish uchun kamida 1 ta ta'm qo'shing!
        </p>
      )}
    </div>
  );
});

OrderSummary.displayName = 'OrderSummary';
