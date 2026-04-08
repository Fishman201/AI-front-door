'use client';

import React from 'react';
import { useDecisionTree } from '@/components/providers/DecisionTreeProvider';
import { TreeOption } from '@/types/decision-tree';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface NavigationControlsProps {
  selectedOption: TreeOption | null;
  onContinue: () => void;
  isLastStep: boolean;
}

export default function NavigationControls({ selectedOption, onContinue, isLastStep }: NavigationControlsProps) {
  const { state, dispatch } = useDecisionTree();

  const isEntry = state.history.length === 0;

  const handleReset = () => {
    if (confirm("This will clear all your answers. Are you sure?")) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 md:px-0 mt-auto">
      <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between pb-4 gap-4">
        <button
          onClick={() => dispatch({ type: 'BACK' })}
          disabled={isEntry}
          aria-disabled={isEntry}
          className={`group min-h-[48px] px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
            ${isEntry 
              ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600' 
              : 'text-navy border-2 border-navy hover:bg-navy hover:text-white dark:text-teal-light dark:border-teal-light dark:hover:bg-teal-light dark:hover:text-navy active:scale-95 shadow-sm hover:shadow-md'
            }
          `}
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <button
          onClick={onContinue}
          disabled={!selectedOption}
          aria-disabled={!selectedOption}
          className={`group min-h-[48px] px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
            ${!selectedOption 
              ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' 
              : 'bg-teal text-white hover:bg-teal-light shadow-md hover:shadow-lg active:scale-95'
            }
          `}
        >
          {isLastStep ? 'See Results' : 'Continue'}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      
      <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/50">
        <button 
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-red-500 hover:underline transition-colors py-2 px-4 flex items-center justify-center gap-1 mx-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
        >
          <RotateCcw size={12} /> Start Over
        </button>
      </div>
    </div>
  );
}
