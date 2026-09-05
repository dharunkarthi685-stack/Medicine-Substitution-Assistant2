import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pill,
  TrendingDown,
  Building2,
  Percent,
  ShoppingCart,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { medicineService } from '../services/medicineService';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import SubstituteCompareModal from '../components/SubstituteCompareModal';
import EmptyState from '../components/EmptyState';

export default function SubstituteFinder() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedMedId = searchParams.get('med_id');

  const [allMedicines, setAllMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [substituteResult, setSubstituteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Compare Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareSub, setCompareSub] = useState(null);

  // Load all medicines for quick picker list
  useEffect(() => {
    const loadMeds = async () => {
      try {
        const data = await medicineService.getMedicines({ active_only: true });
        const list = data.results || data || [];
        setAllMedicines(list);

        // If med_id is provided in URL, load it
        if (selectedMedId) {
          const found = list.find((m) => String(m.id) === String(selectedMedId));
          if (found) {
            handleSelectMedicine(found);
          } else {
            // Fetch directly
            const direct = await medicineService.getMedicineById(selectedMedId);
            handleSelectMedicine(direct);
          }
        } else if (list.length > 0) {
          // Default to first prominent item (e.g. Augmentin or Dolo)
          const def = list.find((m) => m.name.includes('Augmentin') || m.name.includes('Dolo')) || list[0];
          handleSelectMedicine(def);
        }
      } catch (err) {
        console.error('Failed to load medicines:', err);
      }
    };
    loadMeds();
  }, [selectedMedId]);

  const handleSelectMedicine = async (med) => {
    setSelectedMedicine(med);
    setSearchParams({ med_id: med.id });
    setLoading(true);
    try {
      const res = await medicineService.getSubstitutes(med.id);
      setSubstituteResult(res);
    } catch (err) {
      console.error('Failed to load substitutes:', err);
      setSubstituteResult(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = searchQuery.trim()
    ? allMedicines.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.generic_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMedicines.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Bioequivalence & Price Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Generic Medicine Substitute Finder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Select any prescribed medicine to instantly discover chemically identical generic alternatives with verified savings.
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Main Grid: Left selector & Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Medicine Selector & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select Prescribed Medicine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose from inventory to analyze substitutes
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type medicine name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Scrollable list */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredMedicines.map((med) => {
                const isSelected = selectedMedicine?.id === med.id;
                return (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold truncate">{med.name}</div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {med.composition} • {med.strength}
                      </div>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      ₹{med.price}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Selected Medicine Card + Recommended Substitutes */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedMedicine && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Currently Selected Reference Medicine
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedMedicine.name}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Reference Price</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{selectedMedicine.price}
                  </span>
                </div>
              </div>

              {/* Chemical specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Active Ingredient</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedMedicine.composition}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Dosage Strength</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedMedicine.strength}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Bio-Delivery Form</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedMedicine.dosage_form}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Manufacturer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedMedicine.manufacturer}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Substitutes Section */}
          {loading ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
              <div className="text-xs text-slate-400 mt-3 font-medium">
                Analyzing chemical databases for bioequivalent substitutes...
              </div>
            </div>
          ) : substituteResult?.substitutes?.length > 0 ? (
            <div className="space-y-4">
              
              {/* Summary Stats Banner */}
              {substituteResult.max_savings_percentage > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-lg shadow-emerald-600/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/20">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-100 font-medium">
                        Found {substituteResult.substitutes_count} Equivalent Generic Alternatives
                      </div>
                      <div className="text-lg font-black">
                        Save up to {substituteResult.max_savings_percentage}% (₹{substituteResult.max_savings_amount} per strip)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Substitute list cards */}
              <div className="space-y-4">
                {substituteResult.substitutes.map((sub, idx) => {
                  const isTopSaving = idx === 0 && sub.price_difference > 0;
                  return (
                    <div
                      key={sub.id}
                      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-soft hover:shadow-card ${
                        isTopSaving
                          ? 'border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {isTopSaving && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                                Best Value Generic
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                              {sub.match_score || 95}% Equivalence Score
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {sub.name}
                          </h3>

                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Mfg:</span> {sub.manufacturer}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Composition:</span> {sub.composition} ({sub.strength} - {sub.dosage_form})
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{sub.match_reason}</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                              ₹{sub.price}
                            </div>
                            {sub.price_difference > 0 ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                                Save ₹{sub.price_difference} ({sub.savings_percentage}%)
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 block">Identical Price Range</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCompareSub(sub);
                                setCompareModalOpen(true);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>Compare</span>
                            </button>

                            <button
                              onClick={() => addToCart(sub, 1)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <EmptyState
              title="No generic substitutes recorded yet"
              description="This brand currently has no lower-cost generic alternatives with identical composition and dosage in the inventory."
            />
          )}

        </div>

      </div>

      {/* Compare Modal */}
      {compareModalOpen && (
        <SubstituteCompareModal
          original={selectedMedicine}
          substitute={compareSub}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

    </div>
  );
}
