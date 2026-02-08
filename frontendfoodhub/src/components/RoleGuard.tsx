'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Array<'admin' | 'vendor' | 'customer' | 'staff'>;
    redirectTo?: string;
}

/**
 * RoleGuard Component
 * Protects routes based on user roles
 * Usage: <RoleGuard allowedRoles={['admin', 'vendor']}>...</RoleGuard>
 */
export default function RoleGuard({ children, allowedRoles, redirectTo = '/auth/login' }: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth to load
        if (isLoading) return;

        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // Redirect if user role is not allowed
        if (user && !allowedRoles.includes(user.role)) {
            // Redirect based on user role
            if (user.role === 'admin') {
                router.push('/dashboard/admin');
            } else if (user.role === 'vendor' || user.role === 'staff') {
                router.push('/dashboard/vendor');
            } else {
                router.push('/');
            }
        }
    }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated or wrong role
    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
        return null;
    }

    // Render children if authorized
    return <>{children}</>;
}
