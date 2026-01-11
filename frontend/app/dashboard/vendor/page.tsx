"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useSocketStore } from '@/app/store/socketStore';
import { useAuthInit } from '@/app/hooks/useAuthInit';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';

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

  if (loadingAuth || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <div className="flex items-center gap-4">
                <span>{user.name}</span>
                <button onClick={() => { logout(); router.push('/'); }} className="text-red-500 hover:underline">Logout</button>
            </div>
        </div>

        <div className="grid gap-6">
            {orders.map(order => {
                // Find this vendor's part of the order
                const myOrder = order.vendorOrders.find((vo: any) => vo.vendorId === user.vendorId);
                if (!myOrder) return null;

                return (
                    <div key={order._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Order #{order._id.slice(-6)}</h3>
                                <p className="text-sm text-gray-500">{order.customerName} • {order.tableInfo}</p>
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <select
                                value={myOrder.status}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className={`p-2 rounded-lg border font-medium ${
                                    myOrder.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                    myOrder.status === 'preparing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    myOrder.status === 'ready' ? 'bg-green-50 border-green-200 text-green-700' :
                                    'bg-gray-50 border-gray-200 text-gray-700'
                                }`}
                            >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <ul className="space-y-2">
                                {myOrder.items.map((item: any, i: number) => (
                                    <li key={i} className="flex justify-between">
                                        <span className="font-medium">{item.quantity}x {item.name}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold">
                                <span>Total</span>
                                <span>${myOrder.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {orders.length === 0 && <p className="text-center text-gray-500">No orders yet.</p>}
        </div>
    </div>
  );
}
