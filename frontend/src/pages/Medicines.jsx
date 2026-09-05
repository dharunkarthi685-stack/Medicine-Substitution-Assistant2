import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Pill,
  Sparkles,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { medicineService } from '../services/medicineService';
import MedicineCard from '../components/MedicineCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import SubstituteCompareModal from '../components/SubstituteCompareModal';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Medicines() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters from URL query params or local state
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedForm = searchParams.get('dosage_form') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const prescription = searchParams.get('prescription') || '';
  const ordering = searchParams.get('ordering') || 'name';

  // Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [modalOriginal, setModalOriginal] = useState(null);
  const [modalSubstitute, setModalSubstitute] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [cats, forms] = await Promise.all([
          medicineService.getCategories(),
          medicineService.getDosageForms(),
        ]);
        setCategories(cats || []);
        setDosageForms(forms || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const params = {
          search,
          category: selectedCategory,
          dosage_form: selectedForm,
          in_stock: inStockOnly,
          prescription,
          ordering,
        };
        const data = await medicineService.getMedicines(params);
        setMedicines(data.results || data || []);
      } catch (err) {
        console.error('Failed to fetch medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchMedicines, 200);
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, selectedForm, inStockOnly, prescription, ordering]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleOpenCompare = async (medicine) => {
    try {
      const subData = await medicineService.getSubstitutes(medicine.id);
      if (subData.substitutes && subData.substitutes.length > 0) {
        setModalOriginal(subData.target_medicine);
        setModalSubstitute(subData.substitutes[0]);
        setCompareModalOpen(true);
      } else {
        window.location.href = `/substitutes?med_id=${medicine.id}`;
      }
    } catch {
      window.location.href = `/substitutes?med_id=${medicine.id}`;
    }
  };

  const hasActiveFilters = search || selectedCategory || selectedForm || inStockOnly || prescription || ordering !== 'name';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Medicine Inventory & Generic Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse verified medicines, inspect chemical composition, and discover bioequivalent alternatives.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      <MedicalDisclaimer compact />

      {/* Search & Filter Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search medicine name, active salt, generic composition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dosage Form Dropdown */}
          <div className="relative md:col-span-3">
            <select
              value={selectedForm}
              onChange={(e) => updateParam('dosage_form', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Dosage Forms</option>
              {dosageForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative md:col-span-3">
            <select
              value={ordering}
              onChange={(e) => updateParam('ordering', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-search_count">Most Searched</option>
            </select>
          </div>

        </div>

        {/* Category Pills & Quick Filter Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-3xl">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                !selectedCategory
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({categories.reduce((acc, c) => acc + c.count, 0)})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.disease_category}
                onClick={() => updateParam('category', cat.disease_category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.disease_category
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat.disease_category} ({cat.count})
              </button>
            ))}
          </div>

          {/* In Stock & Rx Toggles */}
          <div className="flex items-center gap-3 shrink-0 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded-md"
              />
              <span className="text-slate-700 dark:text-slate-300">In Stock Only</span>
            </label>
          </div>

        </div>

      </div>

      {/* Medicines Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : medicines.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing {medicines.length} verified medicines
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onCompare={handleOpenCompare}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No medicines match your search criteria"
          description="Try broadening your keywords or clearing selected filters."
          actionText="Reset All Filters"
          onAction={clearAllFilters}
        />
      )}

      {/* Side-by-side comparison modal */}
      {compareModalOpen && (
        <SubstituteCompareModal
          original={modalOriginal}
          substitute={modalSubstitute}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

    </div>
  );
}
