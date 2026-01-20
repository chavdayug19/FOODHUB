'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { MenuItem, Vendor } from '@/types';
import {
    Store,
    ArrowLeft,
    ShoppingCart,
    Plus,
    Minus,
    Filter,
    Clock,
    ChefHat,
    Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { MenuItemSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface PageProps {
    params: { vendorId: string };
}

export default function ShopPage({ params }: PageProps) {
    const { vendorId } = params;

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const { items, addItem, removeItem, updateQuantity, getTotalItems, setTableInfo, setHubId } = useCart();
    const router = useRouter();

    useEffect(() => {
        // Capture Table Info from URL if present
        const searchParams = new URLSearchParams(window.location.search);
        const table = searchParams.get('table');
        if (table) {
            setTableInfo(table);
        }

        if (vendorId) {
            fetchData();
        }
    }, [vendorId, setTableInfo]);

    const fetchData = async () => {
        try {
            // Fetch vendor details
            const vendorResponse = await api.get(`/vendors/${vendorId}`);
            const vendorData = vendorResponse.data.data || vendorResponse.data;
            setVendor(vendorData);

            if (vendorData.hubId) {
                setHubId(vendorData.hubId);
            }

            // Fetch menu items
            const menuResponse = await api.get(`/menu-items?vendorId=${vendorId}`);
            const menuData = menuResponse.data.data || menuResponse.data;
            const items = Array.isArray(menuData) ? menuData : [];
            setMenuItems(items);

            // Extract unique categories
            const uniqueCategories = Array.from(new Set(items.map((item: any) => item.category)))
                .filter((cat): cat is string => typeof cat === 'string' && cat.length > 0);
            setCategories(uniqueCategories);
        } catch (error: any) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const getItemQuantity = (menuItemId: string) => {
        const cartItem = items.find(item => item.menuItem._id === menuItemId);
        return cartItem?.quantity || 0;
    };

    const handleAddToCart = (menuItem: MenuItem) => {
        if (!vendor) return;

        // Add item to cart with proper vendor name
        // The CartContext might handle vendor name if passed or fetching internally.
        // Assuming addItem requires (item, vendorName) or similar based on previous context,
        // or just item if cart handles logic. 
        // Based on previous file read, addItem(menuItem, vendorName) was used.
        addItem(menuItem, vendor.name);
    };

    const handleQuantityChange = (menuItemId: string, delta: number) => {
        const currentQty = getItemQuantity(menuItemId);
        const newQty = currentQty + delta;

        if (newQty <= 0) {
            removeItem(menuItemId);
        } else {
            updateQuantity(menuItemId, newQty);
        }
    };

    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    const availableItems = filteredItems.filter(item => item.availability); // Using 'availability' confirmed from previous step

    const totalCartItems = getTotalItems();

    return (
        <div className="page-container min-h-screen pb-24">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>

                {/* Vendor Header */}
                {loading ? (
                    <div className="mb-6">
                        <div className="skeleton h-8 w-48 mb-2" />
                        <div className="skeleton h-4 w-64" />
                    </div>
                ) : vendor ? (
                    <div className="mb-6 animate-fadeIn">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <Store className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {vendor.name}
                                </h1>
                                {vendor.description && (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {vendor.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="mb-6 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter by Category
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all'
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Menu Section Title */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    Menu Items
                </h2>

                {/* Menu Items */}
                <div className="space-y-4">
                    {loading ? (
                        <>
                            <MenuItemSkeleton />
                            <MenuItemSkeleton />
                            <MenuItemSkeleton />
                        </>
                    ) : availableItems.length === 0 ? (
                        <EmptyState
                            type="menu"
                            message={selectedCategory !== 'all' ? 'No items in this category' : 'No menu items available'}
                        />
                    ) : (
                        availableItems.map((item, index) => {
                            const quantity = getItemQuantity(item._id);

                            return (
                                <div
                                    key={item._id}
                                    className="card p-4 flex gap-4 animate-slideUp hover:shadow-lg transition-shadow"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Item Image Placeholder */}
                                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
                                        <ChefHat className="w-10 h-10 text-gray-400" />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {item.name}
                                        </h3>
                                        {item.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                {item.description}
                                            </p>
                                        )}
                                        {/* Display Category as tag */}
                                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                            {item.category}
                                        </span>

                                        {/* Price & Add to Cart */}
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-lg font-bold text-orange-500">
                                                ₹{item.price.toFixed(2)}
                                            </span>

                                            {quantity === 0 ? (
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-1">
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-orange-500 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-6 text-center font-semibold text-gray-900 dark:text-white">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-orange-500 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Floating Cart Button */}
            {totalCartItems > 0 && (
                <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto animate-slideUp">
                    <Link
                        href="/cart"
                        className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/25"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>View Cart ({totalCartItems} items)</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
