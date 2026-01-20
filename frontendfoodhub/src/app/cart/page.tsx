'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
    ShoppingCart,
    ArrowLeft,
    Store,
    Plus,
    Minus,
    Trash2,
    User,
    MapPin,
    Loader2,
    ChevronRight,
    X // Added for modal
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';

export default function CartPage() {
    const {
        items,
        hubId,
        tableInfo,
        customerName,
        setTableInfo,
        setCustomerName,
        removeItem,
        updateQuantity,
        clearCart,
        getVendorSubtotal,
        getTotalAmount,
        getItemsByVendor,
    } = useCart();

    // Auto-fill customer details from Auth
    const { user } = useAuth();

    // Initial load effect to set name if available
    useEffect(() => {
        if (user?.name && !customerName) {
            setCustomerName(user.name);
        }
    }, [user, customerName, setCustomerName]);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const vendorItemsMap = getItemsByVendor();
    const totalAmount = getTotalAmount();

    const [showTableModal, setShowTableModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handlePlaceOrderClick = () => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // 1. Check Auth First
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        // 2. Check Name (Should be filled if auth passed)
        if (!customerName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        // 3. Proceed to Table/Order Logic
        if (tableInfo && tableInfo.length > 0) {
            submitOrder();
        } else {
            // Manual workflow: Show popup
            setShowTableModal(true);
        }
    };

    const submitOrder = async () => {
        if (!hubId) {
            toast.error('Hub information is missing. Please scan QR code again.');
            return;
        }

        setLoading(true);

        // Build vendor orders payload
        const vendorOrders: any[] = [];
        vendorItemsMap.forEach((vendorItems, vendorId) => {
            vendorOrders.push({
                vendorId,
                items: vendorItems.map(item => ({
                    menuItemId: item.menuItem._id,
                    quantity: item.quantity,
                })),
            });
        });

        const orderPayload = {
            hubId,
            vendorOrders,
            customerName: customerName.trim(),
            tableInfo: tableInfo.trim() || undefined,
        };

        try {
            const response = await api.post('/orders', orderPayload);
            const order = response.data.data || response.data;

            toast.success('Order placed successfully!');
            clearCart();
            router.push(`/order/${order._id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
            setShowTableModal(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="page-container min-h-screen">
                <Navbar />
                <EmptyState
                    type="cart"
                    actionLabel="Browse Food"
                    actionHref="/"
                />
            </div>
        );
    }

    return (
        <div className="page-container min-h-screen pb-32">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Continue Shopping</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-orange-500" />
                            Your Cart
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            clearCart();
                            toast.success('Cart cleared');
                        }}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>

                {/* Vendor Groups */}
                <div className="space-y-6 mb-8">
                    {Array.from(vendorItemsMap.entries()).map(([vendorId, vendorItems]) => {
                        const vendorName = vendorItems[0]?.vendorName || 'Unknown Vendor';
                        const subtotal = getVendorSubtotal(vendorId);

                        return (
                            <div key={vendorId} className="card p-4 animate-fadeIn">
                                {/* Vendor Header */}
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <Store className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {vendorName}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {vendorItems.length} item{vendorItems.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-4">
                                    {vendorItems.map((item) => (
                                        <div key={item.menuItem._id} className="flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {item.menuItem.name}
                                                </h4>
                                                <p className="text-sm text-orange-500 font-semibold">
                                                    ₹{item.menuItem.price.toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-6 text-center font-semibold text-gray-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right min-w-[70px]">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeItem(item.menuItem._id)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Vendor Subtotal */}
                                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ₹{subtotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Customer Info */}
                <div className="card p-4 mb-6 animate-fadeIn">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Order Details
                    </h3>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="input-field pl-12"
                                    required
                                    readOnly={!!user?.name}
                                />
                                {user?.name && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                        Logged In
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table Indicator (Only if detected) */}
                        {tableInfo && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Table Number
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium">Detected Table: <strong>{tableInfo}</strong></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Order Summary */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl z-40">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Grand Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{totalAmount.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={handlePlaceOrderClick}
                            disabled={loading || !customerName.trim()}
                            className="btn-primary py-4 px-8 flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {tableInfo ? 'Place Order' : 'Next'}
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Entry Modal */}
            {showTableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scaleUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Table Number</h3>
                            <button
                                onClick={() => setShowTableModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Where are you sitting?
                            </label>
                            <input
                                type="text"
                                value={tableInfo}
                                onChange={(e) => setTableInfo(e.target.value)}
                                placeholder="e.g., 5 or Patio-2"
                                autoFocus
                                className="input-field text-lg py-3 text-center"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Look for the number on your table
                            </p>
                        </div>

                        <button
                            onClick={submitOrder}
                            disabled={loading || !tableInfo.trim()}
                            className="btn-primary w-full py-3 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            )}
            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    setShowAuthModal(false);
                    // Automatically proceed if user logged in successfully?
                    // Optional: could auto-trigger handlePlaceOrderClick again or just let them click it.
                    // Let's let them click, or we can see ref.
                }}
            />
        </div>
    );
}
