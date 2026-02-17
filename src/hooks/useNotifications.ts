import { useState, useEffect } from 'react';
import { Notification, Product } from '../../types';
import { StorageService } from '../../services/storageService';

export const useNotifications = (products: Product[], lowStockThreshold: number) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load initial
    useEffect(() => {
        const loaded = StorageService.getNotifications();
        setNotifications(loaded);
        setUnreadCount(loaded.filter(n => !n.read).length);
    }, []);

    // Check for auto-generated alerts
    useEffect(() => {
        if (products.length === 0) return;

        const current = StorageService.getNotifications();
        const today = new Date().toISOString().split('T')[0];
        let hasUpdates = false;

        const addAlert = (title: string, message: string, type: 'warning' | 'error', idPrefix: string) => {
            // Prevent spam: Don't add if same type/id exists for TODAY
            const exists = current.some(n =>
                n.id.startsWith(idPrefix) && n.date.startsWith(today)
            );

            if (!exists) {
                const newNote: Notification = {
                    id: `${idPrefix}-${Date.now()}`,
                    title,
                    message,
                    type,
                    date: new Date().toISOString(),
                    read: false,
                    action: 'INVENTORY'
                };
                current.unshift(newNote);
                hasUpdates = true;
            }
        };

        // 1. Check Low Stock
        const lowStockItems = products.filter(p => p.category === 'packet' && p.quantity > 0 && p.quantity <= lowStockThreshold);
        if (lowStockItems.length > 0) {
            addAlert(
                'Low Stock Alert',
                `${lowStockItems.length} items are running low on stock. Check Inventory.`,
                'warning',
                'low-stock'
            );
        }

        // 2. Check Expired
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const expiredItems = products.filter(p => p.expiryDate && new Date(p.expiryDate).getTime() < todayDate.getTime());
        if (expiredItems.length > 0) {
            addAlert(
                'Expiry Alert',
                `${expiredItems.length} items have expired! Remove them immediately.`,
                'error',
                'expired'
            );
        }

        if (hasUpdates) {
            // Keep only last 50
            const trimmed = current.slice(0, 50);
            StorageService.saveNotifications(trimmed);
            setNotifications(trimmed);
            setUnreadCount(trimmed.filter(n => !n.read).length);
        }

    }, [products, lowStockThreshold]);

    const markRead = (id: string) => {
        const updated = StorageService.markNotificationRead(id);
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
    };

    const markAllRead = () => {
        const updated = StorageService.markAllNotificationsRead();
        setNotifications(updated);
        setUnreadCount(0);
    };

    const clearAll = () => {
        StorageService.clearAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        clearAll
    };
};
