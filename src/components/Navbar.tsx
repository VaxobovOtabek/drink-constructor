'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, GlassWater } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  orderCount?: number;
  onResetConstructor?: () => void;
  onLogout?: () => void;
  isAdminPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  orderCount = 0,
  onResetConstructor,
  onLogout,
  isAdminPage = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
            <GlassWater className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Fresh<span className="text-amber-500">Mix</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                0.5L Can
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-1">
              Kraft Ichimlik Konstruktori
            </p>
          </div>
        </Link>

        {/* Navigation & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {onResetConstructor && (
            <button
              onClick={onResetConstructor}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Konstruktorni tozalash"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yangi Banka</span>
            </button>
          )}

          {/* Admin link / Logout */}
          {isAdminPage && onLogout ? (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-xs font-bold hover:bg-red-100 transition"
            >
              Chiqish (Logout)
            </button>
          ) : (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white font-bold text-xs shadow-sm transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
              {orderCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {orderCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
