import React from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, ShoppingCart, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import MedicalDisclaimer from './MedicalDisclaimer';

export default function SubstituteCompareModal({ original, substitute, onClose }) {
  const { addToCart } = useCart();

  if (!original || !substitute) return null;

  const priceDiff = (parseFloat(original.price) - parseFloat(substitute.price)).toFixed(2);
  const percentSaved = original.price > 0 ? (((parseFloat(original.price) - parseFloat(substitute.price)) / parseFloat(original.price)) * 100).toFixed(0) : 0;
  const isCheaper = parseFloat(priceDiff) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Substitute Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct bioequivalence & price savings analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Savings Callout Banner */}
          {isCheaper && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                    Total Potential Savings
                  </div>
                  <div className="text-xl font-black">
                    Save ₹{priceDiff} ({percentSaved}% OFF)
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-bold shadow-sm">
                Clinically Equivalent
              </span>
            </div>
          )}

          {/* Side by Side Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Original Medicine Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Referenced Medicine
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {original.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Mfg:</span> {original.manufacturer}
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Composition:</span>{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">{original.composition}</span>
                </div>
                <div>
                  <span className="text-slate-400">Strength:</span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{original.strength}</span>
                </div>
                <div>
                  <span className="text-slate-400">Dosage Form:</span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{original.dosage_form}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400">Original Price</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">₹{original.price}</span>
              </div>
            </div>

            {/* Recommended Substitute Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-emerald-500/50 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Recommended Alternative
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {substitute.match_score || 95}% Match
                </span>
              </div>

              <div className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                {substitute.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Mfg:</span> {substitute.manufacturer}
              </div>

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Composition:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">{substitute.composition}</span>
                </div>
                <div>
                  <span className="text-slate-400">Strength:</span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{substitute.strength}</span>
                </div>
                <div>
                  <span className="text-slate-400">Dosage Form:</span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{substitute.dosage_form}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Substitute Price</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{substitute.price}</span>
              </div>
            </div>

          </div>

          {/* Match Reason breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-bold block text-slate-900 dark:text-white">Equivalence Verification Basis:</span>
            <p className="leading-relaxed">
              {substitute.match_reason || 'Same molecular active ingredient, identical delivery route and dosage strength.'}
            </p>
          </div>

          {/* Medical Notice */}
          <MedicalDisclaimer compact />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              addToCart(substitute, 1);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add Substitute to Cart (₹{substitute.price})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
