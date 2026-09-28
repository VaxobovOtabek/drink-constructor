'use client';

import React, { useState, useMemo } from 'react';
import { Order, AppSettings } from '@/types';
import { exportOrdersToExcel } from '@/lib/excel';
import {
  Search,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Check,
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { EditOrderModal } from './EditOrderModal';
import { PriceManagementModal } from './PriceManagementModal';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onEditOrder: (updatedOrder: Order) => void;
  onDeleteOrder: (orderId: string, orderNumber: string) => void;
  onClearAllOrders: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshOrders?: () => void;
  onPricesUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateStatus,
  onEditOrder,
  onDeleteOrder,
  onClearAllOrders,
  settings,
  onSaveSettings,
  onRefreshOrders,
  onPricesUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPricesOpen, setIsPricesOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; orderNumber: string } | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return { totalOrders, totalRevenue, newOrders, completedOrders, avgOrder };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.toLowerCase().includes(query) ||
        order.customer.address.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleExportExcel = () => {
    exportOrdersToExcel(filteredOrders, `ichimlik_banka_buyurtmalari_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      onDeleteOrder(orderToDelete.id, orderToDelete.orderNumber);
      setOrderToDelete(null);
    }
  };

  const handleConfirmClearAll = () => {
    onClearAllOrders();
    setConfirmClearAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🍹 Buyurtmalar Boshqaruvi</span>
            {stats.newOrders > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500 text-white animate-pulse">
                +{stats.newOrders} Yangi!
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bankalar buyurtmasini qabul qilish, tahrirlash, o'chirish va Excel bilan sinxronlash
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRefreshOrders && (
            <button
              type="button"
              onClick={onRefreshOrders}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Yangilash"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Clear All Orders Button */}
          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition"
              title="Barcha buyurtmalarni tozalash"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Barchasini Tozalash</span>
            </button>
          )}

          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Excelga Yuklash (.xlsx)</span>
          </button>

          {/* Price Management Button */}
          <button
            type="button"
            onClick={() => setIsPricesOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
            title="Ichimliklar va qo'shimchalar narxlarini o'zgartirish"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span>Narxlar (Menyu)</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Bot &amp; Sheets</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Jami Buyurtmalar</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalOrders} <span className="text-xs font-normal text-slate-400">ta</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Jami Tushum</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal">so'm</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Kutilayotgan</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            {stats.newOrders} <span className="text-xs font-normal text-slate-400">ta</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">O'rtacha Chek</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgOrder.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ID, mijoz, telefon yoki manzil..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'new', label: 'Yangi' },
            { id: 'preparing', label: 'Jarayonda' },
            { id: 'delivering', label: 'Yetkazilmoqda' },
            { id: 'completed', label: 'Yakunlangan' },
            { id: 'cancelled', label: 'Bekor qilingan' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Buyurtma ID</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Mijoz</th>
                <th className="py-3 px-4">Banka / Retsept</th>
                <th className="py-3 px-4">Summa</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Buyurtmalar topilmadi
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const mainItem = order.items[0];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.customer.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {mainItem.drink.drinkName} ({mainItem.drink.bottleSize.label})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {mainItem.drink.flavors.map((f) => `${f.flavor.nameUz} (${f.amountMg}mg)`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {order.totalAmount.toLocaleString()} so'm
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                          className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="new">🟡 Yangi</option>
                          <option value="preparing">🔵 Tayyorlanmoqda</option>
                          <option value="delivering">🟣 Yetkazilmoqda</option>
                          <option value="completed">🟢 Yakunlandi</option>
                          <option value="cancelled">🔴 Bekor qilindi</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Recipe */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                            title="Retseptni ko'rish"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Order */}
                          <button
                            type="button"
                            onClick={() => setEditingOrder(order)}
                            className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition"
                            title="Buyurtmani tahrirlash"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Order */}
                          <button
                            type="button"
                            onClick={() => setOrderToDelete({ id: order.id, orderNumber: order.orderNumber })}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 transition"
                            title="Buyurtmani o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe & Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-4">
            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-600">Banka Retsepti va Tafsilotlari</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                #{selectedOrderDetails.orderNumber}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                {new Date(selectedOrderDetails.createdAt).toLocaleString('uz-UZ')}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                {selectedOrderDetails.customer.name}
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-mono">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> +998 {selectedOrderDetails.customer.phone}
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedOrderDetails.customer.address}
              </div>
              {selectedOrderDetails.customer.notes && (
                <div className="pt-1 text-amber-600 font-medium">
                  Izoh: {selectedOrderDetails.customer.notes}
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bankalar va Dozalar:
              </h4>

              {selectedOrderDetails.items.map((item, idx) => {
                const drink = item.drink;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>{drink.drinkName}</span>
                      <span className="text-amber-600">{drink.bottleSize.label} x {item.quantity} dona</span>
                    </div>

                    {/* Flavors */}
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium mb-1">Ta'mlar proporsiyasi:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {drink.flavors.map((f) => (
                          <div
                            key={f.flavorId}
                            className="px-2 py-0.5 rounded-lg text-white font-medium text-xs flex items-center gap-1"
                            style={{ backgroundColor: f.flavor.color }}
                          >
                            <span>{f.flavor.icon}</span>
                            <span>{f.flavor.nameUz}:</span>
                            <span className="font-bold">{f.amountMg} mg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-200/50 dark:border-amber-900/40">
                      <div>Gaz: <b>{drink.carbonation}</b></div>
                      <div>Muz: <b>{drink.iceLevel}%</b></div>
                      <div>Shirinlik: <b>{drink.sweetnessLevel}%</b></div>
                    </div>

                    {drink.additives.length > 0 && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Toppinglar: <b>{drink.additives.map((a) => a.nameUz).join(', ')}</b>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                To'lov turi: <b>{selectedOrderDetails.customer.paymentMethod.toUpperCase()}</b>
              </div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                Jami: {selectedOrderDetails.totalAmount.toLocaleString()} so'm
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Buyurtmani o'chirish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <b>#{orderToDelete.orderNumber}</b> buyurtmasi o'chirilsinmi? (Google Sheets'dan ham qatori o'chiriladi)
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900/60 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Barcha buyurtmalarni tozalash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Barcha buyurtmalar o'chirib tashlanadi va Google Sheets jadvali ham tozalab tashlanadi. Tasdiqlaysizmi?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={onEditOrder}
      />

      {/* Price Management Modal */}
      <PriceManagementModal
        isOpen={isPricesOpen}
        onClose={() => setIsPricesOpen(false)}
        onPricesUpdated={onPricesUpdated}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={onSaveSettings}
      />
    </div>
  );
};
