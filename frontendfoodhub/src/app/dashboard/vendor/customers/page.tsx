'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CustomersPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.vendorId) {
            fetchCustomers();
        }
    }, [user]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/orders');
            const orders = response.data.data || response.data;

            if (!Array.isArray(orders)) {
                setLoading(false);
                return;
            }

            // Aggregate customers from orders
            const customerMap = new Map();

            orders.forEach((order: any) => {
                const mySubOrder = order.vendorOrders.find((vo: any) => vo.vendorId === user?.vendorId);

                if (mySubOrder) {
                    const name = order.customerName || 'Unknown Guest';

                    if (!customerMap.has(name)) {
                        customerMap.set(name, {
                            id: order._id, // Use first order ID as pseudo-ID
                            name: name,
                            totalOrders: 0,
                            totalSpent: 0,
                            lastOrder: new Date(0), // Epoch
                            status: 'Active'
                        });
                    }

                    const cust = customerMap.get(name);
                    cust.totalOrders += 1;
                    cust.totalSpent += mySubOrder.subtotal || 0;

                    const orderDate = new Date(order.createdAt);
                    if (orderDate > cust.lastOrder) {
                        cust.lastOrder = orderDate;
                    }
                }
            });

            setCustomers(Array.from(customerMap.values()));

        } catch (error) {
            console.error(error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner text="Loading customers..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-8 h-8 text-orange-500" />
                        Customers
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">People who ordered from your shop</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Total Orders</th>
                                <th className="p-4 font-medium">Total Spent</th>
                                <th className="p-4 font-medium">Last Order</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No customers found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                                                    {/* Placeholder email as we don't have it in Order schema */}
                                                    <p className="text-xs text-gray-500">guest@foodhub.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">
                                            {customer.totalOrders} orders
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            ₹{customer.totalSpent.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {customer.lastOrder.toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
