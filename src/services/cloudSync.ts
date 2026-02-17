import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Product, SaleRecord, AppSettings } from '../../types';
import { dbService } from './db';

/**
 * Cloud sync service — backs up per-user data to Firestore.
 * Each user's data lives under `users/{uid}/...`.
 * All operations are fire-and-forget; failures log to console
 * so the app stays offline-first.
 */
export const cloudSync = {
    // ─── Single-item sync (called after each local write) ───

    async syncProduct(uid: string, product: Product): Promise<void> {
        try {
            const ref = doc(firestore, 'users', uid, 'products', product.id);
            await setDoc(ref, product);
        } catch (e) {
            console.warn('[cloudSync] syncProduct failed (offline?):', e);
        }
    },

    async syncSale(uid: string, sale: SaleRecord): Promise<void> {
        try {
            const ref = doc(firestore, 'users', uid, 'sales', sale.id);
            await setDoc(ref, sale);
        } catch (e) {
            console.warn('[cloudSync] syncSale failed (offline?):', e);
        }
    },

    async deleteCloudProduct(uid: string, productId: string): Promise<void> {
        try {
            const ref = doc(firestore, 'users', uid, 'products', productId);
            await deleteDoc(ref);
        } catch (e) {
            console.warn('[cloudSync] deleteCloudProduct failed (offline?):', e);
        }
    },

    async syncSettings(uid: string, settings: AppSettings): Promise<void> {
        try {
            const ref = doc(firestore, 'users', uid, 'settings', 'app_settings');
            await setDoc(ref, settings);
        } catch (e) {
            console.warn('[cloudSync] syncSettings failed (offline?):', e);
        }
    },

    // ─── Bulk backup (full overwrite to cloud) ───

    async backupAllProducts(uid: string, products: Product[]): Promise<void> {
        try {
            const batch = writeBatch(firestore);
            for (const p of products) {
                const ref = doc(firestore, 'users', uid, 'products', p.id);
                batch.set(ref, p);
            }
            await batch.commit();
        } catch (e) {
            console.warn('[cloudSync] backupAllProducts failed:', e);
        }
    },

    async backupAllSales(uid: string, sales: SaleRecord[]): Promise<void> {
        try {
            // Firestore batch limit is 500 — chunk if needed
            const chunks = [];
            for (let i = 0; i < sales.length; i += 400) {
                chunks.push(sales.slice(i, i + 400));
            }
            for (const chunk of chunks) {
                const batch = writeBatch(firestore);
                for (const s of chunk) {
                    const ref = doc(firestore, 'users', uid, 'sales', s.id);
                    batch.set(ref, s);
                }
                await batch.commit();
            }
        } catch (e) {
            console.warn('[cloudSync] backupAllSales failed:', e);
        }
    },

    // ─── Restore (cloud → local IndexedDB, called on login) ───

    async restoreAll(uid: string): Promise<{ products: number; sales: number }> {
        let productsCount = 0;
        let salesCount = 0;

        try {
            // Restore products
            const productsSnap = await getDocs(
                collection(firestore, 'users', uid, 'products')
            );
            if (!productsSnap.empty) {
                const cloudProducts = productsSnap.docs.map(d => d.data() as Product);
                await dbService.bulkAddProducts(cloudProducts);
                productsCount = cloudProducts.length;
            }

            // Restore sales
            const salesSnap = await getDocs(
                collection(firestore, 'users', uid, 'sales')
            );
            if (!salesSnap.empty) {
                const cloudSales = salesSnap.docs.map(d => d.data() as SaleRecord);
                await dbService.bulkAddSales(cloudSales);
                salesCount = cloudSales.length;
            }

            // Restore settings
            const settingsSnap = await getDocs(
                collection(firestore, 'users', uid, 'settings')
            );
            if (!settingsSnap.empty) {
                const settingsDoc = settingsSnap.docs.find(d => d.id === 'app_settings');
                if (settingsDoc) {
                    await dbService.saveSettings(settingsDoc.data() as AppSettings);
                }
            }

            console.log(`[cloudSync] Restored ${productsCount} products, ${salesCount} sales from cloud.`);
        } catch (e) {
            console.warn('[cloudSync] restoreAll failed (offline?):', e);
        }

        return { products: productsCount, sales: salesCount };
    },

    // ─── Full upload (local → cloud, called after first login/registration) ───

    async uploadAll(uid: string): Promise<void> {
        try {
            const products = await dbService.getAllProducts();
            const sales = await dbService.getAllSales();
            const settings = await dbService.getSettings();

            if (products.length > 0) {
                await this.backupAllProducts(uid, products);
            }
            if (sales.length > 0) {
                await this.backupAllSales(uid, sales);
            }
            if (settings) {
                await this.syncSettings(uid, settings);
            }

            console.log('[cloudSync] Full upload complete.');
        } catch (e) {
            console.warn('[cloudSync] uploadAll failed:', e);
        }
    },
};
