'use client';

import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomDrink } from '@/types';
import { Sparkles, Snowflake, Wind } from 'lucide-react';

interface BottleVisualizerProps {
  drink: CustomDrink;
  isPouring?: boolean;
}

export const BottleVisualizer: React.FC<BottleVisualizerProps> = memo(({ drink, isPouring = false }) => {
  const { bottleSize, flavors, carbonation, iceLevel, additives, drinkName } = drink;

  // Calculate total capacity percentage filled by flavors
  const totalFlavorMg = drink.totalFlavorMg;
  const maxMg = bottleSize.maxCapacityMg;
  const fillPercentage = Math.min(Math.max((totalFlavorMg / maxMg) * 100, 18), 92);

  // Compute blended color and layers
  const flavorLayers = useMemo(() => {
    if (flavors.length === 0) {
      return [{ color: '#38BDF8', secondary: '#7DD3FC', heightPct: 100, name: 'Toza Suv', icon: '💧' }];
    }
    const total = flavors.reduce((acc, f) => acc + f.amountMg, 0);
    return flavors.map((f) => ({
      color: f.flavor.color,
      secondary: f.flavor.secondaryColor,
      heightPct: (f.amountMg / total) * 100,
      name: f.flavor.nameUz,
      icon: f.flavor.icon,
      mg: f.amountMg,
    }));
  }, [flavors]);

  // Overall primary blended color for glow effect
  const primaryColor = flavors.length > 0 ? flavors[0].flavor.color : '#E11D48';

  // Static bubble configurations based on carbonation
  const bubbleCount = useMemo(() => {
    switch (carbonation) {
      case 'none': return 0;
      case 'low': return 8;
      case 'medium': return 16;
      case 'high': return 26;
      default: return 12;
    }
  }, [carbonation]);

  // Ice cube count based on ice level
  const iceCount = Math.round((iceLevel / 100) * 5);

  // Dynamic can proportions based on selected volume
  const canDimensionClass = useMemo(() => {
    switch (bottleSize.id) {
      case '0.5': return 'w-48 h-[390px]'; // Classic 0.5L sleek can
      case '1.0': return 'w-56 h-[420px]'; // 1.0L Tallboy can
      case '1.5': return 'w-64 h-[440px]'; // 1.5L King can
      case '2.0': return 'w-72 h-[460px]'; // 2.0L Party can
      default: return 'w-48 h-[390px]';
    }
  }, [bottleSize.id]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 select-none w-full">
      
      {/* Background ambient glowing gradient */}
      <div
        className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-25 dark:opacity-40 transition-colors duration-500 pointer-events-none -z-10"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Pouring Liquid Animation Stream */}
      <AnimatePresence>
        {isPouring && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0, y: -20 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute -top-3 z-40 w-3.5 rounded-full overflow-hidden"
            style={{
              height: '70px',
              background: `linear-gradient(to bottom, ${primaryColor}, #ffffff99)`,
              boxShadow: `0 0 16px ${primaryColor}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* CAN CONTAINER (0.5L Coca-Cola Style Aluminum Can) */}
      <div className={`relative ${canDimensionClass} transition-all duration-300 flex flex-col items-center justify-end`}>
        
        {/* --- TOP CAN RIM & PULL TAB (OCHQICH) --- */}
        <div className="w-[84%] relative flex flex-col items-center z-20">
          
          {/* Metallic Pull-Tab Ring (Ochqich) */}
          <div className="relative -mb-1 z-30 flex items-center justify-center">
            <div className="w-9 h-3.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full border border-slate-400 shadow-md flex items-center justify-between px-1">
              <div className="w-2 h-2 rounded-full border border-slate-400 bg-slate-200 shadow-inner"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shadow-xs"></div>
            </div>
          </div>

          {/* Upper Metallic Bevel Rim */}
          <div className="w-full h-4 bg-gradient-to-r from-slate-400 via-slate-100 via-slate-200 to-slate-500 rounded-t-[1.4rem] border-t-2 border-x-2 border-slate-200/90 shadow-lg relative overflow-hidden flex items-center justify-center">
            {/* Metal rim highlight */}
            <div className="absolute inset-x-3 top-0.5 h-0.5 bg-white/80 rounded-full"></div>
            <div className="w-2/3 h-1.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full border-b border-slate-400/50"></div>
          </div>

          {/* Tapered Chime / Shoulder */}
          <div className="w-[94%] h-3 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 border-x border-slate-300"></div>
        </div>

        {/* --- MAIN CAN BODY --- */}
        <div className="relative w-full flex-1 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 rounded-[1.8rem] border-2 border-slate-300/80 dark:border-slate-600 shadow-2xl overflow-hidden flex flex-col justify-end p-2">
          
          {/* Outer Aluminum Metallic Shimmer Highlight */}
          <div className="absolute inset-0 pointer-events-none z-30 opacity-40 metal-shine"></div>
          
          {/* Vertical Metal Edge Reflections */}
          <div className="absolute left-2 top-0 bottom-0 w-3 bg-gradient-to-r from-white/70 via-white/20 to-transparent pointer-events-none z-30"></div>
          <div className="absolute right-2 top-0 bottom-0 w-3 bg-gradient-to-l from-white/60 via-white/10 to-transparent pointer-events-none z-30"></div>

          {/* Condensation Cold Drops (Muzdek terlagan tomchilar) */}
          <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden opacity-60">
            <span className="absolute w-1 h-2 rounded-full bg-white/80 left-4 top-10 shadow-xs"></span>
            <span className="absolute w-1.5 h-3 rounded-full bg-white/70 left-5 top-28"></span>
            <span className="absolute w-1 h-1.5 rounded-full bg-white/80 right-6 top-16"></span>
            <span className="absolute w-1.5 h-3.5 rounded-full bg-white/70 right-5 top-36"></span>
            <span className="absolute w-1 h-2 rounded-full bg-white/80 left-8 bottom-16"></span>
          </div>

          {/* Volume Measurement Indicators */}
          <div className="absolute left-3.5 top-6 bottom-6 flex flex-col justify-between z-25 opacity-50 text-[9px] font-mono font-bold text-slate-800 dark:text-slate-200 pointer-events-none">
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-600 dark:bg-slate-300"></span>{bottleSize.label}</div>
            <div className="flex items-center gap-1"><span className="w-2 h-0.5 bg-slate-600 dark:bg-slate-300"></span>{(bottleSize.liters * 0.75).toFixed(1)}L</div>
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-600 dark:bg-slate-300"></span>{(bottleSize.liters * 0.5).toFixed(1)}L</div>
            <div className="flex items-center gap-1"><span className="w-2 h-0.5 bg-slate-600 dark:bg-slate-300"></span>{(bottleSize.liters * 0.25).toFixed(1)}L</div>
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-600 dark:bg-slate-300"></span>Min</div>
          </div>

          {/* --- INNER FLUID VIEWPORT --- */}
          <div
            className="w-full relative rounded-b-[1.5rem] rounded-t-lg overflow-hidden flex flex-col-reverse shadow-inner transition-all duration-300 ease-out"
            style={{ height: `${fillPercentage}%`, transform: 'translateZ(0)' }}
          >
            {/* Top Wavy Liquid Surface (Smooth GPU Animation) */}
            <div className="absolute top-0 left-0 right-0 h-4 -mt-2 z-20 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="w-[200%] h-full animate-fluid-wave opacity-80"
                style={{ fill: flavorLayers[flavorLayers.length - 1]?.color || primaryColor }}
              >
                <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
              </svg>
            </div>

            {/* Fluid Flavor Layers */}
            {flavorLayers.map((layer, index) => (
              <div
                key={index}
                className="w-full relative transition-all duration-300"
                style={{
                  height: `${layer.heightPct}%`,
                  background: `linear-gradient(180deg, ${layer.secondary} 0%, ${layer.color} 100%)`,
                  opacity: 0.95,
                }}
              >
                {index < flavorLayers.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-black/15"></div>
                )}
              </div>
            ))}

            {/* Floating Ice Cubes */}
            {Array.from({ length: iceCount }).map((_, i) => (
              <div
                key={`ice-${i}`}
                className="absolute z-20 w-6 h-6 rounded-md bg-white/50 backdrop-blur-xs border border-white/80 shadow-xs"
                style={{
                  left: `${18 + (i * 20) % 60}%`,
                  top: `${14 + (i * 18) % 55}%`,
                  transform: `rotate(${(i * 38) % 90}deg)`,
                  transition: 'top 0.4s ease',
                }}
              >
                <div className="absolute inset-0.5 border-t border-l border-white/90 rounded-xs"></div>
              </div>
            ))}

            {/* Floating Garnishes */}
            {additives.some((a) => a.id === 'lemon_slice') && (
              <div
                className="absolute z-20 w-8 h-8 rounded-full bg-yellow-400/90 border-2 border-yellow-100 flex items-center justify-center text-xs shadow-md"
                style={{ right: '18%', top: '22%' }}
              >
                🍋
              </div>
            )}

            {additives.some((a) => a.id === 'fresh_mint') && (
              <div
                className="absolute z-20 text-base drop-shadow"
                style={{ left: '26%', top: '16%' }}
              >
                🌿
              </div>
            )}

            {additives.some((a) => a.id === 'boba_pearls') && (
              <div className="absolute bottom-1.5 inset-x-3 flex flex-wrap gap-1 justify-center z-20">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`boba-${i}`}
                    className="w-3 h-3 rounded-full bg-amber-600 border border-amber-300 shadow-xs"
                  />
                ))}
              </div>
            )}

            {additives.some((a) => a.id === 'chia_seeds') && (
              <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={`chia-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-gray-950/70"
                    style={{
                      left: `${(i * 19) % 90}%`,
                      top: `${(i * 14) % 90}%`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pure CSS Hardware-Accelerated Rising Carbonation Fizz Bubbles */}
            {Array.from({ length: bubbleCount }).map((_, i) => {
              const drift = (i % 2 === 0 ? 5 : -5) + (i % 3);
              const duration = 2.0 + (i % 4) * 0.4;
              const delay = (i * 0.18) % 2;
              return (
                <div
                  key={`bubble-${i}`}
                  className="absolute rounded-full bg-white/90 border border-white bubble-particle z-20 pointer-events-none"
                  style={{
                    width: `${3 + (i % 3) * 1.5}px`,
                    height: `${3 + (i % 3) * 1.5}px`,
                    left: `${10 + (i * 11) % 80}%`,
                    bottom: '4px',
                    ['--drift-x' as string]: `${drift}px`,
                    ['--duration' as string]: `${duration}s`,
                    ['--delay' as string]: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* --- CAN CENTER BRAND LABEL --- */}
          <div className="absolute inset-x-4 top-[35%] z-30 bg-slate-900/90 dark:bg-slate-950/90 text-white rounded-2xl p-2.5 shadow-xl border border-slate-700 backdrop-blur-md text-center transform hover:scale-[1.02] transition-transform duration-200">
            <div className="text-[8px] uppercase tracking-widest text-amber-400 font-extrabold flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Craft Soda • {bottleSize.label}
            </div>
            <h4 className="font-black text-xs sm:text-sm text-white truncate leading-tight mt-0.5 tracking-tight">
              {drinkName || 'Mening Maxsus Bankam'}
            </h4>
            <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1 pt-1 border-t border-slate-700/80 font-semibold">
              <span>{carbonation.toUpperCase()}</span>
              <span className="text-amber-400">{totalFlavorMg} mg</span>
            </div>
          </div>
        </div>

        {/* --- BOTTOM CAN CHIME & RIM --- */}
        <div className="w-[88%] h-4 bg-gradient-to-r from-slate-400 via-slate-100 via-slate-200 to-slate-500 rounded-b-[1.4rem] border-b-2 border-x-2 border-slate-400/80 shadow-md relative overflow-hidden flex items-center justify-center z-20">
          <div className="w-3/5 h-1 bg-slate-300/80 rounded-full"></div>
        </div>

        {/* Can Table Shadow */}
        <div className="w-4/5 h-3 bg-black/25 dark:bg-black/50 rounded-full blur-sm mt-1"></div>
      </div>

      {/* Flavor breakdown badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
        {flavors.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Hali ta'm qo'shilmadi (suv bazasi)
          </span>
        ) : (
          flavors.map((f) => (
            <div
              key={f.flavorId}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full text-white font-bold shadow-xs transition-transform hover:scale-105"
              style={{ backgroundColor: f.flavor.color }}
            >
              <span>{f.flavor.icon}</span>
              <span>{f.flavor.nameUz}</span>
              <span className="bg-black/25 px-1 rounded text-[10px]">{f.amountMg}mg</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

BottleVisualizer.displayName = 'BottleVisualizer';
