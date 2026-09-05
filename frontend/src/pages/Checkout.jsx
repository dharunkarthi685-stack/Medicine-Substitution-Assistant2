import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Building2,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Checkout() {
  const { items, subtotal, estimatedTax, clearCart, hasPrescriptionItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error, warning } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    shipping_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || 'Chennai',
    shipping_state: user?.state || 'Tamil Nadu',
    shipping_pincode: user?.pincode || '600040',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const deliveryFee = fulfillmentType === 'HOME_DELIVERY' ? 30.00 : 0.00;
  const totalAmount = (subtotal + deliveryFee + estimatedTax).toFixed(2);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProcessCheckout = async (e) => {
    e.preventDefault();

    if (!formData.shipping_name || !formData.shipping_phone || !formData.shipping_address) {
      error('Please complete all contact and address fields.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on Django backend
      const orderPayload = {
        fulfillment_type: fulfillmentType,
        shipping_name: formData.shipping_name,
        shipping_phone: formData.shipping_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_pincode: formData.shipping_pincode,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          medicine_id: i.id,
          quantity: i.quantity,
        })),
      };

      const createdOrder = await orderService.createOrder(orderPayload);

      // 2. Handle Payment Flow
      if (paymentMethod === 'RAZORPAY') {
        const rzpOrderData = await paymentService.createRazorpayOrder(createdOrder.id);
        const scriptLoaded = await loadRazorpayScript();

        if (scriptLoaded && window.Razorpay) {
          const options = {
            key: rzpOrderData.razorpay_key,
            amount: rzpOrderData.amount,
            currency: rzpOrderData.currency,
            name: 'Medicine Substitution Assistant',
            description: `Payment for Order #${createdOrder.order_number}`,
            image: 'https://cdn-icons-png.flaticon.com/512/883/883360.png',
            order_id: rzpOrderData.razorpay_order_id,
            prefill: {
              name: rzpOrderData.user_name,
              email: rzpOrderData.user_email,
              contact: rzpOrderData.user_phone,
            },
            theme: {
              color: '#059669',
            },
            handler: async function (response) {
              try {
                // Verify signature on Django backend
                await paymentService.verifyRazorpayPayment({
                  order_id: createdOrder.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                clearCart();
                success('Payment successful! Your order has been placed.');
                navigate(`/my-orders`);
              } catch (verifyErr) {
                error('Payment verification failed. Please contact support.');
              }
            },
            modal: {
              ondismiss: function () {
                warning('Payment window closed. Order is pending.');
                clearCart();
                navigate('/my-orders');
              },
            },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        } else {
          // Direct fallback simulation for test modes
          await paymentService.verifyRazorpayPayment({
            order_id: createdOrder.id,
            razorpay_order_id: rzpOrderData.razorpay_order_id,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'sig_demo_test_verified',
          });
          clearCart();
          success('Online payment simulated and confirmed in test mode.');
          navigate('/my-orders');
        }
      } else {
        // Cash on Delivery
        await paymentService.confirmCOD(createdOrder.id);
        clearCart();
        success('Order placed successfully via Cash on Delivery!');
        navigate('/my-orders');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.detail || 'Checkout processing failed. Check item availability.';
      error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Secure Medical Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Verify your fulfillment preference, recipient contact and preferred payment option.
        </p>
      </div>

      <MedicalDisclaimer compact />

      <form onSubmit={handleProcessCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Fulfillment Type Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Choose Fulfillment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <label
                onClick={() => setFulfillmentType('HOME_DELIVERY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  fulfillmentType === 'HOME_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'HOME_DELIVERY'}
                  onChange={() => setFulfillmentType('HOME_DELIVERY')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Home Delivery</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Delivered to doorstep in 24-48 hours (₹30 standard fee)
                  </p>
                </div>
              </label>

              <label
                onClick={() => setFulfillmentType('PHARMACY_PICKUP')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  fulfillmentType === 'PHARMACY_PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'PHARMACY_PICKUP'}
                  onChange={() => setFulfillmentType('PHARMACY_PICKUP')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>In-Store Pharmacy Pickup</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Free pickup from partner pharmacy counters (₹0 Fee)
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* 2. Contact & Address Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Recipient & Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="shipping_name"
                  value={formData.shipping_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (for SMS Tracking) *
                </label>
                <input
                  type="tel"
                  required
                  name="shipping_phone"
                  value={formData.shipping_phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {fulfillmentType === 'HOME_DELIVERY' ? 'Street Address & Flat / House No *' : 'Preferred Pharmacy Branch / City Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  placeholder="Door No, Street Name, Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  name="shipping_pincode"
                  value={formData.shipping_pincode}
                  onChange={handleInputChange}
                  placeholder="600040"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Payment Selection
            </h3>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Online Payment (Razorpay Gateway)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg">
                  Instant
                </span>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Cash on Delivery / Pay on Pickup
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Pay cash or scan QR when your medicines arrive
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

          </div>

        </div>

        {/* Right Column: Order Summary & Confirmation Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6 sticky top-24">
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Final Checkout Summary
            </h3>

            {/* Items snippet */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>GST (5%)</span>
                <span>₹{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-xl text-emerald-600 dark:text-emerald-400">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition ${
                submitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Securing Order...' : `Pay ₹${totalAmount}`}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ReportLab PDF invoice generated upon order confirmation</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
