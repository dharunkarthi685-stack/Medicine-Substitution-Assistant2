import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Pill,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, estimatedTax, hasPrescriptionItems } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const totalAmount = (subtotal + estimatedTax + 30.00).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={ShoppingCart}
          title="Your Shopping Cart is Empty"
          description="Browse our verified medicines or use the Substitute Finder to discover affordable generic alternatives."
          actionText="Browse Medicines Catalog"
          onAction={() => navigate('/medicines')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Prescription & OTC Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review your pharmaceutical items, verify active dosages and proceed to delivery checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Cart Items</span>
        </button>
      </div>

      <MedicalDisclaimer compact />

      {/* Prescription Warning Banner */}
      {hasPrescriptionItems && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Prescription Notice:</span> One or more items in your cart require a valid prescription. Please ensure you have a physician's prescription ready for presentation or delivery verification.
          </div>
        </div>
      )}

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 shrink-0">
                  <Pill className="w-8 h-8 rotate-45 opacity-60" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {item.dosage_form} • {item.strength}
                    </span>
                    {item.prescription_required && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white">
                        Rx
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={`/medicines/${item.id}`}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-600 transition block"
                  >
                    {item.name}
                  </Link>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.composition} • {item.manufacturer}
                  </div>
                </div>
              </div>

              {/* Price & Quantity Adjuster */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400">₹{item.price} each</span>
                </div>

                {/* Remove Icon */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/medicines"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Adding Medicines</span>
            </Link>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6 sticky top-24">
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              {t('orderSummary')}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Standard Delivery</span>
                <span className="font-bold text-slate-900 dark:text-white">₹30.00</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('estimatedTax')}</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Estimated Total</span>
                <span className="text-xl text-emerald-600 dark:text-emerald-400">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{t('checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Secure SSL Encrypted Checkout</span>
              </div>
              <p>Razorpay UPI, Credit/Debit Cards, Net Banking & COD accepted</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
