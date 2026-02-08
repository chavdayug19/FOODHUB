'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Shield, Save, X, Loader2 } from 'lucide-react';
import { UserPermissions } from '@/types';

interface StaffPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    initialPermissions: UserPermissions;
    onUpdate: () => void;
}

const permissionLabels: Record<keyof UserPermissions, string> = {
    view_dashboard: 'Access Dashboard',
    manage_menu: 'Manage Menu',
    manage_staff: 'Manage Staff',
    view_orders: 'View Orders',
    update_order_status: 'Update Order Status',
    view_analytics: 'View Analytics',
    manage_qr_codes: 'Manage QR Codes'
};

export default function StaffPermissionModal({
    isOpen,
    onClose,
    userId,
    userName,
    initialPermissions = {},
    onUpdate
}: StaffPermissionModalProps) {
    const [permissions, setPermissions] = useState<UserPermissions>({
        view_dashboard: false,
        manage_menu: false,
        manage_staff: false,
        view_orders: true,
        update_order_status: true,
        view_analytics: false,
        manage_qr_codes: false,
        ...initialPermissions
    });
    const [saving, setSaving] = useState(false);

    const handleToggle = (permission: keyof UserPermissions) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/permissions/user', { userId, permissions });
            toast.success(`Permissions updated for ${userName}`);
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl scale-in-center">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Staff Permissions</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((perm) => (
                        <div
                            key={perm}
                            onClick={() => handleToggle(perm)}
                            className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {permissionLabels[perm]}
                            </span>
                            <div className={`w-10 h-6 rounded-full transition-colors relative ${permissions[perm] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                                }`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${permissions[perm] ? 'left-5' : 'left-1'
                                    }`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Save Permissions</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
