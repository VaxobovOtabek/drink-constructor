import { Order, AppSettings, BottleSize, Flavor, Additive } from '@/types';
import { BOTTLE_SIZES } from '@/data/bottleSizes';
import { FLAVORS_DATA } from '@/data/flavors';
import { ADDITIVES_DATA } from '@/data/additives';

const STORAGE_KEYS = {
  ORDERS: 'drink_constructor_orders',
  SETTINGS: 'drink_constructor_settings',
  BOTTLE_SIZES: 'drink_constructor_bottle_sizes',
  FLAVORS: 'drink_constructor_flavors',
  ADDITIVES: 'drink_constructor_additives',
};

export const DEFAULT_SETTINGS: AppSettings = {
  telegramBotToken: '',
  telegramChatId: '',
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbxASju6tZ2b9k6bIc6MoVo7NHqVinZpb7ismNfyZGWfm9Plc4p1oSA0tlSxAFrOPWKx/exec',
  notifyOnNewOrder: true,
  businessName: 'FreshMix Craft Drinks',
  phone: '+998 90 123 45 67',
};

export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'MIX-8492',
    customer: {
      name: 'Sherzod Aliyev',
      phone: '901234567',
      address: 'Toshkent sh., Yunusobod tumani, 4-mavze, 12-uy',
      notes: 'Muzdek qilib tezroq yetkazing',
      paymentMethod: 'payme',
    },
    items: [
      {
        drink: {
          drinkName: 'Yozgi Qulupnay Moxito',
          bottleSize: BOTTLE_SIZES[1], // 1.0L
          flavors: [
            { flavorId: 'strawberry', flavor: FLAVORS_DATA[0], amountMg: 600 },
            { flavorId: 'lemon_mint', flavor: FLAVORS_DATA[1], amountMg: 400 },
          ],
          carbonation: 'high',
          iceLevel: 75,
          sweetnessLevel: 50,
          sweetenerType: 'sugar',
          additives: [ADDITIVES_DATA[2], ADDITIVES_DATA[3]], // Mint + Lemon slice
          totalPrice: 28000,
          totalCalories: 95,
          totalFlavorMg: 1000,
        },
        quantity: 2,
      },
    ],
    totalAmount: 56000,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    syncedTelegram: true,
    syncedExcel: true,
  },
  {
    id: 'ord-1002',
    orderNumber: 'MIX-8493',
    customer: {
      name: 'Malika Karimova',
      phone: '977654321',
      address: 'Toshkent sh., Mirobod tumani, Nukus ko\'chasi, 24-uy',
      notes: 'Iltimos, eshik qo\'ng\'irog\'ini chaling',
      paymentMethod: 'click',
    },
    items: [
      {
        drink: {
          drinkName: 'Tropik Mango Boba Blast',
          bottleSize: BOTTLE_SIZES[2], // 1.5L
          flavors: [
            { flavorId: 'mango_passion', flavor: FLAVORS_DATA[2], amountMg: 800 },
            { flavorId: 'peach_blossom', flavor: FLAVORS_DATA[6], amountMg: 500 },
          ],
          carbonation: 'medium',
          iceLevel: 50,
          sweetnessLevel: 75,
          sweetenerType: 'sugar',
          additives: [ADDITIVES_DATA[0]], // Boba
          totalPrice: 38000,
          totalCalories: 160,
          totalFlavorMg: 1300,
        },
        quantity: 1,
      },
      {
        drink: {
          drinkName: 'Ko\'k Choy & Yasmin Fit',
          bottleSize: BOTTLE_SIZES[0], // 0.5L
          flavors: [
            { flavorId: 'green_tea_jasmine', flavor: FLAVORS_DATA[7], amountMg: 400 },
          ],
          carbonation: 'none',
          iceLevel: 25,
          sweetnessLevel: 25,
          sweetenerType: 'stevia',
          additives: [ADDITIVES_DATA[4]], // Vitamin C
          totalPrice: 19500,
          totalCalories: 15,
          totalFlavorMg: 400,
        },
        quantity: 1,
      }
    ],
    totalAmount: 57500,
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    syncedTelegram: true,
    syncedExcel: false,
  },
];

// --- ORDERS STORAGE ---
export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_MOCK_ORDERS));
      return INITIAL_MOCK_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

export function addStoredOrder(order: Order): Order[] {
  const current = getStoredOrders();
  const updated = [order, ...current];
  saveStoredOrders(updated);
  return updated;
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  const current = getStoredOrders();
  const updated = current.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
  saveStoredOrders(updated);
  return updated;
}

export function updateStoredOrder(updatedOrder: Order): Order[] {
  const current = getStoredOrders();
  const updated = current.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord));
  saveStoredOrders(updated);
  return updated;
}

export function deleteStoredOrder(orderId: string): Order[] {
  const current = getStoredOrders();
  const updated = current.filter((ord) => ord.id !== orderId);
  saveStoredOrders(updated);
  return updated;
}

export function clearAllStoredOrders(): Order[] {
  saveStoredOrders([]);
  return [];
}

// --- SETTINGS STORAGE ---
export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// --- DYNAMIC PRICES STORAGE (BOTTLE SIZES, FLAVORS, ADDITIVES) ---

export function getStoredBottleSizes(): BottleSize[] {
  if (typeof window === 'undefined') return BOTTLE_SIZES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOTTLE_SIZES);
    if (!raw) return BOTTLE_SIZES;
    return JSON.parse(raw);
  } catch {
    return BOTTLE_SIZES;
  }
}

export function saveStoredBottleSizes(sizes: BottleSize[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOTTLE_SIZES, JSON.stringify(sizes));
  } catch (e) {
    console.error('Failed to save bottle sizes:', e);
  }
}

export function getStoredFlavors(): Flavor[] {
  if (typeof window === 'undefined') return FLAVORS_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLAVORS);
    if (!raw) return FLAVORS_DATA;
    return JSON.parse(raw);
  } catch {
    return FLAVORS_DATA;
  }
}

export function saveStoredFlavors(flavors: Flavor[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FLAVORS, JSON.stringify(flavors));
  } catch (e) {
    console.error('Failed to save flavors:', e);
  }
}

export function getStoredAdditives(): Additive[] {
  if (typeof window === 'undefined') return ADDITIVES_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADDITIVES);
    if (!raw) return ADDITIVES_DATA;
    return JSON.parse(raw);
  } catch {
    return ADDITIVES_DATA;
  }
}

export function saveStoredAdditives(additives: Additive[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADDITIVES, JSON.stringify(additives));
  } catch (e) {
    console.error('Failed to save additives:', e);
  }
}

export function resetStoredPricesToDefault(): {
  sizes: BottleSize[];
  flavors: Flavor[];
  additives: Additive[];
} {
  saveStoredBottleSizes(BOTTLE_SIZES);
  saveStoredFlavors(FLAVORS_DATA);
  saveStoredAdditives(ADDITIVES_DATA);
  return {
    sizes: BOTTLE_SIZES,
    flavors: FLAVORS_DATA,
    additives: ADDITIVES_DATA,
  };
}
