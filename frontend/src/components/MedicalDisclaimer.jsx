import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MedicalDisclaimer({ compact = false }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{t('disclaimer')}</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 p-4 sm:p-5 my-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide text-xs">
              Important Medical Safety Notice
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
              <ShieldCheck className="w-3 h-3" /> Mandatory Protocol
            </span>
          </div>
          <p className="text-amber-950 dark:text-amber-100/90 font-medium leading-relaxed">
            "{t('disclaimer')}"
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
            Generic substitution algorithms compare active molecular ingredients, bio-delivery forms and dosage strengths. Individual response variations may occur; always verify with your attending healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}
