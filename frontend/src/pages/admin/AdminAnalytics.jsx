import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  AlertTriangle,
  Calendar,
  Layers,
  Truck,
  Building2,
  CreditCard,
  Pill,
  TrendingUp,
  Percent,
  Search,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#64748b'];

export default function AdminAnalytics() {
  const [platformData, setPlatformData] = useState(null);
  const [deepData, setDeepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAdminAnalytics = async () => {
      try {
        const [plat, deep] = await Promise.all([
          analyticsService.getPlatformAnalytics(),
          analyticsService.getAdminDeepAnalytics()
        ]);
        setPlatformData(plat);
        setDeepData(deep);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAdminAnalytics();
  }, []);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  const kpis = platformData?.kpis || {};
  const mostSearched = platformData?.most_searched || [];
  const categoryDist = platformData?.category_distribution || [];
  const orderTrends = platformData?.order_trend || [];

  const lowStock = deepData?.low_stock_medicines || [];
  const expiring = deepData?.expiring_medicines || [];
  const fulfillment = deepData?.fulfillment_breakdown || [];
  const payments = deepData?.payment_breakdown || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Admin Telemetry & Operations</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Medicine Demand, Operations & Inventory Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Comprehensive administrator monitor for top searched medicines, 7-day revenue, inventory risk, expiry watch and fulfillment splits.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Catalog Medicines</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_medicines || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Active formulary items</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_orders || 0}
          </div>
          <span className="text-[11px] text-sky-600 font-medium">All-time fulfillments</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Settled Revenue</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{kpis.total_revenue?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-teal-600 font-medium">Settled transactions</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Delivered Savings</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{kpis.estimated_savings_delivered?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Saved by patients</span>
        </div>

      </div>

      {/* Chart Section 1: Most Searched & Therapeutic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Most Searched Medicines (BarChart) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Most Searched Medicines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medicines generating highest search query & substitution volume
              </p>
            </div>
            <Search className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostSearched}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} searches`, 'Search Volume']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="search_count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (PieChart) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Therapeutic Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medicines split across clinical therapeutic disease classes
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDist}
                  dataKey="count"
                  nameKey="disease_category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart Section 2: Order Activity & Revenue Trends */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              7-Day Order Volume & Revenue Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily orders and settled revenue trends
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrends}>
              <defs>
                <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [name === 'revenue' ? `₹${value}` : `${value} orders`, name === 'revenue' ? 'Revenue' : 'Orders']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorAdminRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fulfillment & Payment Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Fulfillment Channel Distribution</span>
          </div>
          <div className="space-y-2">
            {fulfillment.map((item) => (
              <div key={item.fulfillment_type} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.fulfillment_type === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'In-Store Pharmacy Pickup'}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {item.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span>Payment Gateway vs COD Distribution</span>
          </div>
          <div className="space-y-2">
            {payments.map((item) => (
              <div key={item.payment_method} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.payment_method === 'RAZORPAY' ? 'Online Gateway (Razorpay)' : 'Cash on Delivery (COD)'}
                </span>
                <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
                  {item.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Tables: Low Stock & Expiring Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Warning (≤ 20 Units)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-2">Medicine</th>
                  <th className="py-2">Manufacturer</th>
                  <th className="py-2 text-right">Units Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStock.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-bold text-slate-900 dark:text-white">
                      {m.name} ({m.strength})
                    </td>
                    <td className="py-2 text-slate-500">{m.manufacturer}</td>
                    <td className="py-2 text-right font-black text-rose-600">{m.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Soon Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <span>Upcoming Expiry Watch (&lt; 60 Days)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-2">Medicine</th>
                  <th className="py-2">Manufacturer</th>
                  <th className="py-2 text-right">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expiring.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-bold text-slate-900 dark:text-white">{m.name}</td>
                    <td className="py-2 text-slate-500">{m.manufacturer}</td>
                    <td className="py-2 text-right font-bold text-amber-600">{m.expiry_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
