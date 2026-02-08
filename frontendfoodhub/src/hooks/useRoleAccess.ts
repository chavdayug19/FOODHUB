import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to check role-based permissions
 * Usage: const { isAdmin, isVendor, hasRole, canAccessDashboard } = useRoleAccess();
 */
export function useRoleAccess() {
    const { user, isAuthenticated } = useAuth();

    const hasRole = (roles: Array<'admin' | 'vendor' | 'customer' | 'staff'>) => {
        if (!isAuthenticated || !user) return false;
        return roles.includes(user.role);
    };

    const isAdmin = hasRole(['admin']);
    const isVendor = hasRole(['vendor']);
    const isStaff = hasRole(['staff']);
    const isCustomer = hasRole(['customer']);

    // Combined permissions
    const canAccessVendorDashboard = hasRole(['vendor', 'staff']);
    const canAccessAdminDashboard = hasRole(['admin']);
    const canManageStaff = hasRole(['vendor', 'admin']);
    const canManageOrders = hasRole(['vendor', 'staff', 'admin']);
    const canManageMenu = hasRole(['vendor', 'admin']);

    return {
        user,
        isAuthenticated,
        hasRole,
        isAdmin,
        isVendor,
        isStaff,
        isCustomer,
        canAccessVendorDashboard,
        canAccessAdminDashboard,
        canManageStaff,
        canManageOrders,
        canManageMenu,
    };
}
