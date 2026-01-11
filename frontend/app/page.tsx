"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-8">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
        QR Food Court
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
        Scan a QR code at your table to start ordering from multiple vendors at once.
      </p>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm">
        <p className="mb-4 font-semibold">Simulate Scan:</p>
        <Link
          href="/hub/hub-001"
          className="block w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          Scan "Downtown Food Court"
        </Link>
      </div>

      <div className="flex space-x-4 text-sm text-gray-500">
        <Link href="/auth/login" className="hover:underline">Vendor Login</Link>
        <span>•</span>
        <Link href="/auth/login" className="hover:underline">Admin Login</Link>
      </div>
    </div>
  );
}
