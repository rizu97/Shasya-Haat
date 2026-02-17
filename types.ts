
export type ProductUnit = 'pcs' | 'kg' | 'g' | 'l' | 'ml';

export interface StockBatch {
  id: string;
  quantity: number;
  expiryDate?: string; // ISO Date
  addedAt: string; // ISO Date
  costPrice?: number; // Optional override per batch
}

export interface Product {
  id: string;
  name: string; // English
  nameBn: string; // Bengali
  mrp: number; // Max Retail Price
  costPrice: number; // Purchase Price (for profit calc)
  quantity: number; // Total quantity (sum of batches)
  batches: StockBatch[]; // FIFO tracking
  expiryDate?: string; // Nearest expiry date (calculated)
  unit: ProductUnit;
  category: 'packet' | 'loose';
  fillLevel?: number; // 0-100 for loose items
  addedAt: string; // ISO Date string
  image?: string; // Base64 string
  isSynced?: boolean; // Offline sync flag
}

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  quantity: number;
  unit: ProductUnit;
  salePrice: number; // Total price (MRP * quantity)
  profit: number; // Calculated profit
  timestamp: string;
  isSynced?: boolean; // Offline sync flag
}

export interface ScannedData {
  name: string;
  mrp?: number;
  expiryDate?: string;
  confidence: number;
  image?: string; // Base64 captured image
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string; // ISO string
  read: boolean;
  action?: string; // e.g. 'INVENTORY'
}

export interface Translation {
  en: string;
  bn: string;
}

export interface AppSettings {
  shopName: string;
  gstNumber: string;
  mobile: string;
  ownerName?: string;
  lowStockThreshold: number;
  nearExpiryDays: number;
  language: 'en' | 'bn';
  theme: 'dark' | 'light' | 'system';
}

export type InventoryFilter = 'ALL' | 'EXPIRED' | 'EXPIRING_SOON' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export enum AppView {
  AUTH_SELECTION = 'auth_selection',
  REGISTER_SHOP = 'register_shop',
  VERIFY_PHONE = 'verify_phone',
  LOGIN = 'login',
  LOGIN_OTP = 'login_otp',
  DASHBOARD = 'dashboard',
  SCANNER = 'scanner',
  INVENTORY = 'inventory',
  ADD_MANUAL = 'add_manual',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  TRADE = 'trade',
  MORE = 'more'
}
export interface ShopDetails {
  name: string;
  address: string;
  gst?: string;
}

export interface AuthUser {
  mobile: string;
  role: 'SHOP_OWNER' | 'SALES_EXECUTIVE';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

/** Auth flow stages used by useAuth hook */
export type AuthFlowState = 'LANDING' | 'AUTH_FLOW' | 'AUTHENTICATED';
