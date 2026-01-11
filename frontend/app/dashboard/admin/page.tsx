"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useAuthInit } from '@/app/hooks/useAuthInit';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const loadingAuth = useAuthInit();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [hubs, setHubs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingAuth && (!user || user.role !== 'admin')) {
        router.push('/auth/login');
    }
  }, [loadingAuth, user, router]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [hRes, vRes] = await Promise.all([
                api.get('/hubs'),
                api.get('/vendors')
            ]);
            setHubs(hRes.data);
            setVendors(vRes.data);
        } catch (err) {
            console.error(err);
        }
    };
    if (user) fetchData();
  }, [user]);

  if (loadingAuth || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button onClick={() => { logout(); router.push('/'); }} className="text-red-500 hover:underline">Logout</button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Hubs</h2>
                <ul className="space-y-3">
                    {hubs.map(hub => (
                        <li key={hub._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between">
                            <span>{hub.name}</span>
                            <span className="text-sm text-gray-500">{hub.location}</span>
                        </li>
                    ))}
                </ul>
                <button className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">+ Add Hub</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Vendors</h2>
                <ul className="space-y-3">
                    {vendors.map(vendor => (
                        <li key={vendor._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between">
                            <span>{vendor.name}</span>
                            <span className="text-sm text-gray-500">
                                {hubs.find(h => h._id === vendor.hubId)?.name}
                            </span>
                        </li>
                    ))}
                </ul>
                <button className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">+ Add Vendor</button>
            </div>
        </div>
    </div>
  );
}
