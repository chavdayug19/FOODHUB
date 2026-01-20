'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    UtensilsCrossed,
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    User,
    Phone,
    ArrowRight,
    Building2,
    UserCircle,
    Store,
    BadgeCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    // Basic Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'customer' as 'admin' | 'vendor' | 'customer' | 'staff',
    });

    // Vendor/Staff Specific Data
    const [vendorData, setVendorData] = useState({
        hubId: '',
        vendorName: '', // For Owner
        vendorId: '',   // For Staff
        vendorRole: 'owner' as 'owner' | 'staff'
    });

    const [hubs, setHubs] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Fetch Hubs on Mount
        const fetchHubs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/v1/hubs');
                if (res.ok) {
                    const data = await res.json();
                    setHubs(data);
                }
            } catch (err) {
                console.error("Failed to fetch hubs", err);
            }
        };
        fetchHubs();
    }, []);

    useEffect(() => {
        // Fetch Vendors when Hub changes (for Staff)
        if (vendorData.hubId && vendorData.vendorRole === 'staff') {
            const fetchVendors = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/v1/vendors?hubId=${vendorData.hubId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setVendors(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch vendors", err);
                }
            };
            fetchVendors();
        } else {
            setVendors([]);
        }
    }, [vendorData.hubId, vendorData.vendorRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVendorData({ ...vendorData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Determine final role to send to backend
            // If user selected 'vendor' (UI), check sub-role.
            // If sub-role is 'owner', valid backend role is 'vendor'.
            // If sub-role is 'staff', valid backend role is 'staff'.

            let finalRole = formData.role;
            if (formData.role === 'vendor') {
                if (vendorData.vendorRole === 'owner') {
                    finalRole = 'vendor';
                } else {
                    finalRole = 'staff';
                }
            }

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: finalRole as any,
                // Additional fields
                hubId: vendorData.hubId,
                vendorName: vendorData.vendorName,
                vendorId: vendorData.vendorId
            });

            toast.success('Account created successfully!');

            // Redirect based on role
            if (finalRole === 'admin') {
                router.push('/dashboard/admin');
            } else if (finalRole === 'vendor') {
                router.push('/dashboard/vendor');
            } else if (finalRole === 'staff') {
                // Staff might share vendor dashboard or have their own
                router.push('/dashboard/vendor');
            } else {
                router.push('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // UI Roles for the main switch
    const roles = [
        { id: 'customer', label: 'Normal User', icon: UserCircle },
        { id: 'vendor', label: 'Vendor / Staff', icon: Building2 },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-10 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background Pattern */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-green-300/20 dark:bg-green-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-slideUp">
                {/* Card */}
                <div className="card p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/25 mb-3">
                            <UtensilsCrossed className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Account
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            Join FoodHub today
                        </p>
                    </div>

                    {/* Main Role Selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, role: role.id as any })}
                                className={`p-3 rounded-xl border-2 transition-all ${formData.role === role.id
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <role.icon
                                    className={`w-6 h-6 mx-auto mb-1 ${formData.role === role.id
                                        ? 'text-green-500'
                                        : 'text-gray-400'
                                        }`}
                                />
                                <p className={`text-sm font-medium ${formData.role === role.id
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {role.label}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Vendor Sub-Tabs (Only if Vendor selected) */}
                        {formData.role === 'vendor' && (
                            <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex space-x-1">
                                <button
                                    type="button"
                                    onClick={() => setVendorData({ ...vendorData, vendorRole: 'owner' })}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${vendorData.vendorRole === 'owner'
                                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <Store className="w-4 h-4 inline mr-1" />
                                    Vendor Owner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVendorData({ ...vendorData, vendorRole: 'staff' })}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${vendorData.vendorRole === 'staff'
                                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <BadgeCheck className="w-4 h-4 inline mr-1" />
                                    Vendor Staff
                                </button>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="input-field input-with-icon"
                                    required
                                />
                            </div>
                        </div>

                        {/* Hub Selection (For Vendor Role) */}
                        {formData.role === 'vendor' && (
                            <div>
                                <label htmlFor="hubId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Select Hub
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        id="hubId"
                                        name="hubId"
                                        value={vendorData.hubId}
                                        onChange={handleVendorChange}
                                        className="input-field input-with-icon appearance-none"
                                        required
                                    >
                                        <option value="">Select a Food Hub</option>
                                        {hubs.map((hub) => (
                                            <option key={hub._id} value={hub._id}>{hub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Vendor Name (Owner Only) */}
                        {formData.role === 'vendor' && vendorData.vendorRole === 'owner' && (
                            <div>
                                <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Restaurant / Shop Name
                                </label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="vendorName"
                                        name="vendorName"
                                        value={vendorData.vendorName}
                                        onChange={handleVendorChange}
                                        placeholder="E.g. Burger King"
                                        className="input-field input-with-icon"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Vendor Selection (Staff Only) */}
                        {formData.role === 'vendor' && vendorData.vendorRole === 'staff' && (
                            <div>
                                <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Select Restaurant ({vendors.length > 0 ? vendors.length : 'No vendors'})
                                </label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        id="vendorId"
                                        name="vendorId"
                                        value={vendorData.vendorId}
                                        onChange={handleVendorChange}
                                        className="input-field input-with-icon appearance-none"
                                        required
                                        disabled={!vendorData.hubId}
                                    >
                                        <option value="">{vendorData.hubId ? 'Select Restaurant' : 'Select Hub First'}</option>
                                        {vendors.map((v) => (
                                            <option key={v._id} value={v._id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="input-field input-with-icon"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Phone Number <span className="text-gray-400">(Optional)</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone"
                                    className="input-field input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    className="input-field input-with-icon pr-12"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="input-field input-with-icon"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-green-500 hover:text-green-600 transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
