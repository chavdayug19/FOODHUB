"use client";
import { useState } from 'react';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UtensilsCrossed, Mail, Lock, User, Store, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor',
    vendorId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // If role is admin, we might not send vendorId, or send it as undefined
      const payload = {
        ...formData,
        vendorId: formData.role === 'vendor' ? formData.vendorId : undefined
      };
      
      await api.post('/auth/register', payload);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join as a Vendor or Administrator</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm border border-red-100 dark:border-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    
                    {formData.role === 'vendor' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Store className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="vendorId"
                                    type="text"
                                    value={formData.vendorId}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="ID"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        'Register'
                    )}
                </button>
            </form>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account? <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}