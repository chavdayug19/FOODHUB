'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        todayRevenue: 0,
        todayOrders: 0,
        averageOrderValue: 0
    });
    const [recentSales, setRecentSales] = useState<any[]>([]);

    useEffect(() => {
        if (user?.vendorId) {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/orders'); // Assuming this fetches generic orders filtered by vendor info on backend
            // Note: The backend getOrders likely returns full Order objects. 
            // We need to extract the specific vendorOrder part for THIS vendorId.

            const orders = response.data.data || response.data;
            if (!Array.isArray(orders)) {
                setLoading(false);
                return;
            }

            let totalRev = 0;
            let totalOrd = 0;
            let todayRev = 0;
            let todayOrd = 0;
            const sales: any[] = [];

            const today = new Date().toISOString().split('T')[0];

            orders.forEach((order: any) => {
                // Find the sub-order for this vendor
                const mySubOrder = order.vendorOrders.find((vo: any) => vo.vendorId === user?.vendorId);

                if (mySubOrder) {
                    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                    const amount = mySubOrder.subtotal || 0;

                    totalRev += amount;
                    totalOrd += 1;

                    if (orderDate === today) {
                        todayRev += amount;
                        todayOrd += 1;
                    }

                    // Add to recent sales list (limit to 5 later)
                    if (sales.length < 10) {
                        sales.push({
                            id: order._id,
                            customer: order.customerName,
                            amount: amount,
                            status: mySubOrder.status,
                            date: new Date(order.createdAt) // Keep date obj for sorting if needed
                        });
                    }
                }
            });

            setStats({
                totalRevenue: totalRev,
                totalOrders: totalOrd,
                todayRevenue: todayRev,
                todayOrders: todayOrd,
                averageOrderValue: totalOrd > 0 ? totalRev / totalOrd : 0
            });
            setRecentSales(sales);

        } catch (error) {
            console.error(error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Crunching numbers..." />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                    Analytics Overview
                </h1>
                <p className="text-gray-500 text-sm mt-1">Track your business performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    trend="+12.5%"
                    trendUp={true}
                    color="green"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toString()}
                    icon={ShoppingBag}
                    trend="+5%"
                    trendUp={true}
                    color="blue"
                />
                <StatsCard
                    title="Today's Revenue"
                    value={`₹${stats.todayRevenue.toFixed(2)}`}
                    icon={TrendingUp}
                    trend="Live"
                    trendUp={null} // Neutral/Info
                    color="orange"
                />
                <StatsCard
                    title="Avg. Order Value"
                    value={`₹${stats.averageOrderValue.toFixed(2)}`}
                    icon={Users}
                    trend="-2%"
                    trendUp={false}
                    color="purple"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Placeholder (CSS Bars) */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Revenue Overview</h3>
                        <select className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm px-3 py-1">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {/* Fake Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {[65, 40, 75, 55, 80, 95, 60].map((h, i) => (
                            <div key={i} className="w-full bg-gray-100 dark:bg-gray-900 rounded-t-xl relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-orange-500/80 group-hover:bg-orange-500 transition-all rounded-t-xl"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                                        ₹{h * 100}
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sales List */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {recentSales.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No recent transactions</p>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold">
                                            {sale.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{sale.customer}</p>
                                            <p className="text-xs text-gray-500">{sale.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">+₹{sale.amount}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                sale.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    const colors: any = {
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="card p-6 hover:translate-y-[-2px] transition-transform">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trendUp !== null && (
                    <div className={`flex items-center text-xs font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
                {trendUp === null && (
                    <div className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">{trend}</div>
                )}
            </div>
            <div>
                <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
}
