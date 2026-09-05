import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Layers,
  Truck,
  Building2,
  CreditCard,
  Pill,
  TrendingDown
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export default function AdminAnalytics() {
  const [deepData, setDeepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeep = async () => {
      try {
        const res = await analyticsService.getAdminDeepAnalytics();
        setDeepData(res);
      } catch (err) {
        console.error('Failed to load deep analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeep();
  }, []);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  const lowStock = deepData?.low_stock_medicines || [];
  const expiring = deepData?.expiring_medicines || [];
  const fulfillment = deepData?.fulfillment_breakdown || [];
  const payments = deepData?.payment_breakdown || [];

  return (
    <div className="space-y-8">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Inventory Risk & Operations Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Critical alert monitor for stock exhaustion, upcoming expiry dates and fulfillment channel splits.
        </p>
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
