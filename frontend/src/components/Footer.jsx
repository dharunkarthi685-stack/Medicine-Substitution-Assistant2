import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, PhoneCall, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors mt-auto">
      {/* Emergency Assistance Helpline Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-teal-900/60 to-emerald-900/60 border-b border-emerald-500/20 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">24/7 National Emergency Healthcare Helpline:</span>
            <span className="font-bold text-white tracking-wide">108 / 112</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Jan Aushadhi & Generic Medicine Standard Compliant</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                MedSubstitute
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Empowering patients, clinics and pharmacies with instant molecular generic substitution insights, clinical bioequivalence data, and transparent cost savings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Explore Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/substitutes" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('substituteFinder')}</span>
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="hover:text-emerald-400 transition">
                  {t('medicines')} Catalog
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-emerald-400 transition">
                  Healthcare Trends & Analytics
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  How Substitution Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Therapeutic Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Key Therapeutic Areas
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>Cardiovascular & Hypertension</li>
              <li>Diabetes & Glycemic Care</li>
              <li>Antibiotics & Anti-Infectives</li>
              <li>Gastrointestinal & Acidity</li>
              <li>Respiratory & Allergic Rhinitis</li>
            </ul>
          </div>

          {/* Medical Compliance & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Medical Disclaimer
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Statutory Warning</span>
              </div>
              <p>
                {t('disclaimer')} This portal assists in therapeutic price transparency and does not replace medical consultation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Medicine Substitution Assistant. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with clinical precision for affordable healthcare</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
