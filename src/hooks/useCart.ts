import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ScannedData, AppSettings } from '../../types';
import { TRANSLATIONS } from '../../constants';

export const useCart = (
    products: Product[],
    handleSellProduct: (product: Product, quantity: number, price: number, batchId?: string) => void,
    appSettings: AppSettings
) => {
    const [cart, setCart] = useState<{ product: Product, quantity: number, batchId?: string, salePrice?: number }[]>([]);
    const navigate = useNavigate();

    const handleScanToSell = (data: ScannedData) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const searchName = normalize(data.name || '');

        // Safety check just in case
        if (!searchName) return;

        const foundProduct = products.find(p => {
            const pName = normalize(p.name);
            return pName.includes(searchName) || searchName.includes(pName);
        });

        if (foundProduct) {
            setCart(prevCart => {
                // Default to first batch or generic logic if added via scan (to be improved later if needed)
                // For now, scan adds generic item (FIFO).
                const existingIndex = prevCart.findIndex(item => item.product.id === foundProduct.id && !item.batchId);
                if (existingIndex > -1) {
                    const newCart = [...prevCart];
                    newCart[existingIndex] = {
                        ...newCart[existingIndex],
                        quantity: newCart[existingIndex].quantity + 1
                    };
                    return newCart;
                } else {
                    return [...prevCart, { product: foundProduct, quantity: 1 }];
                }
            });
            navigate('/trade');
        } else {
            alert(`${TRANSLATIONS.itemNotFound.en}: ${data.name}`);
            navigate('/trade');
        }
    };

    const handleConfirmTradeSale = () => {
        if (cart.length === 0) return;

        cart.forEach(item => {
            const totalItemPrice = (item.salePrice || item.product.mrp) * item.quantity;
            handleSellProduct(item.product, item.quantity, totalItemPrice, item.batchId);
        });

        setCart([]);
        alert(appSettings.language === 'en' ? 'Sale confirmed successfully!' : 'বিক্রয় সফলভাবে নিশ্চিত হয়েছে!');
    };

    return {
        cart,
        setCart,
        handleScanToSell,
        handleConfirmTradeSale
    };
};
