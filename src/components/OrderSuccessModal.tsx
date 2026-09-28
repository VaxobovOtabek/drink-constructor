'use client';

import React, { useEffect } from 'react';
import { Order } from '@/types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Send, FileSpreadsheet, ArrowRight, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onNewMix: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onNewMix }) => {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [order]);

  if (!order) return null;

  const item = order.items[0];
  const drink = item.drink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-amber-300 dark:border-amber-900/50 text-center space-y-4 my-6"
      >
        {/* Success Icon */}
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Buyurtma Qabul Qilindi!
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Buyurtma #{order.orderNumber}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Siz yaratgan maxsus banka miksi qabul qilindi va tayyorlashga yuborildi!
          </p>
        </div>

        {/* Sync status chips */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
            <Send className="w-3 h-3" /> Telegram Botga yuborildi
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <FileSpreadsheet className="w-3 h-3" /> Bazaga / Excelga saqlandi
          </span>
        </div>

        {/* Recipe Receipt Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="flex items-center justify-between font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="text-slate-900 dark:text-white text-sm truncate max-w-[220px]">{drink.drinkName}</span>
            <span className="text-amber-600 font-extrabold">{drink.bottleSize.label} x {item.quantity} dona</span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Banka tarkibi (Dozalar):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {drink.flavors.map((f) => (
                <span
                  key={f.flavorId}
                  className="px-2 py-0.5 rounded-lg text-white font-medium text-[10px] flex items-center gap-1"
                  style={{ backgroundColor: f.flavor.color }}
                >
                  {f.flavor.icon} {f.flavor.nameUz}: {f.amountMg} mg
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <div>Muz: <b>{drink.iceLevel}%</b> | Gaz: <b>{drink.carbonation}</b></div>
            <div>Shirinlik: <b>{drink.sweetnessLevel}% ({drink.sweetenerType})</b></div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold">
            <span className="text-slate-700 dark:text-slate-300">Jami to'lov:</span>
            <span className="text-base text-emerald-600 dark:text-emerald-400">
              {order.totalAmount.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="text-left text-xs bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 text-slate-700 dark:text-slate-300 space-y-0.5">
          <div><b>Mijoz:</b> {order.customer.name} ({order.customer.phone})</div>
          <div><b>Yetkazish manzili:</b> {order.customer.address}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" /> Chekni chop etish
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNewMix();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition active:scale-95"
          >
            <span>Yangi Banka Yaratish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
