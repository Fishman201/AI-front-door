'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DecisionTreeProvider, useDecisionTree } from '@/components/providers/DecisionTreeProvider';
import StepCard from '@/components/tree/StepCard';
import ProgressBar from '@/components/tree/ProgressBar';
import NavigationControls from '@/components/tree/NavigationControls';
import ProhibitedGate from '@/components/tree/ProhibitedGate';
import RestrictedGate from '@/components/tree/RestrictedGate';
import { TreeOption } from '@/types/decision-tree';

function AssessmentFlow() {
  const { state, dispatch } = useDecisionTree();
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryParam = searchParams.get('entry');
  
  const [selectedOption, setSelectedOption] = useState<TreeOption | null>(null);
  const [navDirection, setNavDirection] = useState<'forward' | 'backward'>('forward');
  const [init, setInit] = useState(false);

  useEffect(() => {
    // Issue 1 fix: do NOT put the entire `state` object in deps — every dispatch creates
    // a new object reference, which re-triggers this effect endlessly (infinite loop).
    // Use only the specific primitive fields this effect actually needs.
    if (entryParam && !init && state.currentNodeId === 'entry' && state.history.length === 0) {
      setInit(true);
      const entryNode = state.nodes.find(n => n.id === 'entry');
      if (entryNode) {
        const option = entryNode.options.find(o => o.value === entryParam);
        if (option) {
          dispatch({
            type: 'ANSWER',
            nodeId: 'entry',
            optionId: option.id,
            nextNodeId: option.nextNodeId,
          });
        }
      }
    } else {
      setInit(true);
    }
  // `dispatch` is stable (useReducer guarantee); `state.nodes` is static tree data.
  // Only primitive / length deps are listed to prevent re-triggering on every action.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryParam, init, state.currentNodeId, state.history.length]);

  // Memoize currentNode so its reference only changes when the nodeId actually changes,
  // not on every unrelated state dispatch (fixes Issue 2 object-ref churn).
  const currentNode = useMemo(
    () => state.nodes.find(n => n.id === state.currentNodeId),
    [state.nodes, state.currentNodeId]
  );

  // Issue 2 fix: `state.answers` is a new object reference on every dispatch (spread in reducer).
  // Extract only the primitive value for the current node so this effect only re-runs
  // when the answer for the current question genuinely changes.
  const currentAnswerId = state.answers[state.currentNodeId];
  useEffect(() => {
    if (currentAnswerId && currentNode) {
       setSelectedOption(currentNode.options.find(o => o.id === currentAnswerId) || null);
    } else {
       setSelectedOption(null);
    }
  }, [state.currentNodeId, currentAnswerId, currentNode]);

  useEffect(() => {
    if (state.isComplete) {
      router.push('/results');
    }
  }, [state.isComplete, router]);

  const handleSelect = (option: TreeOption) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption && currentNode) {
      setNavDirection('forward');
      dispatch({
        type: 'ANSWER',
        nodeId: currentNode.id,
        optionId: selectedOption.id,
        nextNodeId: selectedOption.nextNodeId,
      });
    }
  };

  // Prevent flash of content during init
  if (entryParam && !init && state.currentNodeId === 'entry') return <div className="p-8">Loading assessment...</div>;

  if (state.isProhibited) {
    return <ProhibitedGate />;
  }
  if (state.isRestricted) {
    return <RestrictedGate />;
  }

  if (!currentNode) return <div className="p-8">Node not found: {state.currentNodeId}</div>;

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] w-full relative overflow-hidden">
      <ProgressBar />
      <StepCard 
        node={currentNode} 
        selectedOptionId={selectedOption?.id} 
        onSelect={handleSelect}
        direction={navDirection}
      />
      <NavigationControls 
        selectedOption={selectedOption}
        onContinue={handleContinue}
        isLastStep={selectedOption?.nextNodeId === 'RESULTS'}
      />
    </div>
  );
}

export default function AssessPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Form...</div>}>
      <DecisionTreeProvider>
        <AssessmentFlow />
      </DecisionTreeProvider>
    </Suspense>
  );
}
