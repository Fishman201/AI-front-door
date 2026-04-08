'use client';
import { useDecisionTree } from '@/components/providers/DecisionTreeProvider';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, Mail } from 'lucide-react';

export default function RestrictedGate() {
  const { state, dispatch } = useDecisionTree();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="restricted-title"
      aria-describedby="restricted-desc"
    >
      <motion.div 
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        className="w-24 h-24 mb-6 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center shadow-sm border-4 border-white dark:border-slate-900 ring-2 ring-amber-100 dark:ring-amber-900/50"
      >
         <AlertTriangle size={44} strokeWidth={2.5} aria-hidden="true" />
      </motion.div>
      <h2 id="restricted-title" className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
        This use case has additional restrictions
      </h2>
      <p className="text-lg text-slate-700 dark:text-slate-300 max-w-lg mb-4 leading-relaxed">
        {state.restrictedReason}
      </p>
      <p id="restricted-desc" className="text-base font-medium text-amber-700 dark:text-amber-500 mb-8 max-w-xl bg-amber-50 dark:bg-slate-800 px-6 py-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
        This use case may be possible, but requires explicit written approval, enhanced controls, and specialist review.
      </p>

      <div className="bg-white dark:bg-slate-800 border-l-4 border-amber-500 rounded-lg p-6 w-full max-w-lg mb-8 shadow-md text-left">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">What&apos;s needed to proceed:</h3>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex gap-3"><span className="text-amber-500">•</span> Formal presentation to the Executive Project Team (EPT).</li>
          <li className="flex gap-3"><span className="text-amber-500">•</span> Detailed architectural and security review.</li>
          <li className="flex gap-3"><span className="text-amber-500">•</span> Direct sign-off from domain duty holders.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <button 
          className="flex-1 bg-amber-500 text-white min-h-[48px] rounded-lg font-medium hover:bg-amber-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
          onClick={() => dispatch({ type: 'SET_RESTRICTED_ACKNOWLEDGED' })}
        >
          Acknowledge &amp; Continue
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 min-h-[48px] rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
          onClick={() => window.location.href = 'mailto:aidex@example.com'}
        >
          <Mail size={18} /> Contact AIDEX First
        </button>
      </div>

      {/* Issue 4 fix: back button so users don't lose all their answers — previously
          the only escape was "Start Over" which wiped all progress. */}
      {state.history.length > 0 && (
        <button
          className="mt-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-2 py-1"
          onClick={() => dispatch({ type: 'BACK' })}
        >
          ← Go back and revise my answer
        </button>
      )}
    </motion.div>
  );
}
