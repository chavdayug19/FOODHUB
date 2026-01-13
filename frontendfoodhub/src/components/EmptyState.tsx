import { ShoppingBag, Search, AlertCircle, FileX } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    type: 'cart' | 'search' | 'orders' | 'error' | 'vendors' | 'menu';
    message?: string;
    actionLabel?: string;
    actionHref?: string;
}

const icons = {
    cart: ShoppingBag,
    search: Search,
    orders: FileX,
    error: AlertCircle,
    vendors: ShoppingBag,
    menu: ShoppingBag,
};

const defaultMessages = {
    cart: "Your cart is empty",
    search: "No results found",
    orders: "No orders yet",
    error: "Something went wrong",
    vendors: "No vendors available",
    menu: "No menu items available",
};

export default function EmptyState({
    type,
    message,
    actionLabel,
    actionHref
}: EmptyStateProps) {
    const Icon = icons[type];
    const displayMessage = message || defaultMessages[type];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {displayMessage}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                {type === 'cart' && "Start browsing vendors and add items to your cart"}
                {type === 'search' && "Try adjusting your search or filters"}
                {type === 'orders' && "Your orders will appear here once you place them"}
                {type === 'error' && "Please try again later"}
                {type === 'vendors' && "There are no active vendors in this hub"}
                {type === 'menu' && "This vendor hasn't added any items yet"}
            </p>
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
