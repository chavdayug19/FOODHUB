'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { QrCode, Plus, Trash2, Printer, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VendorQRPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [vendor, setVendor] = useState<any>(null);
    const [tables, setTables] = useState<any[]>([]);

    // Form State
    const [newTableNo, setNewTableNo] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (user?.vendorId) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/vendors/${user?.vendorId}`);
            const data = response.data.data || response.data;
            setVendor(data);
            setTables(data.tables || []);
        } catch (error) {
            toast.error('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableNo.trim()) return;

        // Check duplicate
        if (tables.find(t => t.tableNo === newTableNo)) {
            toast.error('Table number already exists');
            return;
        }

        setAdding(true);
        try {
            // Generate QR Data/URL
            // The URL points to the shop page with a query param for table
            const shopUrl = `${window.location.protocol}//${window.location.host}/shop/${user?.vendorId}?table=${newTableNo}`;
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shopUrl)}`;

            const newTable = {
                tableNo: newTableNo,
                qrCode: qrApiUrl
            };

            const updatedTables = [...tables, newTable];

            // Update Backend
            // We use the generic update endpoint
            await api.put(`/vendors/${user?.vendorId}`, {
                tables: updatedTables
            });

            setTables(updatedTables);
            setNewTableNo('');
            toast.success('Table added');
        } catch (error) {
            toast.error('Failed to add table');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteTable = async (tableNo: string) => {
        if (!confirm(`Delete Table ${tableNo}?`)) return;

        try {
            const updatedTables = tables.filter(t => t.tableNo !== tableNo);
            await api.put(`/vendors/${user?.vendorId}`, {
                tables: updatedTables
            });
            setTables(updatedTables);
            toast.success('Table deleted');
        } catch (error) {
            toast.error('Failed to delete table');
        }
    };

    const downloadQr = async (url: string, tableNo: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `QR-Table-${tableNo}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error('Failed to download');
        }
    };

    if (loading) return <LoadingSpinner text="Loading QR codes..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <QrCode className="w-8 h-8 text-orange-500" />
                        Table Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Generate unique QR codes for each table</p>
                </div>

                <form onSubmit={handleAddTable} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Table No. (e.g. 5)"
                        value={newTableNo}
                        onChange={(e) => setNewTableNo(e.target.value)}
                        className="input-field w-full md:w-48"
                        required
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Table
                    </button>
                </form>
            </div>

            {/* General Shop QR */}
            <div className="card p-6 border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm flex-shrink-0">
                        {user?.vendorId ? (
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.protocol}//${window.location.host}/shop/${user.vendorId}`)}`}
                                alt="General Shop QR"
                                className="w-full h-full object-contain"
                            />
                        ) : <div className="w-full h-full bg-gray-200 animate-pulse" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">General Shop QR</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Use this QR code for your storefront or general marketing. Customers scanning this will be asked to enter their table number manually at checkout.
                        </p>
                        <div className="flex gap-3 justify-center md:justify-start">
                            <a
                                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.protocol}//${window.location.host}/shop/${user?.vendorId}`)}`}
                                download="General-Shop-QR.png"
                                target="_blank"
                                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download
                            </a>
                            <a
                                href={`${window.location.protocol}//${window.location.host}/shop/${user?.vendorId}`}
                                target="_blank"
                                className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                            >
                                Test Link <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {
                tables.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Tables Added</h3>
                        <p className="text-gray-500 mt-2">Add a table number above to generate your first QR code.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tables.map((table) => (
                            <div key={table.tableNo} className="card p-4 flex flex-col items-center text-center animate-slideUp group">
                                <div className="w-full aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 p-4 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                    <img src={table.qrCode} alt={`QR Table ${table.tableNo}`} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Table {table.tableNo}
                                </h3>
                                <a
                                    href={`${window.location.protocol}//${window.location.host}/shop/${user?.vendorId}?table=${table.tableNo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 mb-4"
                                >
                                    Test Link <ExternalLink className="w-3 h-3" />
                                </a>

                                <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                                    <button
                                        onClick={() => downloadQr(table.qrCode, table.tableNo)}
                                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTable(table.tableNo)}
                                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
