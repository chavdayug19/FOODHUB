'use client';

import RoleGuard from '@/components/RoleGuard';
import PermissionMatrix from '@/components/PermissionMatrix';
import { ShieldAlert, Info } from 'lucide-react';

export default function AdminPermissionsPage() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Roles & Permissions
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Configure global access levels for vendors and staff members.
                        </p>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Changes made here will set the <strong>default permissions</strong> for all users with that role.
                            Individual vendors can still override these for their own staff members.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                    <PermissionMatrix />
                </div>
            </div>
        </RoleGuard>
    );
}
