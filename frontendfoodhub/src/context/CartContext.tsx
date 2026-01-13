'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CartItem, MenuItem } from '@/types';
import toast from 'react-hot-toast';

interface CartContextType {
    items: CartItem[];
    hubId: string | null;
    tableInfo: string;
    customerName: string;
    setHubId: (id: string) => void;
    setTableInfo: (info: string) => void;
    setCustomerName: (name: string) => void;
    addItem: (menuItem: MenuItem, vendorName: string) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    clearVendorItems: (vendorId: string) => void;
    getVendorSubtotal: (vendorId: string) => number;
    getTotalAmount: () => number;
    getTotalItems: () => number;
    getItemsByVendor: () => Map<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hubId, setHubId] = useState<string | null>(null);
    const [tableInfo, setTableInfo] = useState('');
    const [customerName, setCustomerName] = useState('');

    const addItem = useCallback((menuItem: MenuItem, vendorName: string) => {
        setItems(prevItems => {
            const existingIndex = prevItems.findIndex(
                item => item.menuItem._id === menuItem._id
            );

            if (existingIndex > -1) {
                const updated = [...prevItems];
                updated[existingIndex].quantity += 1;
                toast.success(`${menuItem.name} quantity updated`);
                return updated;
            }

            toast.success(`${menuItem.name} added to cart`);
            return [...prevItems, {
                menuItem,
                quantity: 1,
                vendorId: menuItem.vendorId,
                vendorName,
            }];
        });
    }, []);

    const removeItem = useCallback((menuItemId: string) => {
        setItems(prevItems => {
            const item = prevItems.find(i => i.menuItem._id === menuItemId);
            if (item) {
                toast.success(`${item.menuItem.name} removed from cart`);
            }
            return prevItems.filter(item => item.menuItem._id !== menuItemId);
        });
    }, []);

    const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(menuItemId);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.menuItem._id === menuItemId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
        setTableInfo('');
        setCustomerName('');
    }, []);

    const clearVendorItems = useCallback((vendorId: string) => {
        setItems(prevItems => prevItems.filter(item => item.vendorId !== vendorId));
    }, []);

    const getVendorSubtotal = useCallback((vendorId: string) => {
        return items
            .filter(item => item.vendorId === vendorId)
            .reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    }, [items]);

    const getTotalAmount = useCallback(() => {
        return items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    }, [items]);

    const getTotalItems = useCallback(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items]);

    const getItemsByVendor = useCallback(() => {
        const vendorMap = new Map<string, CartItem[]>();
        items.forEach(item => {
            const vendorItems = vendorMap.get(item.vendorId) || [];
            vendorItems.push(item);
            vendorMap.set(item.vendorId, vendorItems);
        });
        return vendorMap;
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                hubId,
                tableInfo,
                customerName,
                setHubId,
                setTableInfo,
                setCustomerName,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                clearVendorItems,
                getVendorSubtotal,
                getTotalAmount,
                getTotalItems,
                getItemsByVendor,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
