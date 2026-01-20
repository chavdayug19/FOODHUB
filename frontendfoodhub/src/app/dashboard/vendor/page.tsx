'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import {
    ShoppingBag,
    IndianRupee,
    Users,
    Utensils,
    ArrowRight,
    Search
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VendorDashboardOverview() {
    const { user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        ordersToday: 0,
        revenueToday: 0,
        newCustomers: 0,
        menuItems: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchDashboardData();
        }
    }, [authLoading, user]);

    const fetchDashboardData = async () => {
        try {
            // In a real app, you'd have a specific dashboard endpoint. 
            // Here we'll just fetch orders and calculate some basic stats.
            const response = await api.get('/orders');
            const allOrders: Order[] = response.data.data || response.data || [];

            // Filter orders for today
            const today = new Date().toDateString();
            const todayOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === today);

            // Calculate Revenue (Approximation)
            const revenue = todayOrders.reduce((acc, order) => {
                const vendorOrder = order.vendorOrders?.[0];
                return acc + (vendorOrder?.subtotal || 0);
            }, 0);

            setStats({
                ordersToday: todayOrders.length,
                revenueToday: revenue,
                newCustomers: 0, // Mock
                menuItems: 0 // Mock
            });

            setRecentOrders(allOrders.slice(0, 5)); // Top 5
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    // New state for Shop Name
    const [shopName, setShopName] = useState('');

    useEffect(() => {
        const fetchVendorDetails = async () => {
            if (user?.vendorId) {
                try {
                    const res = await api.get(`/vendors/${user.vendorId}`);
                    setShopName(res.data.name);
                } catch (err) {
                    console.error("Failed to fetch vendor name", err);
                }
            }
        };
        fetchVendorDetails();
    }, [user?.vendorId]);

    if (loading || authLoading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {shopName ? `${shopName} Dashboard` : 'Dashboard'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium px-4 py-2 bg-green-100 text-green-700 rounded-full">
                        {user?.role === 'vendor' ? 'Owner' : 'Staff'}
                    </span>
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        {/* Avatar placeholder */}
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/30">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ordersToday}</h3>
                            <p className="text-gray-500 text-sm">Total Orders Today</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.revenueToday}</h3>
                            <p className="text-gray-500 text-sm">Today's Revenue</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/30">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
                            <p className="text-gray-500 text-sm">New Customers</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-sky-500/30">
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45</h3>
                            <p className="text-gray-500 text-sm">Menu Items</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                    <Link href="/dashboard/vendor/orders" className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Order ID</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Items</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Total</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No recent orders</td>
                                </tr>
                            ) : recentOrders.map((order) => {
                                const vendorOrder = order.vendorOrders?.[0];
                                const status = vendorOrder?.status || 'pending';
                                const statusColors = {
                                    pending: 'bg-yellow-100 text-yellow-700',
                                    preparing: 'bg-blue-100 text-blue-700',
                                    ready: 'bg-green-100 text-green-700',
                                    completed: 'bg-gray-100 text-gray-700',
                                    cancelled: 'bg-red-100 text-red-700'
                                };

                                return (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-sm font-mono font-medium text-gray-900 dark:text-white">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                                            {order.customerName}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {vendorOrder?.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            ₹{vendorOrder?.subtotal?.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100'}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popular Items - Placeholder for now matching the existing HTML structure concept */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Items</h2>
                    <Link href="/dashboard/vendor/menu" className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer">
                            <div className="h-40 bg-gray-200 dark:bg-gray-800 relative">
                                {/* Placeholder Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    Item Image {i}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Popular Item {i}</h3>
                                <p className="text-green-600 font-bold">₹{(150 * i).toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-2">{100 - (i * 10)} orders this month</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
