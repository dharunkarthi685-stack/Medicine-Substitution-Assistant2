import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Pill,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  HeartHandshake,
  Percent,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { medicineService } from '../services/medicineService';
import MedicineCard from '../components/MedicineCard';
import SubstituteCompareModal from '../components/SubstituteCompareModal';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [modalOriginal, setModalOriginal] = useState(null);
  const [modalSubstitute, setModalSubstitute] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [medsRes, catsRes] = await Promise.all([
          medicineService.getMedicines({ ordering: '-search_count' }),
          medicineService.getCategories(),
        ]);
        setFeaturedMedicines(medsRes.results || medsRes.slice?.(0, 8) || []);
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Failed to load home page medicines:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenCompare = async (medicine) => {
    try {
      const subData = await medicineService.getSubstitutes(medicine.id);
      if (subData.substitutes && subData.substitutes.length > 0) {
        setModalOriginal(subData.target_medicine);
        setModalSubstitute(subData.substitutes[0]);
        setCompareModalOpen(true);
      } else {
        navigate(`/substitutes?med_id=${medicine.id}`);
      }
    } catch {
      navigate(`/substitutes?med_id=${medicine.id}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 gradient-hero border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Generic Bioequivalence Matcher</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Find Clinically Equivalent Medicines &{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent">
                Save Up To 70%
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Verify active pharmaceutical ingredients, exact dosage strengths, and bio-delivery forms. Switch to trusted generic alternatives with total transparency.
            </p>

            {/* Hero Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-2xl mx-auto flex items-center p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 focus-within:border-emerald-500 transition-all duration-300"
            >
              <Search className="w-6 h-6 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-3 py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 sm:px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                {t('findSubstitutes')}
              </button>
            </form>

            {/* Quick suggested searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Popular Searches:</span>
              {['Dolo 650', 'Augmentin 625', 'Telma 40', 'Pan 40', 'Montair-LC', 'Glycomet 500'].map((med) => (
                <button
                  key={med}
                  onClick={() => navigate(`/medicines?search=${encodeURIComponent(med)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  {med}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Metrics & Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
              <Percent className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              65% - 75%
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Average Patient Savings
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              100% Exact
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Active Molecule Matches
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Top Pharma
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              WHO-GMP Certified Brands
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Multi-Language
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              6 Indian Regional Languages
            </div>
          </div>

        </div>
      </section>

      {/* 3. Medical Safety Disclaimer Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicalDisclaimer />
      </section>

      {/* 4. Featured Substitution Showcase: Top Comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Bioequivalent Case Studies
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Real Brand vs Generic Price Comparisons
            </h2>
          </div>
          <Link
            to="/substitutes"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
          >
            <span>Open Interactive Substitution Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Comparison Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Example 1: Antibiotic */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-bold">
                Antibiotics & ENT
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold">
                Save 42%
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Augmentin 625 Duo</div>
                  <div className="text-slate-400">GSK India</div>
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 line-through">₹225.00</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">Moxikind-CV 625</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Mankind Pharma</div>
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">₹130.00</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Exact Amoxicillin (500mg) + Clavulanic Acid (125mg)</span>
            </div>
          </div>

          {/* Example 2: Hypertension */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-bold">
                Hypertension & Heart
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold">
                Save 56%
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Telma 40</div>
                  <div className="text-slate-400">Glenmark Pharma</div>
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 line-through">₹148.00</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">Telmikind 40</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Mankind Pharma</div>
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">₹65.00</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Exact Telmisartan 40mg pure active molecule</span>
            </div>
          </div>

          {/* Example 3: Fever & Pain */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
                Fever & Analgesic
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold">
                Save 55%
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Dolo 650</div>
                  <div className="text-slate-400">Micro Labs Ltd</div>
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400 line-through">₹31.00</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">Parafast 650</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Cipla Ltd</div>
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">₹14.00</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Exact Paracetamol 650mg bioequivalent formula</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Therapeutic Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Therapeutic Areas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Browse by Health Category
            </h2>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.disease_category}
              onClick={() => navigate(`/medicines?category=${encodeURIComponent(cat.disease_category)}`)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-emerald-500 hover:shadow-card transition group"
            >
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                {cat.disease_category}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {cat.count} Medicines Available
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Popular Verified Medicines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Verified Stock
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Most Searched Medicines
            </h2>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Browse Full Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onCompare={handleOpenCompare}
            />
          ))}
        </div>
      </section>

      {/* 7. How Substitution Works (3 Clinical Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-800 text-white shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Algorithmic Bioequivalence
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              How the Substitution Engine Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Three verification layers ensuring therapeutic parity and financial savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-slate-100">Active Molecule Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The engine isolates the active pharmaceutical ingredient (e.g. Telmisartan 40mg) ignoring brand marketing markup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-slate-100">Strength & Delivery Parity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches are strictly filtered to identical dosage forms (Tablet, Capsule, Syrup) and exact milligram / microgram strengths.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-slate-100">Price Optimization & Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Presents substitutions ranked by maximum patient savings, with direct consultation disclaimers for doctor confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Substitute Compare Modal */}
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
