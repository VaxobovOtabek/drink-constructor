'use client';

import React, { useState } from 'react';
import { CustomDrink, CustomerInfo, Order } from '@/types';
import { X, Check, MapPin, Phone, User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  drink: CustomDrink;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  drink,
  onOrderSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'payme',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = drink.totalPrice * quantity;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit strictly to 9 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phone: cleaned });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Iltimos, ismingizni kiriting');
      return;
    }
    if (formData.phone.trim().length !== 9) {
      setErrorMsg('Iltimos, telefon raqamingizni to\'liq 9 ta raqamda kiriting (Namuna: 901234567)');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Iltimos, yetkazib berish manzilini kiriting');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CAN-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        ...formData,
        phone: formData.phone.trim(), // Stored cleanly as 979053031
      },
      items: [
        {
          drink,
          quantity,
        },
      ],
      totalAmount,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      // Send to server API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      const data = await res.json();
      const finalizedOrder: Order = {
        ...newOrder,
        syncedTelegram: data.syncedTelegram || false,
        telegramMessageId: data.telegramMessageId,
        telegramChatId: data.telegramChatId,
        syncedExcel: data.syncedExcel || false,
      };

      onOrderSuccess(finalizedOrder);
    } catch (err: any) {
      console.error('Order submission error:', err);
      onOrderSuccess(newOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Buyurtmani Rasmiylashtirish
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Yetkazib Berish Ma'lumotlari
          </h2>
        </div>

        {/* Mini Drink Preview Card */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-3 border border-amber-200/80 dark:border-amber-900/50 mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[240px]">
              {drink.drinkName || 'Maxsus Banka'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {drink.bottleSize.label} • {drink.flavors.map((f) => f.flavor.nameUz).join(' + ')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Dona narxi</div>
            <div className="font-bold text-sm text-amber-600 dark:text-amber-400">
              {drink.totalPrice.toLocaleString()} so'm
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Bankalar soni (dona):
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100"
              >
                -
              </button>
              <span className="font-black text-base w-4 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-amber-500" /> Ismingiz
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: Sardor Rahimov"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* Customer Phone (9-digit exact mask) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> Telefon raqamingiz
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.phone.length}/9 raqam
              </span>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-700 pr-2.5">
                <span>🇺🇿</span>
                <span>+998</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={9}
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="901234567"
                className="w-full pl-20 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold tracking-wider text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Faqat 9 ta raqam kiriting (Namuna: <b>901234567</b> yoki <b>979054040</b>)
            </p>
          </div>

          {/* Customer Address */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Yetkazib berish manzili
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Shahar, tuman, ko'cha, uy yoki mo'ljal..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* Order Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Qo'shimcha izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Muzdek qilib yetkazing..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" /> To'lov usuli
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'payme', label: 'Payme' },
                { id: 'click', label: 'Click' },
                { id: 'uzum', label: 'Uzum' },
                { id: 'cash', label: 'Naqd' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: m.id as CustomerInfo['paymentMethod'] })}
                  className={`py-2 rounded-xl border text-xs font-bold transition-colors ${
                    formData.paymentMethod === m.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-400">Jami to'lov:</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {totalAmount.toLocaleString()} so'm
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Yuborilmoqda...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Buyurtmani Tasdiqlash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
