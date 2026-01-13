// User types
export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'vendor' | 'customer';
    vendorId?: string;
}

// Hub types
export interface Hub {
    _id: string;
    name: string;
    location: string;
    qrCode: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

// Vendor types
export interface Vendor {
    _id: string;
    name: string;
    description?: string;
    hubId: string;
    userId?: string;
    logo?: string;
    isActive: boolean;
    categories?: string[];
    rating?: number;
    createdAt: string;
}

// Menu Item types
export interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    vendorId: string;
    image?: string;
    isAvailable: boolean;
    preparationTime?: number;
    createdAt: string;
}

// Cart types
export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    vendorId: string;
    vendorName: string;
}

export interface CartState {
    items: CartItem[];
    hubId: string | null;
    tableInfo: string;
    customerName: string;
}

// Order types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface VendorOrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface VendorOrder {
    vendorId: string;
    vendorName?: string;
    items: VendorOrderItem[];
    status: OrderStatus;
    subtotal: number;
}

export interface Order {
    _id: string;
    hubId: string;
    vendorOrders: VendorOrder[];
    customerName: string;
    tableInfo?: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}
