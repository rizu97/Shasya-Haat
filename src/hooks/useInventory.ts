import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '@/src/utils';
import { Product, ScannedData, InventoryFilter, SaleRecord, AppSettings } from '@/types';
import { StorageService } from '@/services/storageService';
import { dbService } from '@/src/services/db';

export const useInventory = (
    _appSettings: AppSettings
) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [scannedData, setScannedData] = useState<Partial<ScannedData> | undefined>(undefined);
    const [editingItem, setEditingItem] = useState<Product | undefined>(undefined);
    const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('ALL');
    const navigate = useNavigate();

    // Load Data & Migrate
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. One-time migration: LocalStorage -> IndexedDB (kept for transitional support)
                const isEmpty = await dbService.isEmpty();
                if (isEmpty) {
                    console.log("Migrating from LocalStorage to IndexedDB...");
                    const legacyProducts = StorageService.getInventory();
                    const legacySales = StorageService.getSales();

                    if (legacyProducts.length > 0) {
                        await dbService.bulkAddProducts(legacyProducts);
                    }
                    if (legacySales.length > 0) {
                        await dbService.bulkAddSales(legacySales);
                    }
                }

                // 2. Load from DB & Runtime Migration (Batches)
                const dbProducts = await dbService.getAllProducts();
                const dbSales = await dbService.getAllSales();

                // Runtime Migration: Ensure all products have batches
                const migratedProducts = dbProducts.map(p => {
                    if (!p.batches || p.batches.length === 0) {
                        const defaultBatch = {
                            id: generateId(),
                            quantity: p.quantity,
                            expiryDate: p.expiryDate,
                            addedAt: p.addedAt,
                            costPrice: p.costPrice
                        };
                        return { ...p, batches: [defaultBatch] };
                    }
                    return p;
                });

                setProducts(migratedProducts);
                setSales(dbSales);
            } catch (error) {
                console.error("Failed to load inventory data:", error);
            }
        };
        loadData();
    }, []);

    const refreshData = async () => {
        const dbProducts = await dbService.getAllProducts();
        const dbSales = await dbService.getAllSales();

        const migratedProducts = dbProducts.map(p => {
            if (!p.batches || p.batches.length === 0) {
                return {
                    ...p,
                    batches: [{
                        id: generateId(),
                        quantity: p.quantity,
                        expiryDate: p.expiryDate,
                        addedAt: p.addedAt,
                        costPrice: p.costPrice
                    }]
                };
            }
            return p;
        });

        setProducts(migratedProducts);
        setSales(dbSales);
    };

    const handleSaveProduct = async (product: Product) => {
        try {
            const totalQty = product.batches.reduce((sum, b) => sum + b.quantity, 0);

            let nearestExpiry = undefined;
            if (product.batches.length > 0) {
                const sortedBatches = [...product.batches]
                    .filter(b => b.expiryDate)
                    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

                if (sortedBatches.length > 0) {
                    nearestExpiry = sortedBatches[0].expiryDate;
                }
            }

            const finalProduct = {
                ...product,
                quantity: totalQty,
                expiryDate: nearestExpiry
            };

            await dbService.addProduct(finalProduct);
            await refreshData();

            setScannedData(undefined);
            setEditingItem(undefined);
            navigate('/inventory');

            if (!editingItem) {
                setInventoryFilter('ALL');
            }
        } catch (error) {
            console.error("Failed to save product:", error);
            alert(`Failed to save product: ${(error as Error).message}`);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        console.log("Attempting to delete product with ID:", id);
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await dbService.deleteProduct(id);
                console.log("Product deleted from DB");
                await refreshData();
                console.log("Data refreshed");
            } catch (error) {
                console.error("Failed to delete product:", error);
            }
        } else {
            console.log("Delete cancelled by user");
        }
    };

    const handleSellProduct = async (product: Product, quantitySold: number, salePrice: number) => {
        if (quantitySold <= 0) return;

        let remainingToSell = quantitySold;

        const sortedBatches = [...(product.batches || [])].sort((a, b) => {
            if (a.expiryDate && b.expiryDate) return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            if (a.expiryDate) return -1;
            if (b.expiryDate) return 1;
            return 0;
        });

        const newBatches = sortedBatches.map(batch => {
            if (remainingToSell <= 0) return batch;

            if (batch.quantity >= remainingToSell) {
                const updatedBatch = { ...batch, quantity: batch.quantity - remainingToSell };
                remainingToSell = 0;
                return updatedBatch;
            } else {
                const amountFromBatch = batch.quantity;
                remainingToSell -= amountFromBatch;
                return { ...batch, quantity: 0 };
            }
        }).filter(b => b.quantity > 0);

        const newTotalQty = newBatches.reduce((sum, b) => sum + b.quantity, 0);
        let newNearestExpiry = undefined;
        const validExpiryBatches = newBatches.filter(b => b.expiryDate).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
        if (validExpiryBatches.length > 0) newNearestExpiry = validExpiryBatches[0].expiryDate;

        const updatedProduct: Product = {
            ...product,
            quantity: newTotalQty,
            batches: newBatches,
            expiryDate: newNearestExpiry
        };

        const costPrice = product.costPrice || 0;
        const profit = salePrice - (costPrice * quantitySold);

        try {
            await dbService.addProduct(updatedProduct);

            const sale: SaleRecord = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                productId: product.id,
                productName: product.name,
                productNameBn: product.nameBn,
                quantity: quantitySold,
                unit: product.unit,
                salePrice: salePrice,
                profit: profit
            };

            await dbService.addSale(sale);
            await refreshData();
        } catch (error) {
            console.error("Failed to process sale:", error);
            alert(`Failed to process sale: ${(error as Error).message}`);
        }
    };

    const handleEditItem = (product: Product) => {
        setEditingItem(product);
        navigate('/add');
    };

    const handleDashboardFilter = (filter: InventoryFilter) => {
        setInventoryFilter(filter);
        navigate('/inventory');
    };

    const handleScanComplete = (data: ScannedData, mode: 'ADD' | 'SELL', cartLength: number, addToCartCallback: (data: ScannedData) => void) => {
        if (mode === 'ADD') {
            setScannedData(data);
            navigate('/add');
        } else {
            if (!data.name) {
                alert("Could not identify product name.");
                navigate('/trade');
                return;
            }
            addToCartCallback(data);
        }
    };

    return {
        products,
        setProducts,
        sales,
        setSales,
        scannedData,
        setScannedData,
        editingItem,
        setEditingItem,
        inventoryFilter,
        setInventoryFilter,
        refreshData,
        handleSaveProduct,
        handleDeleteProduct,
        handleSellProduct,
        handleEditItem,
        handleDashboardFilter,
        handleScanComplete
    };
};
