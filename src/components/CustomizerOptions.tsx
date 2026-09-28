'use client';

import React, { memo } from 'react';
import { CustomDrink, Additive } from '@/types';
import { ADDITIVES_DATA } from '@/data/additives';
import { Sparkles, Wind, Snowflake, Candy, Check, Wand2 } from 'lucide-react';

interface CustomizerOptionsProps {
  drink: CustomDrink;
  availableAdditives?: Additive[];
  onChangeName: (name: string) => void;
  onChangeCarbonation: (carb: CustomDrink['carbonation']) => void;
  onChangeIce: (ice: CustomDrink['iceLevel']) => void;
  onChangeSweetness: (sweetness: CustomDrink['sweetnessLevel']) => void;
  onChangeSweetenerType: (type: CustomDrink['sweetenerType']) => void;
  onToggleAdditive: (additive: Additive) => void;
}

const DRINK_NAME_SUGGESTIONS = [
  'Kraft Tropik Shov-shuv',
  'Yozgi Moxito Vulqoni',
  'Energetik Berry Blast',
  'Muzdek Tarvuz Shamoli',
  'Limon-Yalpiz Tetikligi',
  'Kraft Kola Vanil',
  'Ekzotik Mango Shousi',
  'Fitnes Yasmin Detoks',
];

export const CustomizerOptions: React.FC<CustomizerOptionsProps> = memo(({
  drink,
  availableAdditives,
  onChangeName,
  onChangeCarbonation,
  onChangeIce,
  onChangeSweetness,
  onChangeSweetenerType,
  onToggleAdditive,
}) => {
  const generateRandomName = () => {
    const random = DRINK_NAME_SUGGESTIONS[Math.floor(Math.random() * DRINK_NAME_SUGGESTIONS.length)];
    onChangeName(random);
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. Drink Name / Label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">3</span>
            Bankaga Nom Bering (Yorliqda ko'rinadi)
          </label>
          <button
            type="button"
            onClick={generateRandomName}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 transition"
          >
            <Wand2 className="w-3.5 h-3.5" /> G'oya tanlash
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={drink.drinkName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Masalan: Yozgi Mango Moxito..."
            maxLength={32}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono">
            {drink.drinkName.length}/32
          </span>
        </div>
      </div>

      {/* 2. Carbonation (Gazlilik) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-blue-500" /> Gazlilik Darajasi
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none', label: 'Gazsiz', desc: '0% Gaz' },
            { id: 'low', label: 'Yengil', desc: 'Kam gazli' },
            { id: 'medium', label: 'O\'rtacha', desc: 'Klassik' },
            { id: 'high', label: 'Kuchli', desc: 'Maksimal' },
          ].map((item) => {
            const isSelected = drink.carbonation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeCarbonation(item.id as CustomDrink['carbonation'])}
                className={`py-2 px-1.5 rounded-xl border text-center transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                }`}
              >
                <div className="text-xs">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Ice Level (Muz) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Snowflake className="w-3.5 h-3.5 text-cyan-500" /> Muz Miqdori &amp; Salqinlik
          </label>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
            {drink.iceLevel}% Muz
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {([0, 25, 50, 75, 100] as const).map((level) => {
            const isSelected = drink.iceLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChangeIce(level)}
                className={`py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-cyan-300'
                }`}
              >
                {level === 0 ? 'Muzsiz' : `${level}%`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Sweetness & Sweetener */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Candy className="w-3.5 h-3.5 text-rose-500" /> Shirinlik va Shakar turi
          </label>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            {drink.sweetnessLevel}%
          </span>
        </div>

        {/* Sweetness percentage */}
        <div className="grid grid-cols-5 gap-1.5">
          {([0, 25, 50, 75, 100] as const).map((level) => {
            const isSelected = drink.sweetnessLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChangeSweetness(level)}
                className={`py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                }`}
              >
                {level === 0 ? '0%' : `${level}%`}
              </button>
            );
          })}
        </div>

        {/* Sweetener type selector */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {[
            { id: 'sugar', label: 'Tabiiy Shakar' },
            { id: 'stevia', label: 'Stevia (0 kkal)' },
            { id: 'honey', label: 'Tabiiy Asal' },
            { id: 'none', label: 'Shakarsiz' },
          ].map((type) => {
            const isSelected = drink.sweetenerType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onChangeSweetenerType(type.id as CustomDrink['sweetenerType'])}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Additives & Toppings (Boba, Chia, Limon, Yalpiz, Vitamin C...) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Maxsus Qo'shimchalar &amp; Toppinglar
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(availableAdditives || ADDITIVES_DATA).map((additive) => {
            const isSelected = drink.additives.some((a) => a.id === additive.id);
            return (
              <button
                key={additive.id}
                type="button"
                onClick={() => onToggleAdditive(additive)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-transform active:scale-95 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-base">{additive.icon}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {additive.nameUz}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      +{additive.price.toLocaleString()} so'm
                    </div>
                  </div>
                </div>

                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

CustomizerOptions.displayName = 'CustomizerOptions';
