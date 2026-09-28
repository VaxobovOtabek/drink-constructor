'use client';

import React, { useState, useEffect } from 'react';
import { Order, CustomerInfo } from '@/types';
import { X, Check, User, Phone, MapPin, CreditCard, DollarSign, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'payme',
  });
  const [status, setStatus] = useState<Order['status']>('new');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        name: order.customer.name,
        phone: String(order.customer.phone).replace(/\D/g, '').slice(-9),
        address: order.customer.address,
        notes: order.customer.notes || '',
        paymentMethod: order.customer.paymentMethod,
      });
      setStatus(order.status);
      setTotalAmount(order.totalAmount);
      setErrorMsg(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phone: cleaned });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Mijoz ismini kiriting');
      return;
    }
    if (formData.phone.length !== 9) {
      setErrorMsg('Telefon raqamini 9 ta raqamda kiriting (Masalan: 901234567)');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Manzilni kiriting');
      return;
    }

    setIsSubmitting(true);

    const updatedOrder: Order = {
      ...order,
      customer: {
        ...formData,
        phone: formData.phone.trim(),
      },
      status,
      totalAmount,
    };

    onSave(updatedOrder);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Tahrirlash Paneli
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Buyurtma #{order.orderNumber}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mijoz ma'lumotlari yoki holatini o'zgartiring (Online Excelga ham sinxron bo'ladi)
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Customer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-amber-500" /> Mijoz Ismi
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> Telefon raqami
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{formData.phone.length}/9</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2">
                +998
              </span>
              <input
                type="tel"
                maxLength={9}
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="901234567"
                className="w-full pl-16 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Yetkazish manzili
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Izoh
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status & Payment Method in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Holati (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order['status'])}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="new">🟡 Yangi</option>
                <option value="preparing">🔵 Tayyorlanmoqda</option>
                <option value="delivering">🟣 Yetkazilmoqda</option>
                <option value="completed">🟢 Yakunlandi</option>
                <option value="cancelled">🔴 Bekor qilindi</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                To'lov turi
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as CustomerInfo['paymentMethod'] })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="payme">Payme</option>
                <option value="click">Click</option>
                <option value="uzum">Uzum</option>
                <option value="cash">Naqd</option>
              </select>
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Jami summa (so'm)
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Saqlash &amp; Excelga Sinxronlash
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
