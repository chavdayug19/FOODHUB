'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Save, Store, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VendorSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        logo: ''
    });

    useEffect(() => {
        if (user?.vendorId) {
            fetchVendorDetails();
        }
    }, [user]);

    const fetchVendorDetails = async () => {
        try {
            const response = await api.get(`/vendors/${user?.vendorId}`);
            const data = response.data.data || response.data;
            setFormData({
                name: data.name || '',
                description: data.description || '',
                isActive: data.isActive,
                logo: data.logo || ''
            });
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.put(`/vendors/${user?.vendorId}`, formData);
            toast.success('Settings saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading settings..." />;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Store className="w-8 h-8 text-orange-500" />
                    Restaurant Settings
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage your shop profile and visibility</p>
            </div>

            <div className="card p-8 animate-slideUp">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Logo Section Placeholder */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden group">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Restaurant Logo</h3>
                            <p className="text-sm text-gray-500">Upload a square image (max 2MB)</p>
                            {/* Disabled file input for now as we haven't implemented robust file upload yet */}
                            <button type="button" className="mt-2 text-sm text-orange-500 font-medium hover:text-orange-600 disabled:opacity-50" disabled>
                                Upload New Logo (Coming Soon)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description / Tagline
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field min-h-[100px] resize-none"
                                placeholder="Describe your restaurant..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Shop Visibility</h4>
                                <p className="text-sm text-gray-500">Enable or disable your shop on the platform</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2 px-8"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
