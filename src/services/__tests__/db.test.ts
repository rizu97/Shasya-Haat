import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from '../db';
import type { Product, SaleRecord } from '../../../types';

// fake-indexeddb/auto is loaded via test-setup.ts
// Clear all object stores between tests for isolation
beforeEach(async () => {
    const db = await dbService.getDB();
    const tx = db.transaction(['products', 'sales', 'settings'], 'readwrite');
    await Promise.all([
        tx.objectStore('products').clear(),
        tx.objectStore('sales').clear(),
        tx.objectStore('settings').clear(),
    ]);
    await tx.done;
});

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: crypto.randomUUID(),
    name: 'Test Product',
    nameBn: 'টেস্ট প্রোডাক্ট',
    mrp: 50,
    costPrice: 40,
    quantity: 10,
    batches: [
        {
            id: crypto.randomUUID(),
            quantity: 10,
            addedAt: new Date().toISOString(),
        },
    ],
    unit: 'pcs',
    category: 'packet',
    addedAt: new Date().toISOString(),
    ...overrides,
});

const mockSale = (overrides: Partial<SaleRecord> = {}): SaleRecord => ({
    id: crypto.randomUUID(),
    productId: 'prod-1',
    productName: 'Test Product',
    productNameBn: 'টেস্ট প্রোডাক্ট',
    quantity: 2,
    unit: 'pcs',
    salePrice: 100,
    profit: 20,
    timestamp: new Date().toISOString(),
    ...overrides,
});

describe('dbService', () => {
    describe('Products', () => {
        it('should start with an empty product list', async () => {
            const products = await dbService.getAllProducts();
            expect(products).toEqual([]);
        });

        it('should add and retrieve a product', async () => {
            const product = mockProduct({ id: 'p1', name: 'Parle-G' });
            await dbService.addProduct(product);

            const products = await dbService.getAllProducts();
            expect(products).toHaveLength(1);
            expect(products[0].name).toBe('Parle-G');
        });

        it('should update an existing product (upsert via put)', async () => {
            const product = mockProduct({ id: 'p1', name: 'Parle-G', mrp: 10 });
            await dbService.addProduct(product);

            const updatedProduct = { ...product, mrp: 15 };
            await dbService.addProduct(updatedProduct);

            const products = await dbService.getAllProducts();
            expect(products).toHaveLength(1);
            expect(products[0].mrp).toBe(15);
        });

        it('should delete a product by id', async () => {
            const product = mockProduct({ id: 'p1' });
            await dbService.addProduct(product);

            await dbService.deleteProduct('p1');
            const products = await dbService.getAllProducts();
            expect(products).toHaveLength(0);
        });

        it('should bulk add products', async () => {
            const products = [
                mockProduct({ id: 'p1', name: 'Product 1' }),
                mockProduct({ id: 'p2', name: 'Product 2' }),
                mockProduct({ id: 'p3', name: 'Product 3' }),
            ];
            await dbService.bulkAddProducts(products);

            const result = await dbService.getAllProducts();
            expect(result).toHaveLength(3);
        });

        it('should report isEmpty correctly', async () => {
            expect(await dbService.isEmpty()).toBe(true);

            await dbService.addProduct(mockProduct({ id: 'p1' }));
            expect(await dbService.isEmpty()).toBe(false);
        });
    });

    describe('Sales', () => {
        it('should start with an empty sales list', async () => {
            const sales = await dbService.getAllSales();
            expect(sales).toEqual([]);
        });

        it('should add and retrieve a sale', async () => {
            const sale = mockSale({ id: 's1' });
            await dbService.addSale(sale);

            const sales = await dbService.getAllSales();
            expect(sales).toHaveLength(1);
            expect(sales[0].id).toBe('s1');
        });

        it('should bulk add sales', async () => {
            const sales = [
                mockSale({ id: 's1' }),
                mockSale({ id: 's2' }),
            ];
            await dbService.bulkAddSales(sales);

            const result = await dbService.getAllSales();
            expect(result).toHaveLength(2);
        });
    });

    describe('Settings', () => {
        it('should return undefined when no settings are saved', async () => {
            const settings = await dbService.getSettings();
            expect(settings).toBeUndefined();
        });

        it('should save and retrieve settings', async () => {
            const settings = {
                shopName: 'My Kirana',
                gstNumber: 'GST123',
                mobile: '9876543210',
                lowStockThreshold: 5,
                nearExpiryDays: 30,
                language: 'en' as const,
                theme: 'dark' as const,
            };
            await dbService.saveSettings(settings);

            const result = await dbService.getSettings();
            expect(result).toBeDefined();
            expect(result!.shopName).toBe('My Kirana');
        });
    });
});
