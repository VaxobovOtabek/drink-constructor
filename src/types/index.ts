export interface Flavor {
  id: string;
  name: string;
  nameUz: string;
  category: 'fruit' | 'citrus' | 'exotic' | 'tea' | 'energy' | 'berry';
  color: string;
  secondaryColor: string;
  pricePerMg: number; // in UZS per 100mg
  caloriesPer100Mg: number;
  icon: string;
  description: string;
  defaultMg: number;
  maxMg: number;
}

export interface Additive {
  id: string;
  name: string;
  nameUz: string;
  price: number;
  icon: string;
  color: string;
  calories: number;
}

export interface BottleSize {
  id: '0.5' | '1.0' | '1.5' | '2.0';
  liters: number;
  label: string;
  nameUz: string;
  basePrice: number;
  maxCapacityMg: number;
  recommendedFlavorMg: number;
  heightRatio: number;
  widthRatio: number;
}

export interface SelectedFlavor {
  flavorId: string;
  flavor: Flavor;
  amountMg: number; // Milligrams (e.g. 500mg, 1200mg)
}

export interface CustomDrink {
  drinkName: string;
  bottleSize: BottleSize;
  flavors: SelectedFlavor[];
  carbonation: 'none' | 'low' | 'medium' | 'high';
  iceLevel: 0 | 25 | 50 | 75 | 100;
  sweetnessLevel: 0 | 25 | 50 | 75 | 100;
  sweetenerType: 'sugar' | 'stevia' | 'honey' | 'none';
  additives: Additive[];
  totalPrice: number;
  totalCalories: number;
  totalFlavorMg: number;
}

export interface OrderItem {
  drink: CustomDrink;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: 'cash' | 'click' | 'payme' | 'uzum';
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: 'new' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  syncedTelegram?: boolean;
  syncedExcel?: boolean;
  telegramMessageId?: number;
  telegramChatId?: string;
}

export interface AppSettings {
  telegramBotToken: string;
  telegramChatId: string;
  googleSheetsWebhookUrl: string;
  notifyOnNewOrder: boolean;
  businessName: string;
  phone: string;
}
