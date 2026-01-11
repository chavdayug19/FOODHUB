"use client";
import { useCartStore } from '@/app/store/cartStore';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import api from '@/app/lib/api';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, getTotal, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [tableInfo, setTableInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.vendorId]) acc[item.vendorId] = [];
    acc[item.vendorId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      // Need hubId from somewhere. Usually cart might store it, or we assume items are from valid vendors in the current hub context.
      // Ideally we store hubId in the store when first adding item.
      // For now, let's fetch vendor details to get hubId or assume a single hub flow.
      // Simplification: Fetch the first item's vendor to find the Hub ID.

      const firstVendorId = items[0].vendorId;
      const vendorRes = await api.get(`/vendors/${firstVendorId}`);
      const hubId = vendorRes.data.hubId;

      const vendorOrders = Object.keys(groupedItems).map(vendorId => {
        const vItems = groupedItems[vendorId];
        const vTotal = vItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        return {
            vendorId,
            items: vItems.map(i => ({
                menuItemId: i.menuItemId,
                name: i.name,
                price: i.price,
                quantity: i.quantity
            })),
            totalAmount: vTotal,
            status: 'pending'
        };
      });

      const payload = {
        hubId,
        vendorOrders,
        totalAmount: getTotal(),
        customerName,
        tableInfo,
        status: 'pending'
      };

      const res = await api.post('/orders', payload);
      clearCart();
      router.push(`/order/${res.data._id}`);

    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <button onClick={() => router.back()} className="text-orange-600 hover:underline">Go back to menu</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([vendorId, vendorItems]) => (
            <div key={vendorId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
                    {vendorItems[0].vendorName}
                </h3>
                {vendorItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                        <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                                {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500"/> : <Minus className="w-4 h-4"/>}
                            </button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                                <Plus className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="font-semibold">Checkout Details</h3>
        <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
            type="text"
            placeholder="Table / Seat Number"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            value={tableInfo}
            onChange={(e) => setTableInfo(e.target.value)}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-2xl mx-auto flex justify-between items-center mb-4">
            <span className="text-gray-500">Total</span>
            <span className="text-xl font-bold">${getTotal().toFixed(2)}</span>
        </div>
        <button
            onClick={handleCheckout}
            disabled={isSubmitting || !customerName || !tableInfo}
            className="w-full py-4 bg-orange-600 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg shadow-md"
        >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
