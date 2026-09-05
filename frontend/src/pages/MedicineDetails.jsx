import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Percent,
  TrendingDown
} from 'lucide-react';
import { medicineService } from '../services/medicineService';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import SubstituteCompareModal from '../components/SubstituteCompareModal';

export default function MedicineDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [substitutesData, setSubstitutesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [modalSubstitute, setModalSubstitute] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [med, subs] = await Promise.all([
          medicineService.getMedicineById(id),
          medicineService.getSubstitutes(id),
        ]);
        setMedicine(med);
        setSubstitutesData(subs);
      } catch (err) {
        console.error('Failed to load medicine details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Medicine Not Found</h2>
        <Link to="/medicines" className="mt-4 inline-block text-emerald-600 font-bold">
          ← Back to Medicines
        </Link>
      </div>
    );
  }

  const isExpired = medicine.is_expired;
  const isOutOfStock = medicine.stock_quantity <= 0;
  const isPurchasable = !isExpired && !isOutOfStock && medicine.is_active;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Medicine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Image & Quick Badges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative h-72 sm:h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-soft">
            {medicine.image_url ? (
              <img
                src={medicine.image_url}
                alt={medicine.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Pill className="w-24 h-24 text-emerald-500/30 rotate-45" />
            )}
            
            <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
              {medicine.disease_category}
            </span>

            {medicine.prescription_required ? (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-sm flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Rx Required
              </span>
            ) : (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-500 text-white shadow-sm">
                Over The Counter (OTC)
              </span>
            )}
          </div>
        </div>

        {/* Right: Clinical Details & Purchase Card */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              {medicine.dosage_form} • {medicine.strength}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {medicine.name}
            </h1>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Generic Active Salt:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{medicine.generic_name}</span>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-medium">Price per unit / strip</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹{medicine.price}
              </div>
              <span className="text-xs text-slate-400">Inclusive of all taxes</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              {isPurchasable && (
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(medicine.stock_quantity, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                disabled={!isPurchasable}
                onClick={() => addToCart(medicine, quantity)}
                className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition ${
                  isPurchasable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isPurchasable ? t('addToCart') : 'Unavailable'}</span>
              </button>
            </div>
          </div>

          {/* Clinical Specifications Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pharmaceutical Specifications
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 block">Composition</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{medicine.composition}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 block">Manufacturer</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{medicine.manufacturer}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 block">Current Stock</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  {medicine.stock_quantity} Units Available
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 block">Expiry Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{medicine.expiry_date}</span>
              </div>
            </div>

            {medicine.description && (
              <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold block text-slate-800 dark:text-slate-200 mb-1">Therapeutic Summary:</span>
                {medicine.description}
              </div>
            )}
          </div>

        </div>

      </div>

      <MedicalDisclaimer />

      {/* Available Generic Substitutes Section */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Generic Bioequivalence
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Verified Lower-Cost Substitutes for {medicine.name}
            </h2>
          </div>
          <Link
            to={`/substitutes?med_id=${medicine.id}`}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Open in Full Substitute Finder →
          </Link>
        </div>

        {substitutesData?.substitutes?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {substitutesData.substitutes.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-between space-y-4 hover:border-emerald-500 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {sub.match_score || 95}% Match
                    </span>
                    {sub.price_difference > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                        Save {sub.savings_percentage}%
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {sub.name}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sub.manufacturer}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {sub.strength} • {sub.dosage_form}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₹{sub.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setModalSubstitute(sub);
                        setCompareModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    >
                      Compare
                    </button>
                    <button
                      onClick={() => addToCart(sub, 1)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      title="Add substitute to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No direct bioequivalent generic alternatives currently found in the inventory.
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {compareModalOpen && (
        <SubstituteCompareModal
          original={medicine}
          substitute={modalSubstitute}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

    </div>
  );
}
