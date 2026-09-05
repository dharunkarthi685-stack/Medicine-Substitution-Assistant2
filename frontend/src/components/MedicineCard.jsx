import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  Sparkles,
  ShoppingCart,
  ShieldAlert,
  Calendar,
  Building2,
  CheckCircle2,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function MedicineCard({ medicine, onCompare }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const isExpired = medicine.is_expired;
  const isOutOfStock = medicine.stock_quantity <= 0;
  const isAvailable = !isExpired && !isOutOfStock && medicine.is_active;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      
      {/* Top Banner / Image area */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center">
        {medicine.image_url ? (
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback Icon placeholder */}
        <div
          style={{ display: medicine.image_url ? 'none' : 'flex' }}
          className="w-full h-full items-center justify-center bg-gradient-to-tr from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-800/40 text-emerald-600 dark:text-emerald-400"
        >
          <Pill className="w-16 h-16 opacity-30 rotate-45" />
        </div>

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          {medicine.disease_category}
        </span>

        {/* Prescription Badge */}
        {medicine.prescription_required ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500 text-white shadow-sm flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Rx Required
          </span>
        ) : (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/90 text-white shadow-sm">
            OTC
          </span>
        )}

        {/* Status Overlay if Expired or Out of Stock */}
        {isExpired && (
          <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm flex items-center justify-center p-3 text-center">
            <div className="flex flex-col items-center gap-1 text-rose-200">
              <AlertOctagon className="w-8 h-8 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Expired Product</span>
              <span className="text-[10px] opacity-80">Not for sale</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Strength & Dosage form */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>{medicine.dosage_form}</span>
            <span>•</span>
            <span>{medicine.strength}</span>
          </div>

          {/* Medicine Name */}
          <Link
            to={`/medicines/${medicine.id}`}
            className="block font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug"
          >
            {medicine.name}
          </Link>

          {/* Generic Molecule Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-400 dark:text-slate-500">Molecule: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {medicine.composition || medicine.generic_name}
            </span>
          </div>

          {/* Manufacturer */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate">{medicine.manufacturer}</span>
          </div>
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Price</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{medicine.price}
            </span>
          </div>

          <div className="text-right">
            {isExpired ? (
              <span className="text-xs font-bold text-rose-500">Expired</span>
            ) : isOutOfStock ? (
              <span className="text-xs font-bold text-amber-500">Out of stock</span>
            ) : (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock ({medicine.stock_quantity})</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Find Substitutes Button */}
          <button
            onClick={() => {
              if (onCompare) {
                onCompare(medicine);
              } else {
                navigate(`/substitutes?med_id=${medicine.id}`);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition"
            title="Find lower-cost generic alternatives"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Substitutes</span>
          </button>

          {/* Add to Cart Button */}
          <button
            disabled={!isAvailable}
            onClick={() => addToCart(medicine, 1)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
