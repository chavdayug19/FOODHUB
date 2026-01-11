"use client";
import { useState } from 'react';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UtensilsCrossed, Mail, Lock, ArrowLeft, Loader2, ChefHat } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (res.data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left Side - Brand/Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-700 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-3 text-2xl font-bold">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <span>FoodHub</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">Manage your kitchen with confidence.</h2>
          <p className="text-orange-100 text-lg leading-relaxed">
            Streamline orders, track inventory, and delight your customers with the most advanced food court management system.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-orange-100/80">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-orange-400 border-2 border-orange-600"></div>
            ))}
          </div>
          <p>Trusted by 500+ vendors</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-800 flex items-center animate-in fade-in slide-in-from-top-2">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-600">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-600">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/20 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <span className="font-medium text-orange-600 hover:text-orange-500 cursor-pointer">
              Contact Administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
