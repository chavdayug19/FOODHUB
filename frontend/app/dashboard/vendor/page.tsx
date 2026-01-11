"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useSocketStore } from '@/app/store/socketStore';
import { useAuthInit } from '@/app/hooks/useAuthInit';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { Package, Clock, LogOut, ChefHat } from 'lucide-react';

export default function VendorDashboard() {
  const loadingAuth = useAuthInit();
  const { user, logout } = useAuthStore();
  const { socket, connect } = useSocketStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingAuth && (!user || user.role !== 'vendor')) {
        router.push('/auth/login');
    }
  }, [loadingAuth, user, router]);

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!user || !user.vendorId) return;
    connect();

    if (socket) {
        socket.emit('join:vendor', user.vendorId);

        const handleNewOrder = (data: any) => {
            // Need to re-fetch or optimistically update.
            // The data structure from socket is slightly different (just the vendorOrder part usually + orderId).
            // For simplicity, let's just refetch all orders to be safe or append if structure matches.
            // Let's refetch for consistency.
            api.get('/orders').then(res => setOrders(res.data));
            // Or use toast notification
            alert(`New Order Received! #${data.orderId.slice(-4)}`);
        };

        socket.on('order:new', handleNewOrder);
        return () => {
            socket.off('order:new', handleNewOrder);
        };
    }
  }, [user, socket, connect]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
        await api.put(`/orders/${orderId}/vendor/${user.vendorId}/status`, { status });
        setOrders(prev => prev.map(o => {
            if (o._id === orderId) {
                const updatedVO = o.vendorOrders.map((vo: any) =>
                    vo.vendorId === user.vendorId ? { ...vo, status } : vo
                );
                return { ...o, vendorOrders: updatedVO };
            }
            return o;
        }));
    } catch (err) {
        console.error(err);
        alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        case 'ready': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingAuth || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-600 p-2 rounded-lg">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl leading-none">Vendor Portal</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Managing: {user.name}</p>
                    </div>
                </div>
                <button 
                    onClick={() => { logout(); router.push('/'); }} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6 text-gray-400" />
                    Active Orders
                </h2>
                <div className="text-sm text-gray-500">
                    Auto-refreshing via Socket.IO
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => {
                    const myOrder = order.vendorOrders.find((vo: any) => vo.vendorId === user.vendorId);
                    if (!myOrder) return null;

                    return (
                        <div key={order._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                            #{order._id.slice(-4)}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg">{order.customerName || 'Guest'}</h3>
                                    <p className="text-sm text-gray-500">{order.tableInfo || 'No Table Info'}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(myOrder.status)}`}>
                                    {myOrder.status.toUpperCase()}
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-5 flex-1">
                                <ul className="space-y-3">
                                    {myOrder.items.map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between items-start text-sm">
                                            <div className="flex gap-3">
                                                <span className="font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 w-6 h-6 flex items-center justify-center rounded-md text-xs">
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-4 font-bold text-lg">
                                    <span>Total</span>
                                    <span>${myOrder.totalAmount.toFixed(2)}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Status</label>
                                    <select
                                        value={myOrder.status}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    >
                                        <option value="pending">⏳ Pending</option>
                                        <option value="preparing">👨‍🍳 Preparing</option>
                                        <option value="ready">✅ Ready for Pickup</option>
                                        <option value="completed">🎉 Completed</option>
                                        <option value="cancelled">❌ Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {orders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                            <Package className="w-12 h-12" />
                        </div>
                        <p className="text-lg font-medium">No active orders</p>
                        <p className="text-sm">New orders will appear here instantly.</p>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}
