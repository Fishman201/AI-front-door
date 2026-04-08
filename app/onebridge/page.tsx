'use client';

import React, { useState, forwardRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { routeInitiative } from '@/lib/route-initiative';
import { Initiative, Route } from '@/types/initiative';

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId = 'ai-check' | 'global-transformation' | 'maturity' | 'governance-awareness' | 'result';

interface WizardState {
  involvesAI: boolean | null;
  isGlobalTransformation: boolean | null;
  hasPassedGate3: boolean;
  hasPIDOrBusinessCase: boolean;
  hasExecutiveSponsor: boolean;
  hasSufficientDetail: boolean;
  understandsQuarterlyGovernance: boolean | null;
}

const initialState: WizardState = {
  involvesAI: null,
  isGlobalTransformation: null,
  hasPassedGate3: false,
  hasPIDOrBusinessCase: false,
  hasExecutiveSponsor: false,
  hasSufficientDetail: false,
  understandsQuarterlyGovernance: null,
};

// ─── Route display config ─────────────────────────────────────────────────────

const routeConfig: Record<Route, {
  icon: string;
  label: string;
  colour: string;
  borderColour: string;
  badgeBg: string;
  badgeText: string;
  summary: string;
  nextSteps: string[];
  action?: { label: string; href: string };
}> = {
  SUBMIT_TO_ONEBRIDGE_AI_SC: {
    icon: '🤖',
    label: 'Submit via AI Front Door',
    colour: 'bg-teal/5 dark:bg-teal/10',
    borderColour: 'border-teal',
    badgeBg: 'bg-teal',
    badgeText: 'text-white',
    summary: 'Because your initiative involves AI, it must be assessed through the AI Steering Committee before OneBridge submission.',
    nextSteps: [
      'Complete the AI classification assessment on this portal.',
      'Obtain your AI risk tier and required evidence checklist.',
      'Engage the AI Steering Committee (AIDEX) for governance review.',
      'Only then submit to OneBridge — with the AI classification attached.',
    ],
    action: { label: 'Go to AI Assessment', href: '/assess' },
  },
  DO_NOT_SUBMIT_LOCAL_ROUTE: {
    icon: '📍',
    label: 'Use Local / Sector Route',
    colour: 'bg-slate-50 dark:bg-slate-800',
    borderColour: 'border-slate-400 dark:border-slate-500',
    badgeBg: 'bg-slate-500',
    badgeText: 'text-white',
    summary: 'This initiative does not qualify as a Global Transformation and should not be submitted to OneBridge. Use your local or sector PMO and IT Engagement route instead.',
    nextSteps: [
      'Speak to your local PMO or Business Partner.',
      'Engage the IT Engagement team for any technology component.',
      'Follow your local sector governance process.',
      'If scope later grows to a Global Transformation, return here.',
    ],
  },
  DO_NOT_SUBMIT_NOT_MATURE: {
    icon: '⏳',
    label: 'Not Ready for OneBridge',
    colour: 'bg-amber-50 dark:bg-amber-900/10',
    borderColour: 'border-amber-500',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    summary: 'This initiative is not yet mature enough to enter OneBridge. Address the outstanding readiness criteria before submitting.',
    nextSteps: [
      'Complete the Gate 3 readiness review with your sponsor.',
      'Produce a Project Initiation Document (PID) or early Business Case.',
      'Confirm and document an Executive Sponsor.',
      'Ensure scope, benefits, and delivery plan are sufficiently detailed.',
      'Return to this tool once the criteria are met.',
    ],
  },
  REVIEW_GUIDANCE_FIRST: {
    icon: '📖',
    label: 'Review Guidance First',
    colour: 'bg-blue-50 dark:bg-blue-900/10',
    borderColour: 'border-blue-500',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-white',
    summary: 'Before submitting, the initiative lead must review the OneBridge governance requirements — including the quarterly review cycle and submission expectations.',
    nextSteps: [
      'Read the OneBridge submission guidance document.',
      'Understand the quarterly ExCo / ELT review cycle and cut-off dates.',
      'Brief your Executive Sponsor on governance expectations.',
      'Return here once the team is aligned and ready to submit.',
    ],
  },
  SUBMIT_TO_ONEBRIDGE_TPMO: {
    icon: '✅',
    label: 'Submit to OneBridge (TPMO)',
    colour: 'bg-green-50 dark:bg-green-900/10',
    borderColour: 'border-green-500',
    badgeBg: 'bg-green-600',
    badgeText: 'text-white',
    summary: 'Your initiative is a mature, non-AI Global Transformation and is ready for OneBridge submission — it will enter the TPMO / ExCo / ELT quarterly review cycle.',
    nextSteps: [
      'Log in to OneBridge and create your programme/project record.',
      'Attach your PID or Business Case.',
      'Confirm your Executive Sponsor details.',
      'Submit before the current quarter cut-off date.',
      'Prepare for the quarterly TPMO review session.',
    ],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function YesNoButton({
  label,
  detail,
  selected,
  variant = 'default',
  onClick,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  variant?: 'default' | 'yes' | 'no';
  onClick: () => void;
}) {
  const selectedStyle =
    variant === 'yes'
      ? 'border-teal bg-teal/10 dark:bg-teal/20'
      : variant === 'no'
      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
      : 'border-teal bg-teal/10 dark:bg-teal/20';

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${selected
          ? selectedStyle + ' shadow-sm'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/50 hover:shadow-sm'
        }
      `}
    >
      <span className={`font-semibold ${selected ? 'text-teal dark:text-teal-light' : 'text-slate-900 dark:text-white'}`}>
        {label}
      </span>
      {detail && (
        <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">{detail}</span>
      )}
    </button>
  );
}

function CheckboxRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
        focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${checked
          ? 'border-teal bg-teal/10 dark:bg-teal/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/50'
        }
      `}
    >
      <div className={`
        mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
        ${checked ? 'bg-teal border-teal' : 'border-slate-300 dark:border-slate-600'}
      `}>
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <div>
        <span className={`font-semibold ${checked ? 'text-teal dark:text-teal-light' : 'text-slate-900 dark:text-white'}`}>
          {label}
        </span>
        {detail && (
          <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5">{detail}</span>
        )}
      </div>
    </button>
  );
}

const StepWrapper = forwardRef<HTMLDivElement, {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
}>(function StepWrapper({
  stepNumber,
  title,
  description,
  children,
  canContinue,
  onContinue,
  onBack,
  continueLabel = 'Continue',
}, ref) {
  return (
    <motion.div
      ref={ref}
      key={stepNumber}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Step header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-navy dark:bg-slate-700 text-teal-light text-sm font-bold flex items-center justify-center shrink-0">
            {stepNumber}
          </span>
          <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">{title}</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-11">{description}</p>
      </div>

      {/* Content */}
      <div className="pl-11 space-y-3">{children}</div>

      {/* Navigation */}
      <div className="pl-11 flex items-center gap-4 pt-2">
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`
            px-8 py-3 rounded-xl font-semibold transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
            ${canContinue
              ? 'bg-teal hover:bg-teal-light text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {continueLabel} →
        </button>
      </div>
    </motion.div>
  );
});

// ─── Result panel ─────────────────────────────────────────────────────────────

const ResultPanel = forwardRef<HTMLDivElement, { route: Route; reasons: string[]; onStartOver: () => void }>(function ResultPanel({ route, reasons, onStartOver }, ref) {
  const cfg = routeConfig[route];

  return (
    <motion.div
      ref={ref}
      key="result"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Result badge */}
      <div className={`rounded-2xl border-2 ${cfg.borderColour} ${cfg.colour} p-8 space-y-5`}>
        <div className="flex items-start gap-5">
          <div className={`w-16 h-16 rounded-full ${cfg.badgeBg} flex items-center justify-center text-3xl shadow-md shrink-0`}>
            {cfg.icon}
          </div>
          <div>
            <span className={`inline-block ${cfg.badgeBg} ${cfg.badgeText} text-xs font-bold px-3 py-1 rounded-full mb-2 tracking-wider uppercase`}>
              Routing Decision
            </span>
            <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">{cfg.label}</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{cfg.summary}</p>
          </div>
        </div>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Why this decision was reached:</h3>
          <ul className="space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-teal mt-0.5 shrink-0">›</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-navy dark:bg-slate-900 rounded-xl p-6 md:p-8 space-y-4">
        <h3 className="font-bold text-teal-light text-lg">Recommended next steps</h3>
        <ol className="space-y-3 list-decimal pl-5 text-slate-200 text-sm">
          {cfg.nextSteps.map((step, i) => (
            <li key={i} className="leading-relaxed">{step}</li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {cfg.action && (
          <Link
            href={cfg.action.href}
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95"
          >
            <span>{cfg.action.label}</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <button
          onClick={onStartOver}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          ← Start Over
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Home
        </Link>
      </div>
    </motion.div>
  );
});

// ─── Progress bar ─────────────────────────────────────────────────────────────

function WizardProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="space-y-1.5 mb-8" aria-label={`Step ${step} of ${total}`}>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const totalSteps = 4;
const stepNumbers: Record<StepId, number> = {
  'ai-check': 1,
  'global-transformation': 2,
  'maturity': 3,
  'governance-awareness': 4,
  'result': 4,
};

export default function OneBridgePage() {
  const [step, setStep] = useState<StepId>('ai-check');
  const [wizard, setWizard] = useState<WizardState>(initialState);
  const [result, setResult] = useState<{ route: Route; reasons: string[] } | null>(null);

  function handleStartOver() {
    setStep('ai-check');
    setWizard(initialState);
    setResult(null);
  }

  function computeResult(state: WizardState) {
    const initiative: Initiative = {
      id: 'wizard',
      involvesAI: state.involvesAI ?? false,
      isGlobalTransformation: state.isGlobalTransformation ?? false,
      hasPassedGate3: state.hasPassedGate3,
      hasPIDOrBusinessCase: state.hasPIDOrBusinessCase,
      hasExecutiveSponsor: state.hasExecutiveSponsor,
      hasSufficientDetail: state.hasSufficientDetail,
      understandsQuarterlyGovernance: state.understandsQuarterlyGovernance ?? false,
    };
    return routeInitiative(initiative);
  }

  function goToResult(state: WizardState) {
    const r = computeResult(state);
    setResult(r);
    setStep('result');
  }

  // ─── Step: AI Check ───
  function handleAiCheck(value: boolean) {
    const next = { ...wizard, involvesAI: value };
    setWizard(next);
    if (value) {
      // Short-circuit: AI involved → immediately route
      goToResult(next);
    }
  }

  function continueAiCheck() {
    setStep('global-transformation');
  }

  // ─── Step: Global Transformation ───
  function handleGlobalTransformation(value: boolean) {
    const next = { ...wizard, isGlobalTransformation: value };
    setWizard(next);
    if (!value) {
      // Short-circuit: not global → immediately route
      goToResult(next);
    }
  }

  function continueGlobalTransformation() {
    setStep('maturity');
  }

  // ─── Step: Maturity ───
  const maturityMet =
    wizard.hasPassedGate3 &&
    wizard.hasPIDOrBusinessCase &&
    wizard.hasExecutiveSponsor &&
    wizard.hasSufficientDetail;

  function continueMaturity() {
    if (!maturityMet) {
      goToResult(wizard);
    } else {
      setStep('governance-awareness');
    }
  }

  // ─── Step: Governance awareness ───
  function handleGovernanceAwareness(value: boolean) {
    const next = { ...wizard, understandsQuarterlyGovernance: value };
    setWizard(next);
  }

  function continueGovernanceAwareness() {
    goToResult(wizard);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24 space-y-0">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 space-y-3"
      >
        <div className="inline-flex items-center gap-2 bg-navy text-teal-light text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
          <span>OneBridge Routing</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">
          Should this initiative go to OneBridge?
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Answer these questions to find the correct submission route — or discover why the initiative isn&apos;t ready for OneBridge yet.
        </p>
      </motion.div>

      {/* Progress bar (only before result) */}
      {step !== 'result' && (
        <WizardProgress step={stepNumbers[step]} total={totalSteps} />
      )}

      {/* Steps */}
      <AnimatePresence mode="wait">

        {/* ── Step 1: Does this involve AI? ── */}
        {step === 'ai-check' && (
          <StepWrapper
            key="ai-check"
            stepNumber={1}
            title="Does this initiative involve AI?"
            description="AI includes machine learning, generative AI, large language models, predictive algorithms, and any tool powered by a third-party AI platform (e.g. Copilot, Gemini, ChatGPT). If in doubt, check the AI pre-screen first."
            canContinue={wizard.involvesAI === false}
            onContinue={continueAiCheck}
            continueLabel="No — Continue"
          >
            <YesNoButton
              label="Yes — it involves AI or ML"
              detail="Includes generative AI, machine learning, predictive models, AI-powered tools"
              selected={wizard.involvesAI === true}
              variant="yes"
              onClick={() => handleAiCheck(true)}
            />
            <YesNoButton
              label="No — no AI involved"
              detail="Purely conventional technology, process change, or business transformation"
              selected={wizard.involvesAI === false}
              variant="no"
              onClick={() => handleAiCheck(false)}
            />
            <div className="pt-2 text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <span className="text-amber-500 shrink-0">ℹ️</span>
              <span>
                Not sure?{' '}
                <Link href="/prescreen" className="text-teal hover:underline font-medium">
                  Complete the AI Pre-Screen first
                </Link>{' '}
                to determine whether your initiative involves AI.
              </span>
            </div>
          </StepWrapper>
        )}

        {/* ── Step 2: Global Transformation? ── */}
        {step === 'global-transformation' && (
          <StepWrapper
            key="global-transformation"
            stepNumber={2}
            title="Is this a Global Transformation initiative?"
            description="Global Transformation initiatives are cross-sector or enterprise-wide programmes with significant strategic, financial, or operational impact. Local or sector-contained changes should use local / sector PMO routes."
            canContinue={wizard.isGlobalTransformation === true}
            onContinue={continueGlobalTransformation}
            onBack={() => setStep('ai-check')}
            continueLabel="Yes — Continue"
          >
            <YesNoButton
              label="Yes — this is a Global Transformation"
              detail="Cross-sector, enterprise-wide, or ELT/ExCo-sponsored strategic programme"
              selected={wizard.isGlobalTransformation === true}
              variant="yes"
              onClick={() => handleGlobalTransformation(true)}
            />
            <YesNoButton
              label="No — this is not a Global Transformation"
              detail="Local, sector-specific, or purely operational change"
              selected={wizard.isGlobalTransformation === false}
              variant="no"
              onClick={() => handleGlobalTransformation(false)}
            />
          </StepWrapper>
        )}

        {/* ── Step 3: Maturity ── */}
        {step === 'maturity' && (
          <StepWrapper
            key="maturity"
            stepNumber={3}
            title="Is the initiative sufficiently mature?"
            description="OneBridge requires a minimum level of readiness before a programme can enter the quarterly review cycle. Tick all that apply — all four must be confirmed to proceed."
            canContinue={true}
            onContinue={continueMaturity}
            onBack={() => setStep('global-transformation')}
            continueLabel={maturityMet ? 'All criteria met — Continue' : 'Submit with gaps identified'}
          >
            <CheckboxRow
              label="Passed Gate 3"
              detail="The initiative has passed a formal Gate 3 / investment decision readiness review"
              checked={wizard.hasPassedGate3}
              onChange={v => setWizard(w => ({ ...w, hasPassedGate3: v }))}
            />
            <CheckboxRow
              label="PID or early-stage Business Case exists"
              detail="A Project Initiation Document or preliminary Business Case has been produced"
              checked={wizard.hasPIDOrBusinessCase}
              onChange={v => setWizard(w => ({ ...w, hasPIDOrBusinessCase: v }))}
            />
            <CheckboxRow
              label="Executive Sponsor confirmed"
              detail="A named ELT/ExCo-level Executive Sponsor has formally agreed to sponsor the initiative"
              checked={wizard.hasExecutiveSponsor}
              onChange={v => setWizard(w => ({ ...w, hasExecutiveSponsor: v }))}
            />
            <CheckboxRow
              label="Sufficient detail on scope, benefits, and delivery"
              detail="Scope is defined, expected benefits are evidenced, and a high-level delivery plan is in place"
              checked={wizard.hasSufficientDetail}
              onChange={v => setWizard(w => ({ ...w, hasSufficientDetail: v }))}
            />

            {/* Maturity indicator */}
            <div className="pt-2">
              {maturityMet ? (
                <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/30 text-teal dark:text-teal-light text-sm font-semibold px-4 py-2 rounded-full">
                  <span>✓</span> All maturity criteria met
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium px-4 py-2 rounded-full">
                  <span>⚠️</span>{' '}
                  {[
                    !wizard.hasPassedGate3 && 'Gate 3',
                    !wizard.hasPIDOrBusinessCase && 'PID/Business Case',
                    !wizard.hasExecutiveSponsor && 'Executive Sponsor',
                    !wizard.hasSufficientDetail && 'Scope/Benefits/Delivery',
                  ].filter(Boolean).join(', ')} outstanding
                </div>
              )}
            </div>
          </StepWrapper>
        )}

        {/* ── Step 4: Governance awareness ── */}
        {step === 'governance-awareness' && (
          <StepWrapper
            key="governance-awareness"
            stepNumber={4}
            title="Does the initiative lead understand the OneBridge governance cycle?"
            description="OneBridge operates on a quarterly review cycle. Submissions must be made before the relevant cut-off date, and the team must be prepared to present to TPMO / ExCo / ELT as required."
            canContinue={wizard.understandsQuarterlyGovernance !== null}
            onContinue={continueGovernanceAwareness}
            onBack={() => setStep('maturity')}
            continueLabel="Confirm & See Result"
          >
            <YesNoButton
              label="Yes — we understand the quarterly cycle and submission requirements"
              detail="The team is aware of the process, cut-off dates, and what to expect from the review"
              selected={wizard.understandsQuarterlyGovernance === true}
              variant="yes"
              onClick={() => handleGovernanceAwareness(true)}
            />
            <YesNoButton
              label="No — we need to review the guidance first"
              detail="The initiative lead or sponsor is not yet familiar with OneBridge governance expectations"
              selected={wizard.understandsQuarterlyGovernance === false}
              variant="no"
              onClick={() => handleGovernanceAwareness(false)}
            />
          </StepWrapper>
        )}

        {/* ── Result ── */}
        {step === 'result' && result && (
          <ResultPanel key="result" route={result.route} reasons={result.reasons} onStartOver={handleStartOver} />
        )}

      </AnimatePresence>

      {/* Footer note */}
      {step !== 'result' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-8">
          Reference: OneBridge Governance Framework · If unsure, contact the TPMO or your IT Business Partner.
        </p>
      )}
    </div>
  );
}
