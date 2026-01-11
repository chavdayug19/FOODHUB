"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { useCartStore } from '@/app/store/cartStore';
import { ChevronLeft, Plus } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendorId: string;
}

interface Vendor {
  _id: string;
  name: string;
}

export default function VendorPage() {
  const { qrCode, vendorId } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, menuRes] = await Promise.all([
          api.get(`/vendors/${vendorId}`),
          api.get(`/menu-items?vendorId=${vendorId}`)
        ]);
        setVendor(vendorRes.data);
        setMenuItems(menuRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchData();
  }, [vendorId]);

  const handleAdd = (item: MenuItem) => {
    addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      vendorId: item.vendorId,
      vendorName: vendor?.name || 'Unknown Vendor',
    });
    // Optional: Show toast
  };

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{vendor?.name}</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 mt-4">
        {['Main', 'Side', 'Drink', 'Dessert', 'Food'].map((cat) => {
          const items = menuItems.filter(i => i.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-lg font-bold mb-3">{cat}s</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between items-start bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      <p className="mt-2 font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleAdd(item)}
                      className="ml-4 p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-200 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
