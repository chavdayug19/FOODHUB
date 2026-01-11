"use client";
import Link from 'next/link';
import { QrCode, UtensilsCrossed, ChefHat, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <UtensilsCrossed className="w-6 h-6" />
          <span>FoodHub</span>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/auth/login" className="hover:text-orange-600 transition-colors">Vendor Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 pb-2">
            Order Food <br className="hidden md:block" /> directly from your table.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Skip the lines. Scan the QR code at your table to browse menus from multiple vendors and order instantly.
          </p>
        </div>

        {/* Action Card */}
        <div className="mt-12 p-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-md mx-auto flex flex-col items-center space-y-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full">
              <QrCode className="w-12 h-12 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Ready to eat?</h3>
              <p className="text-gray-500 dark:text-gray-400">Simulate scanning a table QR code to start.</p>
            </div>
            <Link
              href="/hub/hub-001"
              className="group w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              Scan QR Code
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Scan & Browse</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No app download needed. Just scan and view all vendor menus in one place.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Vendor Cart</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Order burgers, pizza, and drinks in a single checkout process.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Real-time Updates</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your order status live as the kitchen prepares your meal.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
