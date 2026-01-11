"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/app/lib/api';
import { useSocketStore } from '@/app/store/socketStore';

interface OrderItem {
  name: string;
  quantity: number;
}

interface VendorOrder {
  vendorId: string;
  items: OrderItem[];
  status: string;
}

interface Order {
  _id: string;
  status: string;
  vendorOrders: VendorOrder[];
  customerName: string;
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});
  const { socket, connect } = useSocketStore();

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);

        // Fetch vendor names
        const vIds = res.data.vendorOrders.map((v: VendorOrder) => v.vendorId);
        const uniqueVIds = Array.from(new Set(vIds));
        const names: Record<string, string> = {};

        await Promise.all(uniqueVIds.map(async (id) => {
            const vRes = await api.get(`/vendors/${id}`);
            names[id as string] = vRes.data.name;
        }));
        setVendorNames(names);
      } catch (err) {
        console.error(err);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('join:order', orderId);

    const handleStatusChange = (data: { orderId: string, vendorId: string, status: string }) => {
        if (data.orderId === orderId) {
            setOrder((prev) => {
                if (!prev) return null;
                const updatedVendorOrders = prev.vendorOrders.map(vo =>
                    vo.vendorId === data.vendorId ? { ...vo, status: data.status } : vo
                );

                // Simplified main status logic
                return { ...prev, vendorOrders: updatedVendorOrders };
            });
        }
    };

    socket.on('order:status_change', handleStatusChange);

    return () => {
        socket.off('order:status_change', handleStatusChange);
    };
  }, [socket, orderId]);

  if (!order) return <div className="p-8 text-center">Loading order...</div>;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
        <p className="text-gray-500">Hi {order.customerName}, track your order status below.</p>
      </div>

      <div className="space-y-4">
        {order.vendorOrders.map((vo, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{vendorNames[vo.vendorId] || 'Loading...'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase
                        ${vo.status === 'completed' ? 'bg-green-100 text-green-700' :
                          vo.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                          vo.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }
                    `}>
                        {vo.status}
                    </span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {vo.items.map((item, i) => (
                        <li key={i} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>x{item.quantity}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
      </div>
    </div>
  );
}
