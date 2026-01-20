'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If table param exists in URL (e.g. /?table=5), likely scanned a Hub QR
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    const hubParam = params.get('hubId');

    if (tableParam) {
      // If we have a table param, we might want to automatically "scan" for the default hub 
      // OR if hubId is provided in URL, go there.
      // For now, let's assume the QR might just be the Hub Code OR the URL contains context.
      // User request: "if user scan directly from table than open website and they see the venders list"

      if (hubParam) {
        router.push(`/hub/${hubParam}?table=${tableParam}`);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!qrCode.trim()) {
      toast.error('Please enter a FoodHub Name or Code');
      return;
    }

    setLoading(true);

    try {
      // Allow searching by Name or Code. 
      // API lookup needs to support name search or we filter client side if list is small, 
      // but let's assume existing endpoint works for ID/Code.
      // We will try to find a hub that matches.
      const response = await api.get(`/hubs?search=${qrCode.trim()}`);
      const headers = response.data;
      // The API response structure for list might be { data: [...] }
      const hubs = Array.isArray(headers) ? headers : (headers.data || []);

      const foundHub = hubs.find((h: any) =>
        h.name.toLowerCase().includes(qrCode.trim().toLowerCase()) ||
        h._id === qrCode.trim()
      );

      if (foundHub) {
        toast.success(`Found: ${foundHub.name}`);
        router.push(`/hub/${foundHub._id}`);
      } else {
        // Fallback to QR lookup endpoint if it exists
        try {
          const qrRes = await api.get(`/hubs/qr/${qrCode.trim()}`);
          const hub = qrRes.data.data || qrRes.data;
          if (hub && hub._id) {
            router.push(`/hub/${hub._id}`);
          } else {
            toast.error('FoodHub not found');
          }
        } catch {
          toast.error('FoodHub not found');
        }
      }
    } catch (error: any) {
      toast.error('Error searching for FoodHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 dark:from-orange-600/5 dark:to-amber-600/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl shadow-2xl shadow-orange-500/25 mb-8 animate-fadeIn">
              <QrCode className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slideUp">
              Scan & Order
              <span className="block text-orange-500">Delicious Food</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 animate-slideUp">
              Enter your table QR code or scan to discover amazing food from local vendors
            </p>

            {/* QR Code Input Form */}
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto animate-slideUp"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Enter QR code (e.g., HUB001)"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg shadow-gray-100 dark:shadow-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 btn-primary text-lg py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Find My Hub
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">...or Explore Popular Hubs</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Don't have a QR code? Browse our top food courts</p>
        </div>

        <ExploreHubs />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="card p-6 text-center hover:shadow-xl transition-shadow animate-fadeIn">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Scan QR Code
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Simply scan the QR code on your table to access the menu
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card p-6 text-center hover:shadow-xl transition-shadow animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multiple Vendors
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Browse and order from multiple food vendors in one place
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card p-6 text-center hover:shadow-xl transition-shadow animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Track Orders
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Real-time order tracking from kitchen to your table
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreHubs() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        // Assuming we can fetch hubs publicly. If not, we might need a public endpoint.
        const res = await api.get('/hubs');
        const data = res.data.data || res.data;
        setHubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch hubs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHubs();
  }, []);

  if (loading) return <div className="flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  if (hubs.length === 0) return <p className="text-center text-gray-400">No hubs found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {hubs.map((hub) => (
        <Link href={`/hub/${hub._id}`} key={hub._id} className="card p-5 hover:shadow-lg transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">{hub.name}</h3>
              <p className="text-xs text-gray-500">{hub.location || 'Location'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
