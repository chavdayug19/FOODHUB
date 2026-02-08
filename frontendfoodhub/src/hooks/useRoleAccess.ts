import { useAuth } from '@/context/AuthContext';
import { UserPermissions } from '@/types';

/**
 * Custom hook to check role-based and dynamic permissions
 */
export function useRoleAccess() {
    const { user, isAuthenticated } = useAuth();

    const hasRole = (roles: Array<'admin' | 'vendor' | 'customer' | 'staff'>) => {
        if (!isAuthenticated || !user) return false;
        return roles.includes(user.role);
    };

    // Helper to check specific permissions
    const hasPermission = (permission: keyof UserPermissions): boolean => {
        if (!isAuthenticated || !user) return false;

        // Admin has all permissions by default
        if (user.role === 'admin') return true;

        // Check for specific user override
        if (user.permissions && user.permissions[permission] !== undefined) {
            return user.permissions[permission] === true;
        }

        // Default role-based permissions (if no override exists)
        const defaults: Record<string, UserPermissions> = {
            vendor: {
                view_dashboard: true,
                manage_menu: true,
                manage_staff: true,
                view_orders: true,
                update_order_status: true,
                view_analytics: true,
                manage_qr_codes: true
            },
            staff: {
                view_dashboard: false, // Default is false for staff (user's specific request)
                manage_menu: false,
                manage_staff: false,
                view_orders: true,
                update_order_status: true,
                view_analytics: false,
                manage_qr_codes: false
            }
        };

        const roleDefaults = defaults[user.role];
        return roleDefaults ? !!roleDefaults[permission] : false;
    };

    return {
        user,
        isAuthenticated,
        hasRole,
        isAdmin: hasRole(['admin']),
        isVendor: hasRole(['vendor']),
        isStaff: hasRole(['staff']),

        // Dynamic Permissions
        canViewDashboard: hasPermission('view_dashboard'),
        canManageMenu: hasPermission('manage_menu'),
        canManageStaff: hasPermission('manage_staff'),
        canViewOrders: hasPermission('view_orders'),
        canUpdateOrderStatus: hasPermission('update_order_status'),
        canViewAnalytics: hasPermission('view_analytics'),
        canManageQRCodes: hasPermission('manage_qr_codes'),

        // Helper to check any permission string
        hasPermission
    };
}
