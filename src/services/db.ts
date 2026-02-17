import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, SaleRecord, AppSettings, AuthState, ShopDetails } from '../../types';

interface KiranaDB extends DBSchema {
    products: {
        key: string;
        value: Product;
        indexes: { 'by-barcode': string; 'by-name': string };
    };
    sales: {
        key: string;
        value: SaleRecord;
        indexes: { 'by-timestamp': number };
    };
    settings: {
        key: string;
        value: unknown;
    };
}

const DB_NAME = 'kiranaklick_db';
const DB_VERSION = 1;

export const dbService = {
    async getDB(): Promise<IDBPDatabase<KiranaDB>> {
        return openDB<KiranaDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('by-barcode', 'barcode', { unique: false }); // Barcode might not be unique globally if we allow duplicates, but usually is. Let's keep unique: false for safety.
                    productStore.createIndex('by-name', 'name', { unique: false });
                }
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
                    salesStore.createIndex('by-timestamp', 'timestamp');
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            },
        });
    },

    // Products
    async getAllProducts(): Promise<Product[]> {
        const db = await this.getDB();
        return db.getAll('products');
    },

    async addProduct(product: Product): Promise<void> {
        const db = await this.getDB();
        await db.put('products', product);
    },

    async deleteProduct(id: string): Promise<void> {
        const db = await this.getDB();
        await db.delete('products', id);
    },

    async bulkAddProducts(products: Product[]): Promise<void> {
        const db = await this.getDB();
        const tx = db.transaction('products', 'readwrite');
        await Promise.all(products.map(p => tx.store.put(p)));
        await tx.done;
    },

    // Sales
    async getAllSales(): Promise<SaleRecord[]> {
        const db = await this.getDB();
        return db.getAll('sales');
    },

    async addSale(sale: SaleRecord): Promise<void> {
        const db = await this.getDB();
        await db.put('sales', sale);
    },

    async bulkAddSales(sales: SaleRecord[]): Promise<void> {
        const db = await this.getDB();
        const tx = db.transaction('sales', 'readwrite');
        await Promise.all(sales.map(s => tx.store.put(s)));
        await tx.done;
    },

    // Settings & Auth
    async getSettings(): Promise<AppSettings | undefined> {
        const db = await this.getDB();
        return db.get('settings', 'app_settings');
    },

    async saveSettings(settings: AppSettings): Promise<void> {
        const db = await this.getDB();
        await db.put('settings', settings, 'app_settings');
    },

    async getAuthState(): Promise<{ authState: AuthState; userRole: 'SHOP_OWNER' | 'SALES_EXECUTIVE' | null; shopDetails: ShopDetails | null; mobile: string | null } | undefined> {
        const db = await this.getDB();
        return db.get('settings', 'auth_state_data');
    },

    async saveAuthState(data: { authState: AuthState; userRole: 'SHOP_OWNER' | 'SALES_EXECUTIVE' | null; shopDetails: ShopDetails | null; mobile: string | null }): Promise<void> {
        const db = await this.getDB();
        await db.put('settings', data, 'auth_state_data');
    },

    // Migration Helper
    async isEmpty(): Promise<boolean> {
        const db = await this.getDB();
        const count = await db.count('products');
        return count === 0;
    }
};
