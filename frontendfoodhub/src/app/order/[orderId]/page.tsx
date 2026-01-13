'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getSocket, connectSocket, joinOrderRoom, leaveOrderRoom } from '@/lib/socket';
import { Order, OrderStatus } from '@/types';
import {
    ClipboardList,
    ArrowLeft,
    Clock,
    CheckCircle2,
    ChefHat,
    Package,
    XCircle,
    Store,
    RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { OrderSkeleton } from '@/components/Skeleton';
import toast from 'react-hot-toast';

interface PageProps {
    params: { orderId: string };
}

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bgColor: string }> = {
    pending: {
        label: 'Order Placed',
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    preparing: {
        label: 'Preparing',
        icon: ChefHat,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    ready: {
        label: 'Ready for Pickup',
        icon: Package,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
};

export default function OrderTrackingPage({ params }: PageProps) {
    const { orderId } = params;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (orderId) {
            fetchOrder();
            setupSocket();
        }

        return () => {
            if (orderId) {
                leaveOrderRoom(orderId);
            }
        };
    }, [orderId]);

    const setupSocket = () => {
        connectSocket();
        joinOrderRoom(orderId);

        const socket = getSocket();
        socket.on('order:status_change', (data: { orderId: string; status: OrderStatus; vendorId?: string }) => {
            if (data.orderId === orderId) {
                toast.success(`Order status updated to: ${statusConfig[data.status]?.label || data.status}`);
                fetchOrder();
            }
        });
    };

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data.data || response.data);
        } catch (error: any) {
            toast.error('Failed to load order');
            router.push('/');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrder();
    };

    const getOverallStatus = (): OrderStatus => {
        if (!order) return 'pending';
        return order.status;
    };

    const overallStatus = getOverallStatus();
    const config = statusConfig[overallStatus];
    const StatusIcon = config.icon;

    return (
        <div className="page-container min-h-screen">
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
                            <span>Back to Home</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-orange-500" />
                            Order Tracking
                        </h1>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <OrderSkeleton />
                ) : order ? (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Order Summary Card */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                                    <p className="font-mono font-medium text-gray-900 dark:text-white">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-full ${config.bgColor} flex items-center gap-2`}>
                                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                                    <span className={`font-semibold text-sm ${config.color}`}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Customer</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                                </div>
                                {order.tableInfo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Table</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.tableInfo}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="font-bold text-orange-500 text-lg">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Ordered At</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Order Progress
                            </h3>
                            <div className="flex items-center justify-between relative">
                                {/* Progress Line */}
                                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                                    <div
                                        className="h-full bg-orange-500 rounded transition-all duration-500"
                                        style={{
                                            width: overallStatus === 'pending' ? '0%'
                                                : overallStatus === 'preparing' ? '33%'
                                                    : overallStatus === 'ready' ? '66%'
                                                        : overallStatus === 'completed' ? '100%'
                                                            : '0%'
                                        }}
                                    />
                                </div>

                                {/* Status Steps */}
                                {(['pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status, index) => {
                                    const stepConfig = statusConfig[status];
                                    const StepIcon = stepConfig.icon;
                                    const isActive = ['pending', 'preparing', 'ready', 'completed'].indexOf(overallStatus) >= index;

                                    return (
                                        <div key={status} className="relative flex flex-col items-center z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                }`}>
                                                <StepIcon className="w-4 h-4" />
                                            </div>
                                            <span className={`mt-2 text-xs font-medium ${isActive
                                                ? 'text-orange-500'
                                                : 'text-gray-400'
                                                }`}>
                                                {stepConfig.label.split(' ')[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Vendor-wise Status */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Vendor Orders
                            </h3>
                            <div className="space-y-4">
                                {order.vendorOrders?.map((vendorOrder, index) => {
                                    const vendorConfig = statusConfig[vendorOrder.status] || statusConfig['pending'];
                                    const VendorStatusIcon = vendorConfig.icon;

                                    return (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                        <Store className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {vendorOrder.vendorName || `Vendor ${index + 1}`}
                                                    </span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full ${vendorConfig.bgColor} flex items-center gap-1`}>
                                                    <VendorStatusIcon className={`w-3 h-3 ${vendorConfig.color}`} />
                                                    <span className={`text-xs font-semibold ${vendorConfig.color}`}>
                                                        {vendorConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-2 ml-13">
                                                {vendorOrder.items?.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {item.quantity}x {item.name}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    ₹{vendorOrder.subtotal?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Order not found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
