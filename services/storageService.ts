/**
 * @deprecated This service uses localStorage and is kept ONLY for the one-time
 * migration to IndexedDB (see useInventory.ts loadData). All new code should
 * use dbService from src/services/db.ts instead.
 */
import { Product, SaleRecord, AppSettings } from '../types';

const STORAGE_KEY = 'kiranaklick_inventory_v1';
const SALES_KEY = 'kiranaklick_sales_v1';
const SETTINGS_KEY = 'kiranaklick_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  shopName: '',
  gstNumber: '',
  mobile: '',
  ownerName: '',
  lowStockThreshold: 5,
  nearExpiryDays: 30,
  language: 'en',
  theme: 'dark'
};

export const StorageService = {
  getInventory: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load inventory", e);
      return [];
    }
  },

  saveInventory: (inventory: Product[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      return true;
    } catch (e) {
      console.error("Failed to save inventory", e);
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert("Storage Full! Cannot save data. Please delete old items or sales.");
      }
      return false;
    }
  },

  addProduct: (product: Product): boolean => {
    const current = StorageService.getInventory();
    const newProduct = { ...product, isSynced: false }; // Default unsynced
    const updated = [newProduct, ...current];
    return StorageService.saveInventory(updated);
  },

  updateProduct: (product: Product): boolean => {
    const current = StorageService.getInventory();
    // Mark as unsynced on update to trigger re-sync
    const updated = current.map(p => p.id === product.id ? { ...product, isSynced: false } : p);
    return StorageService.saveInventory(updated);
  },

  deleteProduct: (id: string): boolean => {
    const current = StorageService.getInventory();
    const updated = current.filter(p => p.id !== id);
    return StorageService.saveInventory(updated);
  },

  getSales: (): SaleRecord[] => {
    try {
      const data = localStorage.getItem(SALES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load sales", e);
      return [];
    }
  },

  saveSales: (sales: SaleRecord[]): boolean => {
    try {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
      return true;
    } catch (e) {
      console.error("Failed to save sales", e);
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert("Storage Full! Cannot save sale record.");
      }
      return false;
    }
  },

  addSale: (sale: SaleRecord): boolean => {
    const current = StorageService.getSales();
    const newSale = { ...sale, isSynced: false }; // Default unsynced
    const updated = [newSale, ...current];
    return StorageService.saveSales(updated);
  },

  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  },

  // TODO: Replace with real backend API sync when a backend is available.
  // This is a no-op stub — no actual network request is made.
  syncPendingData: async (): Promise<{ syncedProducts: number, syncedSales: number }> => {
    console.warn('[StorageService] syncPendingData is a stub. No backend configured.');
    return { syncedProducts: 0, syncedSales: 0 };
  },

  // Notifications
  getNotifications: (): import('../types').Notification[] => {
    try {
      const data = localStorage.getItem('kiranaklick_notifications_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNotifications: (notifications: import('../types').Notification[]) => {
    try {
      localStorage.setItem('kiranaklick_notifications_v1', JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  },

  addNotification: (notification: import('../types').Notification) => {
    const current = StorageService.getNotifications();
    const updated = [notification, ...current].slice(0, 50); // Keep last 50
    StorageService.saveNotifications(updated);
    return updated; // Return updated list for state updates
  },

  markNotificationRead: (id: string) => {
    const current = StorageService.getNotifications();
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    StorageService.saveNotifications(updated);
    return updated;
  },

  markAllNotificationsRead: () => {
    const current = StorageService.getNotifications();
    const updated = current.map(n => ({ ...n, read: true }));
    StorageService.saveNotifications(updated);
    return updated;
  },

  clearAllNotifications: () => {
    StorageService.saveNotifications([]);
    return [];
  }
};