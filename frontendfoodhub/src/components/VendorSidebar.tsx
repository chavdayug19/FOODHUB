'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    QrCode,
    ShoppingBag,
    UserPlus,
    BarChart3,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function VendorSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [shopName, setShopName] = useState('FoodHub Vendor');

    useEffect(() => {
        const fetchShopName = async () => {
            if (user?.vendorId) {
                try {
                    const res = await api.get(`/vendors/${user.vendorId}`);
                    if (res.data && res.data.name) {
                        setShopName(res.data.name);
                    }
                } catch (err) {
                    console.error("Failed to fetch shop name", err);
                }
            }
        };
        fetchShopName();
    }, [user?.vendorId]);

    // Helper to check active state
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const menuItems = [
        { label: 'Dashboard', href: '/dashboard/vendor', icon: LayoutDashboard },
        { label: 'Menu Management', href: '/dashboard/vendor/menu', icon: UtensilsCrossed },
        { label: 'Generate QR', href: '/dashboard/vendor/qr', icon: QrCode },
        { label: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag },
        { label: 'Staff Management', href: '/dashboard/vendor/staff', icon: UserPlus },
        { label: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart3 },
        { label: 'Customers', href: '/dashboard/vendor/customers', icon: Users },
        { label: 'Settings', href: '/dashboard/vendor/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-center text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent break-words w-full">
                    {shopName}
                </h3>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href) && (item.href !== '/dashboard/vendor' || pathname === '/dashboard/vendor');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${active
                                        ? 'bg-gray-800 text-green-400 border-r-4 border-green-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-6 py-3 w-full text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
