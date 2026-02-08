'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Shield, Save, Check, X, Loader2 } from 'lucide-react';

interface PermissionSet {
    view_dashboard: boolean;
    manage_menu: boolean;
    manage_staff: boolean;
    view_orders: boolean;
    update_order_status: boolean;
    view_analytics: boolean;
    manage_qr_codes: boolean;
}

interface RolePermission {
    _id: string;
    role: 'vendor' | 'staff';
    permissions: PermissionSet;
}

const permissionLabels: Record<keyof PermissionSet, string> = {
    view_dashboard: 'Access Dashboard',
    manage_menu: 'Manage Menu',
    manage_staff: 'Manage Staff',
    view_orders: 'View Orders',
    update_order_status: 'Update Order Status',
    view_analytics: 'View Analytics',
    manage_qr_codes: 'Manage QR Codes'
};

export default function PermissionMatrix() {
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/permissions/roles');
            setRolePermissions(response.data);
        } catch (error) {
            toast.error('Failed to fetch permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (roleIndex: number, permission: keyof PermissionSet) => {
        const updated = [...rolePermissions];
        updated[roleIndex].permissions[permission] = !updated[roleIndex].permissions[permission];
        setRolePermissions(updated);
    };

    const savePermissions = async (role: string, permissions: PermissionSet) => {
        setSaving(role);
        try {
            await api.post('/permissions/roles', { role, permissions });
            toast.success(`Permissions updated for ${role}`);
        } catch (error) {
            toast.error('Failed to save permissions');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['vendor', 'staff'].map((targetRole) => {
                const roleData = rolePermissions.find(rp => rp.role === targetRole) || {
                    role: targetRole as 'vendor' | 'staff',
                    permissions: {
                        view_dashboard: targetRole === 'vendor',
                        manage_menu: targetRole === 'vendor',
                        manage_staff: targetRole === 'vendor',
                        view_orders: true,
                        update_order_status: true,
                        view_analytics: targetRole === 'vendor',
                        manage_qr_codes: targetRole === 'vendor'
                    }
                };

                const roleIndex = rolePermissions.findIndex(rp => rp.role === targetRole);
                // If not found in fetched data, we'll treat it as a new entry if we toggle anything

                return (
                    <div key={targetRole} className="card p-6 shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                                        {targetRole} Permissions
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Global defaults for all {targetRole}s
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => savePermissions(targetRole, roleData.permissions)}
                                disabled={saving === targetRole}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50"
                            >
                                {saving === targetRole ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>Save</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(Object.keys(permissionLabels) as Array<keyof PermissionSet>).map((perm) => (
                                <div
                                    key={perm}
                                    onClick={() => {
                                        if (roleIndex !== -1) {
                                            handleToggle(roleIndex, perm);
                                        } else {
                                            // Handle case where role not in DB yet
                                            const newRolePerm = { ...roleData, permissions: { ...roleData.permissions, [perm]: !roleData.permissions[perm] } };
                                            setRolePermissions([...rolePermissions, newRolePerm as RolePermission]);
                                        }
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {permissionLabels[perm]}
                                    </span>
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${roleData.permissions[perm] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${roleData.permissions[perm] ? 'left-5' : 'left-1'
                                            }`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
