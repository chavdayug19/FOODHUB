"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/app/lib/api';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/app/store/cartStore';

interface Vendor {
  _id: string;
  name: string;
}

interface Hub {
  _id: string;
  name: string;
  location: string;
}

export default function HubPage() {
  const { qrCode } = useParams();
  const [hub, setHub] = useState<Hub | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hubRes = await api.get(`/hubs/qr/${qrCode}`);
        setHub(hubRes.data);

        const vendorsRes = await api.get(`/vendors?hubId=${hubRes.data._id}`);
        setVendors(vendorsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (qrCode) fetchData();
  }, [qrCode]);

  if (loading) return <div className="p-8 text-center">Loading hub...</div>;
  if (!hub) return <div className="p-8 text-center">Hub not found</div>;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{hub.name}</h1>
            <p className="text-sm text-gray-500">{hub.location}</p>
          </div>
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Vendors</h2>
        <div className="grid gap-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor._id}
              href={`/hub/${qrCode}/vendor/${vendor._id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-orange-600">{vendor.name}</h3>
              <p className="text-sm text-gray-500 mt-1">View Menu →</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
