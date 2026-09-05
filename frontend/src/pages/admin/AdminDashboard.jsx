import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { orderService } from '../../services/orderService';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export default function AdminDashboard() {
  const [platformData, setPlatformData] = useState(null);
  const [deepData, setDeepData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [plat, deep, orders] = await Promise.all([
          analyticsService.getPlatformAnalytics(),
          analyticsService.getAdminDeepAnalytics(),
          orderService.getOrders(),
        ]);
        setPlatformData(plat);
        setDeepData(deep);
        setRecentOrders(orders.slice?.(0, 5) || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  const kpis = platformData?.kpis || {};
  const stockHealth = platformData?.stock_health || {};

  return (
    <div className="space-y-8">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Total Catalog Items</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_medicines || 0}
          </div>
          <Link to="/admin/medicines" className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1">
            <span>Manage Catalog</span> →
          </Link>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Total Orders</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_orders || 0}
          </div>
          <Link to="/admin/orders" className="text-[11px] font-bold text-sky-600 hover:underline inline-flex items-center gap-1">
            <span>Process Orders</span> →
          </Link>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Settled Revenue</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{kpis.total_revenue?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-slate-400">Via Razorpay & COD</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Registered Users</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_users || 0}
          </div>
          <Link to="/admin/users" className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
            <span>User Accounts</span> →
          </Link>
        </div>

      </div>

      {/* Stock & Expiry Health Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Inventory Health & Expiry Watch
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stockHealth.in_stock || 0}
            </div>
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-1">Healthy Stock</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stockHealth.low_stock || 0}
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-1">Low Stock (≤10)</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stockHealth.out_of_stock || 0}
            </div>
            <div className="text-xs text-rose-800 dark:text-rose-300 font-semibold mt-1">Out of Stock</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {stockHealth.expiring_soon || 0}
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-300 font-semibold mt-1">Expiring (60 days)</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/csv-import"
          className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center justify-between hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold">Bulk CSV Medicine Import</div>
              <div className="text-xs text-emerald-100">Upload or paste medicine records in bulk</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          to="/admin/medicines"
          className="p-5 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md flex items-center justify-between hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20">
              <Pill className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="text-sm font-bold">Add / Edit Medicines</div>
              <div className="text-xs text-sky-100">Manage pricing, stocks and active formulas</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recent Orders Activity
          </h3>
          <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                <th className="py-2">Order Ref</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Fulfillment</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">#{order.order_number}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{order.shipping_name}</td>
                  <td className="py-3 font-bold text-emerald-600">₹{order.total_amount}</td>
                  <td className="py-3 text-slate-500">{order.fulfillment_type === 'HOME_DELIVERY' ? 'Home Delivery' : 'Pickup'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-600 dark:text-slate-300">{order.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
