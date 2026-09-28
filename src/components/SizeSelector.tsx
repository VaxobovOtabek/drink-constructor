'use client';

import React, { memo } from 'react';
import { BottleSize } from '@/types';
import { BOTTLE_SIZES } from '@/data/bottleSizes';
import { Check } from 'lucide-react';

interface SizeSelectorProps {
  selectedSize: BottleSize;
  onSelectSize: (size: BottleSize) => void;
  availableSizes?: BottleSize[];
}

export const SizeSelector: React.FC<SizeSelectorProps> = memo(({
  selectedSize,
  onSelectSize,
  availableSizes = BOTTLE_SIZES,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">1</span>
          Banka Hajmini Tanlang
        </label>
        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
          Tavsiya: {selectedSize.recommendedFlavorMg} mg ta'm
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {availableSizes.map((size) => {
          const isSelected = selectedSize.id === size.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`relative p-3.5 rounded-2xl border-2 text-left transition-transform duration-150 active:scale-95 flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300'
              }`}
            >
              {/* Top Row: Tag & Check */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {size.liters}L
                </span>
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"></div>
                )}
              </div>

              {/* Middle: Name */}
              <div className="my-0.5">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {size.nameUz}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Maks: {size.maxCapacityMg} mg
                </p>
              </div>

              {/* Bottom: Price */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {size.basePrice.toLocaleString()} so'm
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

SizeSelector.displayName = 'SizeSelector';
