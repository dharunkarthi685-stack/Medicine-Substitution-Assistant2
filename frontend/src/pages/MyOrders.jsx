import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ShoppingBag
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function MyOrders() {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    setDownloadingId(orderId);
    try {
      const blob = await orderService.downloadInvoicePDF(orderId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success(`Invoice ${orderNumber} downloaded successfully.`);
    } catch (err) {
      console.error('Invoice download failed:', err);
      error('Failed to download invoice PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const getStatusIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Order Tracking & History</h1>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Prescription Orders & Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track real-time pharmacy confirmation, delivery progress, and access official tax invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Placed Yet"
          description="When you order medicines or generic substitutes, your active tracking timeline and tax invoices will appear here."
          actionText="Find Medicines"
          onAction={() => window.location.href = '/medicines'}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStatusIndex(order.order_status);
            const isCancelled = order.order_status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6"
              >
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Order Ref</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                        #{order.order_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.fulfillment_type === 'HOME_DELIVERY' ? 'Home Delivery' : 'In-Store Pickup'}</span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Amount</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                      disabled={downloadingId === order.id}
                      className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === order.id ? 'Generating...' : 'PDF Invoice'}</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Status Tracker */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="relative flex items-center justify-between">
                      {/* Tracker Line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-500"
                        style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}
                      />

                      {statusSteps.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold text-center whitespace-nowrap ${
                                isDone ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'
                              }`}
                            >
                              {step === 'PLACED' && 'Placed'}
                              {step === 'CONFIRMED' && 'Confirmed'}
                              {step === 'SHIPPED' && (order.fulfillment_type === 'HOME_DELIVERY' ? 'Out for Delivery' : 'Ready for Pickup')}
                              {step === 'DELIVERED' && (order.fulfillment_type === 'HOME_DELIVERY' ? 'Delivered' : 'Collected')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>This order was cancelled.</span>
                  </div>
                )}

                {/* Items Summary list */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ordered Medicines & Dosages
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white">{item.medicine_name}</span>
                          <span className="text-[11px] text-slate-400 block">{item.dosage_form} • {item.strength}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity} x ₹{item.unit_price}</span>
                          <span className="font-bold text-slate-900 dark:text-white block">₹{item.total_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
