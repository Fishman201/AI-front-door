'use client';
import { useDecisionTree } from '@/components/providers/DecisionTreeProvider';
import { motion } from 'framer-motion';
import { AlertOctagon, Mail, RotateCcw } from 'lucide-react';

export default function ProhibitedGate() {
  const { state, dispatch } = useDecisionTree();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      role="alert"
      aria-live="assertive"
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-24 h-24 mb-6 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shadow-sm border-4 border-white dark:border-slate-900 ring-2 ring-red-100 dark:ring-red-900/50"
      >
         <AlertOctagon size={48} strokeWidth={2.5} aria-hidden="true" />
      </motion.div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
        This use case cannot proceed
      </h2>
      <p className="text-lg text-slate-700 dark:text-slate-300 max-w-lg mb-6 leading-relaxed">
        {state.prohibitedReason}
      </p>
      <p className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full mb-8">
        This is a prohibited use under Section 6 of the AI Use Manual.
      </p>

      <div className="bg-white dark:bg-slate-800 border-l-4 border-red-500 rounded-lg p-6 w-full max-w-lg mb-8 shadow-md text-left transition-all hover:shadow-lg">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg flex items-center gap-2">
          What to do instead
        </h3>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex gap-3">
            <span className="text-red-500 mt-1">•</span>
            <span>Contact AIDEX directly to discuss your requirements via <a href="mailto:aidex@example.com" className="text-teal hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-teal rounded">aidex@example.com</a>.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-500 mt-1">•</span>
            <span>If you believe this classification is incorrect, AIDEX can review your specific circumstances.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <button 
          className="flex-1 bg-red-600 text-white min-h-[48px] rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          onClick={() => window.location.href = 'mailto:aidex@example.com'}
        >
          <Mail size={18} /> Contact AIDEX
        </button>
        <button 
          className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 min-h-[48px] rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          <RotateCcw size={18} /> Start a New Assessment
        </button>
      </div>
    </motion.div>
  );
}
