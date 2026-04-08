'use client';

import React from 'react';
import { useDecisionTree } from '@/components/providers/DecisionTreeProvider';

export default function ProgressBar() {
  const { state, dispatch } = useDecisionTree();
  
  const estimatedTotal = 7;
  const currentStepNum = state.history.length + 1;
  const historyNodes = state.history;
  
  return (
    <div 
      className="w-full max-w-2xl mx-auto py-4 px-4 md:px-0"
      role="progressbar"
      aria-valuenow={currentStepNum}
      aria-valuemin={1}
      aria-valuemax={estimatedTotal}
      aria-label={`Assessment progress: Step ${currentStepNum} of approximately ${estimatedTotal}`}
    >
      <div className="flex items-center space-x-2 mb-2">
        {historyNodes.map((nodeId, index) => (
          <button
             key={`hist-${index}`}
             onClick={() => dispatch({ type: 'JUMP_TO', nodeId })}
             className="h-2 flex-grow rounded-full bg-teal transition-all duration-300 hover:bg-teal-light hover:h-3 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:h-3 shadow-inner"
             title={`Go back to step ${index + 1}`}
             aria-label={`Go back to step ${index + 1}`}
          />
        ))}
        {/* Current Node */}
        <div 
          className="h-2 flex-grow rounded-full bg-teal animate-pulse shadow-[0_0_8px_rgba(13,115,119,0.5)] dark:shadow-[0_0_8px_rgba(20,184,190,0.5)] transition-all duration-300" 
          aria-hidden="true"
        />
        {/* Remaining */}
        {Array.from({ length: Math.max(0, estimatedTotal - currentStepNum) }).map((_, i) => (
          <div 
            key={`rem-${i}`} 
            className="h-2 flex-grow rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300 outline outline-1 outline-slate-300/50 dark:outline-slate-600/50" 
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-xs text-center text-slate-500 font-medium tracking-wide">
        Step <span className="text-navy dark:text-teal-light font-bold">{currentStepNum}</span> of ~{estimatedTotal}
      </p>
    </div>
  );
}
