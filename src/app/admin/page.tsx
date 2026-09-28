'use client';

import React, { useState, useEffect } from 'react';
import { Order, AppSettings } from '@/types';
import {
  getStoredOrders,
  updateOrderStatus,
  updateStoredOrder,
  deleteStoredOrder,
  clearAllStoredOrders,
  getStoredSettings,
  saveStoredSettings,
} from '@/lib/storage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedOrders = getStoredOrders();
    const loadedSettings = getStoredSettings();
    setOrders(loadedOrders);
    setSettings(loadedSettings);

    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, []);

  // 1. Update Status
  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    const updated = updateOrderStatus(orderId, status);
    setOrders(updated);

    const targetOrder = updated.find((o) => o.id === orderId);
    const orderNumber = targetOrder?.orderNumber || orderId;

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          orderId,
          status,
          order: targetOrder,
        }),
      });
    } catch (e) {
      console.error('Failed to sync status update to Telegram / Google Sheets:', e);
    }
  };

  // 2. Edit Order
  const handleEditOrder = async (updatedOrder: Order) => {
    const updatedList = updateStoredOrder(updatedOrder);
    setOrders(updatedList);

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      const data = await res.json();
      if (data.telegramMessageId && data.telegramMessageId !== updatedOrder.telegramMessageId) {
        const withNewMsgId = { ...updatedOrder, telegramMessageId: data.telegramMessageId };
        setOrders(updateStoredOrder(withNewMsgId));
      }
    } catch (e) {
      console.error('Failed to sync edited order to Telegram / Google Sheets:', e);
    }
  };

  // 3. Delete Single Order
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const updatedList = deleteStoredOrder(orderId);
    setOrders(updatedList);

    try {
      await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to sync deleted order to Google Sheets:', e);
    }
  };

  // 4. Clear All Orders
  const handleClearAllOrders = async () => {
    const emptyList = clearAllStoredOrders();
    setOrders(emptyList);

    try {
      await fetch('/api/orders?clearAll=true', {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to clear all orders in Google Sheets:', e);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleRefresh = () => {
    setOrders(getStoredOrders());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar
        orderCount={orders.length}
        isAdminPage={true}
        onLogout={isAuthenticated ? handleLogout : undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Konstruktorga qaytish
          </Link>
        </div>

        {isAuthenticated ? (
          <AdminDashboard
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onClearAllOrders={handleClearAllOrders}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onRefreshOrders={handleRefresh}
          />
        ) : (
          <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}
