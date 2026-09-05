import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, ArrowLeft, CheckCircle2, Pill, Printer } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function InvoiceView() {
  const { id } = useParams();
  const { success, error } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const blob = await orderService.downloadInvoicePDF(order.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success('PDF Invoice downloaded.');
    } catch (err) {
      error('Failed to download invoice PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <Link to="/my-orders" className="mt-4 inline-block text-emerald-600 font-bold">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Downloading...' : 'Download Official PDF Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Invoice Paper Canvas */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-8 print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-emerald-500">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                MedSubstitute Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              National Clinical Intelligence & Direct Generic Savings
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Official Tax Invoice
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              INV-#{order.order_number}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Date: {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Bill To & Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              Bill To & Ship To:
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{order.shipping_name}</div>
            <div className="text-slate-600 dark:text-slate-300">{order.shipping_phone}</div>
            <div className="text-slate-600 dark:text-slate-300">{order.shipping_address}</div>
            <div className="text-slate-600 dark:text-slate-300">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</div>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              Order Details:
            </span>
            <div className="text-slate-600 dark:text-slate-300">
              Fulfillment: <span className="font-bold text-slate-900 dark:text-white">{order.fulfillment_type === 'HOME_DELIVERY' ? 'Home Delivery' : 'In-Store Pickup'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Payment: <span className="font-bold text-slate-900 dark:text-white">{order.payment_method}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Payment Status: <span className="font-bold text-emerald-600">{order.payment_status}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Order Status: <span className="font-bold text-slate-900 dark:text-white">{order.order_status}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold border-b border-emerald-200 dark:border-emerald-800">
                <th className="p-3">#</th>
                <th className="p-3">Medicine Description</th>
                <th className="p-3">Dosage / Strength</th>
                <th className="p-3 text-right">Unit Price (₹)</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items?.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{item.medicine_name}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{item.dosage_form} ({item.strength})</td>
                  <td className="p-3 text-right font-medium">₹{item.unit_price}</td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">₹{item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{order.delivery_fee}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>GST (5%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{order.tax_amount}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black text-slate-900 dark:text-white">
              <span>Total Payable:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        <MedicalDisclaimer compact />

      </div>

    </div>
  );
}
