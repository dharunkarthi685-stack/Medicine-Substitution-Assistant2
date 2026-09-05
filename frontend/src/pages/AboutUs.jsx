import React from 'react';
import {
  ShieldCheck,
  Award,
  Heart,
  Pill,
  Users,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Affordable Healthcare & Direct Bioequivalence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Democratizing Access to Affordable Medicine
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          The Medicine Substitution Assistant was built with a single objective: to empower Indian patients and caregivers to reduce out-of-pocket prescription expenditure by up to 70% using verified generic bioequivalence.
        </p>
      </div>

      <MedicalDisclaimer />

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            100% Molecule Parity
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Our substitution algorithm never guesses. It strictly matches identical active salts, exact milligram strength and matching bio-delivery formulations.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            WHO-GMP Certified Pharma
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We curate alternatives produced by licensed, high-standard pharmaceutical companies complying with national pharmacopoeia standards.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Jan Aushadhi Alignment
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Supporting national public health initiatives by promoting awareness of quality generic medications to bridge economic gaps in chronic disease therapy.
          </p>
        </div>

      </div>

      {/* Clinical Guidance Checklist */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-800 text-white space-y-6">
        <h2 className="text-2xl font-black">
          Patient Safety & Doctor Consultation Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Always consult your attending physician before switching chronic cardiac or glycemic medications.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Check packaging seals and batch expiry dates upon delivery or pharmacy counter collection.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Confirm that the milligram strength strictly matches your original prescription note.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Store medicines under recommended clinical temperature away from direct humidity and sunlight.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
