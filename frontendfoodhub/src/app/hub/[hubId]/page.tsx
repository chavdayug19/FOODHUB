'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Vendor, Hub } from '@/types';
import { MapPin, Store, ChevronRight, Users, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { VendorCardSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface PageProps {
    params: { hubId: string };
}

export default function HubPage({ params }: PageProps) {
    const { hubId } = params;

    const [hub, setHub] = useState<Hub | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const { setHubId } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (hubId) {
            setHubId(hubId);
            fetchData();
        }
    }, [hubId, setHubId]);

    const fetchData = async () => {
        try {
            // Fetch hub details
            const hubResponse = await api.get(`/hubs/${hubId}`);
            setHub(hubResponse.data.data || hubResponse.data);

            // Fetch vendors for this hub
            const vendorsResponse = await api.get(`/vendors?hubId=${hubId}`);
            const vendorData = vendorsResponse.data.data || vendorsResponse.data;
            setVendors(Array.isArray(vendorData) ? vendorData : []);
        } catch (error: any) {
            toast.error('Failed to load hub data');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const activeVendors = vendors.filter(v => v.isActive);

    return (
        <div className="page-container min-h-screen">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hub Header */}
                {loading ? (
                    <div className="mb-8">
                        <div className="skeleton h-8 w-48 mb-2" />
                        <div className="skeleton h-5 w-32" />
                    </div>
                ) : hub ? (
                    <div className="mb-8 animate-fadeIn">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm font-medium">Food Hub</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {hub.name}
                        </h1>
                        {hub.location && (
                            <p className="text-gray-500 dark:text-gray-400">
                                {hub.location}
                            </p>
                        )}
                        {hub.description && (
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                {hub.description}
                            </p>
                        )}
                    </div>
                ) : null}

                {/* Vendor Stats */}
                {!loading && (
                    <div className="flex items-center gap-6 mb-6 text-sm text-gray-500 dark:text-gray-400 animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            <span>{activeVendors.length} Active Vendors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Open Now</span>
                        </div>
                    </div>
                )}

                {/* Section Title */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Choose a Vendor
                </h2>

                {/* Vendors List */}
                <div className="space-y-4">
                    {loading ? (
                        <>
                            <VendorCardSkeleton />
                            <VendorCardSkeleton />
                            <VendorCardSkeleton />
                        </>
                    ) : activeVendors.length === 0 ? (
                        <EmptyState
                            type="vendors"
                            message="No vendors available"
                            actionLabel="Go Back"
                            actionHref="/"
                        />
                    ) : (
                        activeVendors.map((vendor, index) => (
                            <Link
                                key={vendor._id}
                                href={`/vendor/${vendor._id}`}
                                className="card p-4 flex items-center gap-4 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-800 transition-all group animate-slideUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Vendor Logo */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center flex-shrink-0">
                                    <Store className="w-8 h-8 text-orange-500" />
                                </div>

                                {/* Vendor Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                                        {vendor.name}
                                    </h3>
                                    {vendor.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {vendor.description}
                                        </p>
                                    )}
                                    {vendor.categories && vendor.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {vendor.categories.slice(0, 3).map((cat, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Badge & Arrow */}
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                        Open
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
