'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { TreeNode, TreeOption } from '@/types/decision-tree';

interface StepCardProps {
  node: TreeNode;
  selectedOptionId?: string;
  onSelect: (option: TreeOption) => void;
  direction: 'forward' | 'backward';
}

export default function StepCard({ node, selectedOptionId, onSelect, direction }: StepCardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: shouldReduceMotion ? 0 : (dir === 'forward' ? 100 : -100),
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: shouldReduceMotion ? 0 : (dir === 'forward' ? -100 : 100),
      opacity: 0,
    }),
  };

  const getImpactColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-amber-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-transparent';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, option: TreeOption) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(option);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col justify-center py-6 px-2 md:px-0">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={node.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full"
          aria-live="polite"
        >
          <div className="sr-only">Step: {node.question}</div>
          <h2 className="text-xl md:text-3xl font-bold text-navy dark:text-white mb-4">
            {node.question}
          </h2>

          {node.helpText && (
            <div className="mb-6 relative">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm font-medium text-teal flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded p-1 mb-2 hover:bg-teal-light/10 transition-colors"
                aria-expanded={showHelp}
                aria-controls="help-content"
              >
                <Info size={16} /> Why do we ask this?
              </button>
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    id="help-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-l-4 border-teal pl-4 py-3 bg-teal-light/10 dark:bg-slate-800 dark:border-teal-light text-slate-700 dark:text-slate-300 rounded-r-lg shadow-sm">
                      <p className="text-sm md:text-base leading-relaxed">{node.helpText}</p>
                      {node.manualReference && (
                        <p className="text-xs text-slate-500 mt-2 font-mono">Ref: {node.manualReference}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div 
            className="space-y-4" 
            role="radiogroup" 
            aria-label="Options"
          >
            {node.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const hasSelection = !!selectedOptionId;
              
              return (
                <motion.div
                  key={option.id}
                  whileHover={isSelected ? {} : { scale: 1.01, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full group`}
                >
                  <button
                    onClick={() => onSelect(option)}
                    onKeyDown={(e) => handleKeyDown(e, option)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`w-full text-left p-5 md:p-6 rounded-xl border-2 transition-all duration-200 ease-out relative focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
                      ${isSelected 
                        ? 'border-teal bg-teal-light/10 dark:bg-teal-900/40 shadow-md ring-1 ring-teal' 
                        : `border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-teal/50 hover:shadow-md ${hasSelection ? 'opacity-85' : 'opacity-100'}`
                      }
                    `}
                  >
                    <div className="flex items-start justify-between min-h-[44px]">
                      <div className="pr-4">
                        <span className={`text-lg transition-colors duration-200 ${isSelected ? 'font-semibold text-teal-700 dark:text-teal-300' : 'font-medium text-slate-900 dark:text-slate-100'}`}>
                          {option.label}
                        </span>
                        {option.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {option.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 ml-2 mt-1">
                        {option.classificationImpact && (
                          <div 
                            className={`w-3 h-3 rounded-full shadow-sm border border-black/10 dark:border-white/10 ${getImpactColor(option.classificationImpact.level)}`} 
                            title={`Impact: ${option.classificationImpact.level}`}
                            aria-label={`Impact level: ${option.classificationImpact.level}`}
                          />
                        )}
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${isSelected ? 'bg-teal text-white scale-100 opacity-100' : 'scale-75 opacity-0 text-transparent'}`}>
                           <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
