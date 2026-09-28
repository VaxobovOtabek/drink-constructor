'use client';

import React, { useState } from 'react';
import { AppSettings } from '@/types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '@/lib/excel';
import { X, Send, FileSpreadsheet, Check, Copy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'telegram' | 'sheets'>('telegram');
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleTestTelegram = async () => {
    if (!formData.telegramBotToken || !formData.telegramChatId) {
      setTelegramStatus({ success: false, message: 'Iltimos, Bot Token va Chat ID ni kiriting!' });
      return;
    }

    setIsTestingTelegram(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/telegram-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: formData.telegramBotToken,
          chatId: formData.telegramChatId,
        }),
      });

      const data = await res.json();
      if (data.ok || data.success) {
        setTelegramStatus({ success: true, message: '✅ Test xabar muvaffaqiyatli yuborildi!' });
      } else {
        setTelegramStatus({ success: false, message: `❌ Xatolik: ${data.description || data.error || 'Ulanib bo\'lmadi'}` });
      }
    } catch (e: any) {
      setTelegramStatus({ success: false, message: `❌ Tarmoq xatosi: ${e.message}` });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Integratsiya va Bildirishnoma Sozlamalari
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Telegram Bot va Google Sheets (Online Excel) avtomatik sinxronizatsiyasini sozlang
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'telegram'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Send className="w-4 h-4" /> Telegram Bot Ulanishi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sheets'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Google Sheets / Online Excel
          </button>
        </div>

        {activeTab === 'telegram' ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Telegram bot qanday ulanadi?
              </p>
              <p>1. Telegramda <b>@BotFather</b> orqali yangi bot oching va <b>API Token</b> oling.</p>
              <p>2. Botni o'z guruh/kanalingizga qo'shing yoki botga <code>/start</code> bosing.</p>
              <p>3. <b>@userinfobot</b> yoki <b>@getmyid_bot</b> orqali o'z <b>Chat ID</b> raqamingizni oling.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                placeholder="Masalan: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Telegram Chat ID / Guruh ID
              </label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                placeholder="Masalan: 123456789 yoki -100123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {telegramStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  telegramStatus.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {telegramStatus.message}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram}
                className="py-2.5 px-4 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTestingTelegram ? 'Yuborilmoqda...' : 'Test xabar yuborish'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Google Sheets avtomatik tushish yo'riqnomasi:
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Google Drive'da yangi <b>Google Sheets</b> oching.</li>
                <li>Menyudan <b>Extensions &gt; Apps Script</b> ni bosing.</li>
                <li>Quyidagi tayyor script kodini nusxalab joylang.</li>
                <li><b>Deploy &gt; New deployment &gt; Web app</b> ni tanlang (Access: Anyone).</li>
                <li>Hosil bo'lgan <b>Web App URL</b> manzilini pastdagi maydonga qo'ying.</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Google Apps Script Kodi
                </label>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Nusxalandi!' : 'Kodni nusxalash'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono max-h-36 overflow-y-auto select-all">
                {GOOGLE_APPS_SCRIPT_TEMPLATE}
              </pre>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Google Sheets Webhook URL
              </label>
              <input
                type="url"
                value={formData.googleSheetsWebhookUrl}
                onChange={(e) => setFormData({ ...formData, googleSheetsWebhookUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Sozlamalarni Saqlash
          </button>
        </div>
      </motion.div>
    </div>
  );
};
