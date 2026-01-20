'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MenuManagementPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        availability: true
    });

    useEffect(() => {
        if (user) fetchItems();
    }, [user]);

    const fetchItems = async () => {
        try {
            // Fetch items for this vendor
            const response = await api.get(`/menu-items?vendorId=${user?.vendorId}`);
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                vendorId: user?.vendorId
            };

            if (editingItem) {
                await api.put(`/menu-items/${editingItem._id}`, payload);
                toast.success('Item updated successfully');
            } else {
                await api.post('/menu-items', payload);
                toast.success('Item added successfully');
            }

            setIsModalOpen(false);
            setEditingItem(null);
            resetForm();
            fetchItems();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/menu-items/${id}`);
            toast.success('Item deleted');
            fetchItems();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category,
            description: item.description || '',
            availability: item.availability
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            category: '',
            description: '',
            availability: true
        });
    };

    if (loading) return <LoadingSpinner text="Loading menu..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Add or edit items for your restaurant</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group">
                        <div className="h-48 bg-gray-100 dark:bg-gray-900 relative">
                            {/* Placeholder for Item Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-10 h-10 opacity-50" />
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(item)}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:text-blue-700 shadow-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:text-red-700 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                        {item.category}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{item.name}</h3>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">₹{item.price}</span>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.availability
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.availability ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-scaleUp">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Main">Main Course</option>
                                        <option value="Appetizer">Appetizer</option>
                                        <option value="Dessert">Dessert</option>
                                        <option value="Beverage">Beverage</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="Describe the dish..."
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="availability"
                                    checked={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <label htmlFor="availability" className="text-sm text-gray-700 dark:text-gray-300">Item is available for ordering</label>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Save Changes' : 'Create Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
