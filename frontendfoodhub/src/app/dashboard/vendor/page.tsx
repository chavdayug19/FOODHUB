'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSocket, connectSocket } from '@/lib/socket';
import { Order, OrderStatus } from '@/types';
import {
    LayoutDashboard,
    Clock,
    ChefHat,
    Package,
    CheckCircle2,
    RefreshCw,
    Store,
    AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bgColor: string; nextStatus?: OrderStatus }> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        nextStatus: 'preparing'
    },
    preparing: {
        label: 'Preparing',
        icon: ChefHat,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        nextStatus: 'ready'
    },
    ready: {
        label: 'Ready',
        icon: Package,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        nextStatus: 'completed'
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    cancelled: {
        label: 'Cancelled',
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
};

const statusOrder: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

export default function VendorDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'vendor') {
                toast.error('Vendor access required');
                router.push('/auth/login');
                return;
            }
            fetchOrders();
            setupSocket();
        }
    }, [user, authLoading, router]);

    const setupSocket = () => {
        connectSocket();
        const socket = getSocket();

        socket.on('order:new', () => {
            toast.success('New order received!');
            fetchOrders();
        });

        socket.on('order:status_change', () => {
            fetchOrders();
        });
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/vendor');
            const orderData = response.data.data || response.data;
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const updateOrderStatus = async (orderId: string, vendorId: string, newStatus: OrderStatus) => {
        setUpdatingOrder(orderId);

        try {
            await api.put(`/orders/${orderId}/vendor/${vendorId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter(order => {
            // Check if any vendor order in this order matches the filter
            return order.vendorOrders?.some(vo => vo.status === activeFilter);
        });

    const getOrderCounts = () => {
        const counts: Record<OrderStatus | 'all', number> = {
            all: orders.length,
            pending: 0,
            preparing: 0,
            ready: 0,
            completed: 0,
            cancelled: 0,
        };

        orders.forEach(order => {
            order.vendorOrders?.forEach(vo => {
                if (counts[vo.status] !== undefined) {
                    counts[vo.status]++;
                }
            });
        });

        return counts;
    };

    const counts = getOrderCounts();

    if (authLoading || loading) {
        return <LoadingSpinner fullScreen text="Loading dashboard..." />;
    }

    return (
        <div className="page-container min-h-screen">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Store className="w-8 h-8 text-orange-500" />
                            Vendor Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your incoming orders
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-orange-500 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeFilter === 'all'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        All Orders
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === 'all' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                            {counts.all}
                        </span>
                    </button>
                    {statusOrder.map((status) => {
                        const config = statusConfig[status];
                        const Icon = config.icon;
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveFilter(status)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeFilter === status
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {config.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === status ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                    {counts[status]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Orders Grid */}
                {filteredOrders.length === 0 ? (
                    <EmptyState
                        type="orders"
                        message={activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map((order) => {
                            // Get vendor-specific order info
                            const vendorOrder = order.vendorOrders?.[0]; // Assuming single vendor per order view
                            const status = vendorOrder?.status || 'pending';
                            const config = statusConfig[status];
                            const StatusIcon = config.icon;
                            const isUpdating = updatingOrder === order._id;

                            return (
                                <div
                                    key={order._id}
                                    className="card p-4 animate-fadeIn hover:shadow-lg transition-shadow"
                                >
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                                            <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full ${config.bgColor} flex items-center gap-1`}>
                                            <StatusIcon className={`w-3 h-3 ${config.color}`} />
                                            <span className={`text-xs font-semibold ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                        <p className="font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                                        {order.tableInfo && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Table: {order.tableInfo}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-2 mb-4">
                                        {vendorOrder?.items?.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center py-3 border-t border-gray-100 dark:border-gray-800">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">Total</span>
                                        <span className="text-lg font-bold text-orange-500">
                                            ₹{vendorOrder?.subtotal?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    {config.nextStatus && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, vendorOrder?.vendorId || '', config.nextStatus!)}
                                            disabled={isUpdating}
                                            className={`w-full mt-3 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${status === 'pending'
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                : status === 'preparing'
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : status === 'ready'
                                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                        : 'bg-gray-500 text-white'
                                                } disabled:opacity-50`}
                                        >
                                            {isUpdating ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    {(() => {
                                                        const NextIcon = statusConfig[config.nextStatus!].icon;
                                                        return <NextIcon className="w-4 h-4" />;
                                                    })()}
                                                    Mark as {statusConfig[config.nextStatus!].label}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
