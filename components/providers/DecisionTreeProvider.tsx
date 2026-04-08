'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import treeData from '@/data/decision-tree.json';
import { classify, detectProhibitedOrRestricted } from '@/lib/classify';
import { TreeNode, ClassificationResult } from '@/types/decision-tree';

type State = {
  currentNodeId: string;
  answers: Record<string, string>;
  history: string[];
  isComplete: boolean;
  isProhibited: boolean;
  isRestricted: boolean;
  prohibitedReason: string | null;
  restrictedReason: string | null;
  classification: ClassificationResult | null;
  entryType: string | null;
  warnings: string[];
  nodes: TreeNode[];
};

type Action =
  | { type: 'ANSWER'; nodeId: string; optionId: string; nextNodeId: string }
  | { type: 'BACK' }
  | { type: 'RESET' }
  | { type: 'JUMP_TO'; nodeId: string }
  | { type: 'SET_RESTRICTED_ACKNOWLEDGED' }
  | { type: 'LOAD_PREFILL'; answers: Record<string, string> };

const initialState: State = {
  currentNodeId: 'entry',
  answers: {},
  history: [],
  isComplete: false,
  isProhibited: false,
  isRestricted: false,
  prohibitedReason: null,
  restrictedReason: null,
  classification: null,
  entryType: null,
  warnings: [],
  nodes: treeData.nodes as TreeNode[],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ANSWER': {
      const { nodeId, optionId, nextNodeId } = action;
      const newAnswers = { ...state.answers, [nodeId]: optionId };
      // Guard against unbounded growth: if this nodeId already exists in history
      // (loop / back-and-forward navigation), truncate at that point first.
      const loopIdx = state.history.indexOf(nodeId);
      const baseHistory = loopIdx !== -1 ? state.history.slice(0, loopIdx) : state.history;
      const newHistory = [...baseHistory, nodeId];
      
      let entryType = state.entryType;
      if (nodeId === 'entry') {
        entryType = optionId;
      }

      const check = detectProhibitedOrRestricted(newAnswers, state.nodes);
      
      if (nextNodeId === 'PROHIBITED' || check.status === 'PROHIBITED') {
        return {
          ...state,
          answers: newAnswers,
          history: newHistory,
          isProhibited: true,
          prohibitedReason: check.reason || 'Prohibited by direct option selection.',
          entryType,
        };
      }
      if (nextNodeId === 'RESTRICTED' || check.status === 'RESTRICTED') {
        // Issue 3 fix: removed the !state.isRestricted guard — it allowed back-navigation
        // to silently bypass the restricted gate on re-answer. Always enforce it.
        // Issue 3b fix: when triggered by factor analysis (not a direct 'RESTRICTED' nextNodeId),
        // keep the user on the current node — the RestrictedGate overlays visually.
        return {
          ...state,
          answers: newAnswers,
          history: newHistory,
          isRestricted: true,
          isComplete: false,
          classification: null,
          restrictedReason: check.reason || 'Restricted by direct option selection.',
          currentNodeId: nextNodeId === 'RESTRICTED' ? state.currentNodeId : nextNodeId,
          entryType,
        };
      }

      if (nextNodeId === 'RESULTS') {
        const classification = classify(newAnswers, state.nodes);
        return {
          ...state,
          answers: newAnswers,
          history: newHistory,
          isComplete: true,
          classification,
          entryType,
        };
      }

      return {
        ...state,
        answers: newAnswers,
        history: newHistory,
        currentNodeId: nextNodeId,
        entryType,
      };
    }
    case 'BACK': {
      if (state.history.length === 0) return state;
      const previousNodeId = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const newAnswers = { ...state.answers };
      delete newAnswers[previousNodeId];
      
      return {
        ...state,
        answers: newAnswers,
        history: newHistory,
        currentNodeId: previousNodeId,
        isProhibited: false,
        isRestricted: false,
        prohibitedReason: null,
        restrictedReason: null,
        isComplete: false,
      };
    }
    case 'RESET':
      return initialState;
    case 'JUMP_TO': {
      const idx = state.history.indexOf(action.nodeId);
      if (idx === -1) return state;
      const newHistory = state.history.slice(0, idx);
      const newAnswers = { ...state.answers };
      state.history.slice(idx).forEach(id => delete newAnswers[id]);
      
      return {
        ...state,
        answers: newAnswers,
        history: newHistory,
        currentNodeId: action.nodeId,
        isProhibited: false,
        isRestricted: false,
        prohibitedReason: null,
        restrictedReason: null,
        isComplete: false,
      };
    }
    case 'SET_RESTRICTED_ACKNOWLEDGED': {
       const classification = classify(state.answers, state.nodes);
       return {
         ...state,
         isComplete: true,
         classification,
       }
    }
    case 'LOAD_PREFILL': {
      return {
        ...state,
        answers: action.answers,
        entryType: action.answers['entry'] || null,
      };
    }
    default:
      return state;
  }
}

const DecisionTreeContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function DecisionTreeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Ingest AI Map prefill from OneBridge if available
  useEffect(() => {
    const prefill = sessionStorage.getItem('ai-front-door-prefill');
    if (prefill) {
      try {
        const answers = JSON.parse(prefill);
        dispatch({ type: 'LOAD_PREFILL', answers });
        sessionStorage.removeItem('ai-front-door-prefill');
      } catch (e) {
        console.error('Failed to parse prefill', e);
      }
    }
  }, []);

  useEffect(() => {
    // Only trigger when isComplete first becomes true.
    // Do NOT include state.answers / state.classification / state.entryType in deps —
    // those are new object references on every dispatch and would cause this to fire
    // repeatedly (and hammer sessionStorage) after completion.
    if (state.isComplete && state.classification) {
       sessionStorage.setItem('ai-front-door-result', JSON.stringify({
         answers: state.answers,
         classification: state.classification,
         entryType: state.entryType
       }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isComplete]);

  return (
    <DecisionTreeContext.Provider value={{ state, dispatch }}>
      {children}
    </DecisionTreeContext.Provider>
  );
}

export function useDecisionTree() {
  const context = useContext(DecisionTreeContext);
  if (!context) throw new Error('useDecisionTree must be used within Provider');
  return context;
}
