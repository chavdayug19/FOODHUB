'use client';

import VendorSidebar from '@/components/VendorSidebar';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <VendorSidebar />
            {/* Main Content Area - Shifted right by sidebar width (w-64 = 256px) */}
            <main className="ml-64 p-8 min-h-screen transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
