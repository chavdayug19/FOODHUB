'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import {
    UtensilsCrossed,
    ShoppingCart,
    Sun,
    Moon,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { getTotalItems } = useCart();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const totalItems = getTotalItems();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/auth')) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Food<span className="text-orange-500">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-600" />
                            )}
                        </button>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                {user?.role === 'admin' && (
                                    <Link
                                        href="/dashboard/admin"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                )}
                                {user?.role === 'vendor' && (
                                    <Link
                                        href="/dashboard/vendor"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user?.name}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="btn-primary text-sm py-2 px-4"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fadeIn">
                    <div className="px-4 py-4 space-y-3">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-5 h-5 text-gray-600" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                </div>
                                {(user?.role === 'admin' || user?.role === 'vendor') && (
                                    <Link
                                        href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/vendor'}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full btn-primary text-center"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
