'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Hub, Vendor } from '@/types';
import {
    LayoutDashboard,
    MapPin,
    Store,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    LogOut,
    Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();

    const [hubs, setHubs] = useState<Hub[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'hubs' | 'vendors'>('hubs');

    // Modal States
    const [showHubModal, setShowHubModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [hubForm, setHubForm] = useState({ name: '', location: '', qrCode: '', description: '' });
    const [vendorForm, setVendorForm] = useState({ name: '', description: '', hubId: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                toast.error('Admin access required');
                router.push('/auth/login');
                return;
            }
            fetchData();
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        try {
            const [hubsRes, vendorsRes] = await Promise.all([
                api.get('/hubs'),
                api.get('/vendors'),
            ]);

            setHubs(hubsRes.data.data || hubsRes.data || []);
            setVendors(vendorsRes.data.data || vendorsRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hubForm.name || !hubForm.qrCode) {
            toast.error('Name and QR Code are required');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/hubs', hubForm);
            const newHub = response.data.data || response.data;
            setHubs([...hubs, newHub]);
            setShowHubModal(false);
            setHubForm({ name: '', location: '', qrCode: '', description: '' });
            toast.success('Hub created successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create hub');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorForm.name || !vendorForm.hubId) {
            toast.error('Name and Hub are required');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/vendors', vendorForm);
            const newVendor = response.data.data || response.data;
            setVendors([...vendors, newVendor]);
            setShowVendorModal(false);
            setVendorForm({ name: '', description: '', hubId: '' });
            toast.success('Vendor created successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create vendor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHub = async (hubId: string) => {
        if (!confirm('Are you sure you want to delete this hub?')) return;

        try {
            await api.delete(`/hubs/${hubId}`);
            setHubs(hubs.filter(h => h._id !== hubId));
            toast.success('Hub deleted');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete hub');
        }
    };

    const handleDeleteVendor = async (vendorId: string) => {
        if (!confirm('Are you sure you want to delete this vendor?')) return;

        try {
            await api.delete(`/vendors/${vendorId}`);
            setVendors(vendors.filter(v => v._id !== vendorId));
            toast.success('Vendor deleted');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete vendor');
        }
    };

    if (authLoading || loading) {
        return <LoadingSpinner fullScreen text="Loading dashboard..." />;
    }

    return (
        <div className="page-container min-h-screen">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-orange-500" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage hubs and vendors
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{hubs.length}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hubs</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Store className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{vendors.length}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Vendors</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Store className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {vendors.filter(v => v.isActive).length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Active Vendors</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {hubs.filter(h => h.isActive).length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Active Hubs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('hubs')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'hubs'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Hubs
                    </button>
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'vendors'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        <Store className="w-4 h-4 inline mr-2" />
                        Vendors
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'hubs' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Food Hubs</h2>
                            <button
                                onClick={() => setShowHubModal(true)}
                                className="btn-primary py-2 px-4 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Hub
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {hubs.map((hub) => (
                                <div key={hub._id} className="card p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{hub.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{hub.location}</p>
                                                <p className="text-xs font-mono text-orange-500 mt-1">QR: {hub.qrCode}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${hub.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                }`}>
                                                {hub.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteHub(hub._id)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'vendors' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vendors</h2>
                            <button
                                onClick={() => setShowVendorModal(true)}
                                className="btn-primary py-2 px-4 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Vendor
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {vendors.map((vendor) => (
                                <div key={vendor._id} className="card p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Store className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{vendor.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                    {vendor.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${vendor.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                }`}>
                                                {vendor.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteVendor(vendor._id)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Hub Modal */}
                {showHubModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="card p-6 w-full max-w-md animate-slideUp">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Hub</h3>
                                <button
                                    onClick={() => setShowHubModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateHub} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Hub Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={hubForm.name}
                                        onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Food Court Central"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        QR Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={hubForm.qrCode}
                                        onChange={(e) => setHubForm({ ...hubForm, qrCode: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., HUB001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={hubForm.location}
                                        onChange={(e) => setHubForm({ ...hubForm, location: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Building A, Floor 2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={hubForm.description}
                                        onChange={(e) => setHubForm({ ...hubForm, description: e.target.value })}
                                        className="input-field resize-none"
                                        rows={3}
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowHubModal(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Vendor Modal */}
                {showVendorModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="card p-6 w-full max-w-md animate-slideUp">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Vendor</h3>
                                <button
                                    onClick={() => setShowVendorModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateVendor} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Vendor Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.name}
                                        onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Pizza Palace"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Select Hub *
                                    </label>
                                    <select
                                        value={vendorForm.hubId}
                                        onChange={(e) => setVendorForm({ ...vendorForm, hubId: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a hub...</option>
                                        {hubs.map((hub) => (
                                            <option key={hub._id} value={hub._id}>
                                                {hub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={vendorForm.description}
                                        onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                                        className="input-field resize-none"
                                        rows={3}
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowVendorModal(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
