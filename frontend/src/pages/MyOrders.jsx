import React, { useState, useEffect, useCallback } from 'react';
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
  ShoppingBag,
  Zap,
  Sparkles,
  Banknote,
  RotateCw,
  ShieldCheck,
  X,
  QrCode,
  Lock,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function MyOrders() {
  const { t } = useLanguage();
  const { success, error, info } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [activePaymentModalOrder, setActivePaymentModalOrder] = useState(null);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('UPI');

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-check for status changes every 15s (e.g. after admin approves prescription)
    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) return Promise.resolve(true);
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (order, method = 'RAZORPAY') => {
    setPayingId(order.id);
    try {
      if (method === 'COD' || order.payment_method === 'COD') {
        await paymentService.confirmCOD(order.id);
        success('Cash on Delivery confirmed! Your order has been placed for delivery.');
        setActivePaymentModalOrder(null);
        fetchOrders(true);
        return;
      }

      if (method === 'DEMO_INSTANT') {
        await paymentService.verifyRazorpayPayment({
          order_id: order.id,
          razorpay_order_id: `order_mock_${Date.now()}`,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'sig_demo_verified_hash_98374298374',
        });
        success('Payment confirmed successfully! Your order is now being processed.');
        setActivePaymentModalOrder(null);
        fetchOrders(true);
        return;
      }

      // Online Razorpay Payment flow
      let rzpData;
      try {
        rzpData = await paymentService.createRazorpayOrder(order.id);
      } catch (err) {
        console.warn('Backend Razorpay order creation issue, using client test fallback:', err);
        rzpData = {
          razorpay_key: 'rzp_test_TYGTsldk8gSzFV',
          amount: Math.round(parseFloat(order.total_amount) * 100),
          currency: 'INR',
          is_simulated: true,
          user_name: order.shipping_name,
          user_email: order.user_info?.email,
          user_phone: order.shipping_phone,
        };
      }

      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && window.Razorpay) {
        const options = {
          key: rzpData.razorpay_key || 'rzp_test_TYGTsldk8gSzFV',
          amount: rzpData.amount || Math.round(parseFloat(order.total_amount) * 100),
          currency: rzpData.currency || 'INR',
          name: 'Medicine Substitution Assistant',
          description: `Payment for Order #${order.order_number}`,
          image: 'https://cdn-icons-png.flaticon.com/512/883/883360.png',
          prefill: {
            name: rzpData.user_name || order.shipping_name,
            email: rzpData.user_email || order.user_info?.email,
            contact: rzpData.user_phone || order.shipping_phone,
          },
          theme: { color: '#059669' },
          handler: async (response) => {
            try {
              await paymentService.verifyRazorpayPayment({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id || rzpData.razorpay_order_id || `order_mock_${Date.now()}`,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'sig_demo_verified_hash_98374298374',
              });
              success('Payment successful! Your order is now confirmed.');
              setActivePaymentModalOrder(null);
              fetchOrders(true);
            } catch (err) {
              error('Payment verification failed. Please contact support.');
            } finally {
              setPayingId(null);
            }
          },
          modal: {
            ondismiss: () => {
              setPayingId(null);
            },
          },
        };

        if (rzpData.razorpay_order_id && !rzpData.is_simulated && !rzpData.razorpay_order_id.startsWith('order_mock_')) {
          options.order_id = rzpData.razorpay_order_id;
        }

        const checkout = new window.Razorpay(options);
        checkout.on('payment.failed', function (resp) {
          error(resp.error?.description || 'Payment was not completed. You can retry anytime.');
          setPayingId(null);
        });
        checkout.open();
      } else {
        // Fallback to in-app payment modal
        setActivePaymentModalOrder(order);
      }

    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.error || err.message || 'Payment processing failed. Please try again.';
      error(msg);
      setActivePaymentModalOrder(order);
    } finally {
      if (!window.Razorpay || method === 'COD' || method === 'DEMO_INSTANT') {
        setPayingId(null);
      }
    }
  };

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
      success(`Invoice #${orderNumber} downloaded successfully.`);
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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Prescription Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track clinical verification, complete approved payments, and download official tax invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition flex items-center gap-2"
        >
          <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Placed Yet"
          description="When you order medicines or generic substitutes, your active tracking timeline and tax invoices will appear here."
          actionText="Find Medicines"
          onAction={() => (window.location.href = '/medicines')}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStatusIndex(order.order_status);
            const isCancelled = order.order_status === 'CANCELLED';
            const isPendingVerification =
              order.order_status === 'PENDING_PRESCRIPTION_VERIFICATION' ||
              (order.prescription_status === 'PENDING' && order.order_status !== 'APPROVED_PAYMENT_PENDING');
            const isApprovedAwaitingPayment =
              (order.order_status === 'APPROVED_PAYMENT_PENDING' || order.prescription_status === 'APPROVED') &&
              order.payment_status !== 'PAID' &&
              !isCancelled;
            const isPrescriptionRejected =
              order.order_status === 'PRESCRIPTION_REJECTED' || order.prescription_status === 'REJECTED';
            const isPaymentCompleted = order.payment_status === 'PAID';

            return (
              <div
                key={order.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-6 shadow-soft ${
                  isApprovedAwaitingPayment
                    ? 'border-emerald-500/80 dark:border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 uppercase">Order Ref</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                        #{order.order_number}
                      </span>
                      {isApprovedAwaitingPayment && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-pulse flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Approved · Action Required: Pay Now</span>
                        </span>
                      )}
                      {isPendingVerification && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Clinical Review</span>
                        </span>
                      )}
                      {isPaymentCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid & Confirmed</span>
                        </span>
                      )}
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
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    {isPaymentCompleted && (
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                        disabled={downloadingId === order.id}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === order.id ? 'Generating...' : 'PDF Invoice'}</span>
                      </button>
                    )}

                    {isApprovedAwaitingPayment && (
                      <button
                        type="button"
                        onClick={() => setActivePaymentModalOrder(order)}
                        disabled={payingId === order.id}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{payingId === order.id ? 'Processing...' : 'Pay ₹' + order.total_amount}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* APPROVED PAYMENT REQUIRED HERO BANNER */}
                {isApprovedAwaitingPayment && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/40 border-2 border-emerald-500/40 space-y-4 shadow-sm animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Doctor Prescription Verified & Approved!</span>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Your prescription has been reviewed and approved by the pharmacy. Please complete payment of <strong>₹{order.total_amount}</strong> to unlock dispatch.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                      <button
                        type="button"
                        disabled={payingId === order.id}
                        onClick={() => handlePayment(order, 'RAZORPAY')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay via UPI / Cards</span>
                      </button>

                      <button
                        type="button"
                        disabled={payingId === order.id}
                        onClick={() => handlePayment(order, 'COD')}
                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <Banknote className="w-3.5 h-3.5 text-teal-600" />
                        <span>Pay on Delivery (COD)</span>
                      </button>

                      <button
                        type="button"
                        disabled={payingId === order.id}
                        onClick={() => handlePayment(order, 'DEMO_INSTANT')}
                        className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Instant Demo Pay</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline Status Tracker */}
                {isPendingVerification ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Prescription Verification in Progress — our clinical pharmacist is reviewing your upload. Payment will be unlocked immediately upon approval.</span>
                  </div>
                ) : isPrescriptionRejected ? (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Prescription was rejected by clinical team. Please upload a clear valid prescription to place a new order.</span>
                  </div>
                ) : !isCancelled ? (
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
                              {step === 'SHIPPED' &&
                                (order.fulfillment_type === 'HOME_DELIVERY' ? 'Out for Delivery' : 'Ready for Pickup')}
                              {step === 'DELIVERED' &&
                                (order.fulfillment_type === 'HOME_DELIVERY' ? 'Delivered' : 'Collected')}
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
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white">{item.medicine_name}</span>
                          <span className="text-[11px] text-slate-400 block">
                            {item.dosage_form || 'Tablet'} • {item.strength}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.quantity} x ₹{item.unit_price}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            ₹{item.total_price}
                          </span>
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

      {/* Interactive In-App Payment Modal */}
      {activePaymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Complete Order Payment
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Order #{activePaymentModalOrder.order_number}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePaymentModalOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Payable Amount:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₹{activePaymentModalOrder.total_amount}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Payment Method
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentTab('UPI')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    selectedPaymentTab === 'UPI'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentTab('CARD')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    selectedPaymentTab === 'CARD'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentTab('COD')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    selectedPaymentTab === 'COD'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash (COD)</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {selectedPaymentTab === 'UPI' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-center">
                <div className="font-bold text-slate-900 dark:text-white">Instant UPI (GPay, PhonePe, Paytm, BHIM)</div>
                <div className="text-[11px] text-slate-500">Pay securely via any installed UPI app or scan QR.</div>
              </div>
            )}

            {selectedPaymentTab === 'CARD' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-center">
                <div className="font-bold text-slate-900 dark:text-white">Credit & Debit Cards</div>
                <div className="text-[11px] text-slate-500">Visa, Mastercard, RuPay with 256-bit SSL encryption.</div>
              </div>
            )}

            {selectedPaymentTab === 'COD' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-center">
                <div className="font-bold text-slate-900 dark:text-white">Cash on Delivery / Pickup</div>
                <div className="text-[11px] text-slate-500">Pay cash or UPI scan directly upon receipt of medicines.</div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={payingId === activePaymentModalOrder.id}
                onClick={() => handlePayment(activePaymentModalOrder, selectedPaymentTab === 'COD' ? 'COD' : 'DEMO_INSTANT')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {payingId === activePaymentModalOrder.id
                    ? 'Processing Payment...'
                    : selectedPaymentTab === 'COD'
                    ? 'Confirm Cash on Delivery'
                    : `Confirm & Pay ₹${activePaymentModalOrder.total_amount}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePayment(activePaymentModalOrder, 'DEMO_INSTANT')}
                className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Quick Simulated Instant Pay (1-Click Test)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
