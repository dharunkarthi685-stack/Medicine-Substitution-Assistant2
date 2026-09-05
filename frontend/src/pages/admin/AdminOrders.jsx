import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export default function AdminOrders() {
  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ status: statusFilter, search });
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 250);
    return () => clearTimeout(timeout);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      success(`Order status updated to ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      error('Failed to update order status.');
    }
  };

  const handleUpdatePayment = async (orderId, newPaymentStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { payment_status: newPaymentStatus });
      success(`Payment status marked as ${newPaymentStatus}.`);
      fetchOrders();
    } catch (err) {
      error('Failed to update payment status.');
    }
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
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
      success(`Invoice for #${orderNumber} downloaded.`);
    } catch (err) {
      error('Failed to download invoice PDF.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Pharmacy Orders & Fulfillment
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Process customer orders, update tracking statuses, manage payment captures and print tax invoices.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ref, customer, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Order Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4"
            >
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      #{order.order_number}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">{order.shipping_name}</span> ({order.shipping_phone}) - {order.shipping_city}, {order.shipping_state}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{order.total_amount}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    title="Download ReportLab PDF Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items in Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <span>{item.quantity}x {item.medicine_name} ({item.strength})</span>
                    <span className="font-bold">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Status Update Dropdowns */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Order Status:</span>
                  <select
                    value={order.order_status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold focus:outline-none"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Payment Status:</span>
                  <select
                    value={order.payment_status}
                    onChange={(e) => handleUpdatePayment(order.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-400">
          No orders found matching the filter.
        </div>
      )}

    </div>
  );
}
