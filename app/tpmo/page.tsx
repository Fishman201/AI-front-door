'use client';

import { useState, useReducer, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
const TPMO_EMAIL = process.env.NEXT_PUBLIC_TPMO_EMAIL ?? 'global.tpmo@babcock.com';

// ─── Types ────────────────────────────────────────────────────────────────────

type BenefitType = 'overhead-efficiency' | 'gross-margin' | 'both' | 'neither' | '';
type ReviewWindow = 'q1' | 'q2' | 'q3' | 'q4' | '';
type Stage = 1 | 2 | 3 | 'outcome';

interface FormData {
  // Section 1 — Initiative
  initiativeTitle: string;
  initiativeOverview: string;
  strategicPriorities: string;
  scopeAndImpact: string;
  sector: string;

  // Section 2 — Investment & delivery
  investmentEstimate: string;
  fundingStatus: string;
  financialBenefits: string;
  nonFinancialBenefits: string;
  benefitType: BenefitType;
  deliveryApproach: string;
  expectedTimeline: string;
  kpis: string;

  // Section 3 — Governance
  executiveSponsorName: string;
  executiveSponsorRole: string;
  sponsorEndorsed: boolean;
  pidAttached: boolean;
  reviewWindowPreference: ReviewWindow;
  additionalContext: string;
}

interface State {
  stage: Stage;
  form: FormData;
}

type Action =
  | { type: 'UPDATE'; field: keyof FormData; value: string | boolean }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const EMPTY: FormData = {
  initiativeTitle: '', initiativeOverview: '', strategicPriorities: '',
  scopeAndImpact: '', sector: '',
  investmentEstimate: '', fundingStatus: '', financialBenefits: '',
  nonFinancialBenefits: '', benefitType: '', deliveryApproach: '',
  expectedTimeline: '', kpis: '',
  executiveSponsorName: '', executiveSponsorRole: '',
  sponsorEndorsed: false, pidAttached: false,
  reviewWindowPreference: '', additionalContext: '',
};

const STAGES: Stage[] = [1, 2, 3, 'outcome'];

function next(s: Stage): Stage {
  const i = STAGES.indexOf(s);
  return STAGES[Math.min(i + 1, STAGES.length - 1)];
}
function prev(s: Stage): Stage {
  const i = STAGES.indexOf(s);
  return STAGES[Math.max(i - 1, 0)];
}

function canAdvance(stage: Stage, form: FormData): boolean {
  if (stage === 1) return !!(form.initiativeTitle && form.initiativeOverview && form.strategicPriorities && form.scopeAndImpact && form.sector);
  if (stage === 2) return !!(form.investmentEstimate && form.financialBenefits && form.benefitType && form.deliveryApproach && form.kpis);
  if (stage === 3) return !!(form.executiveSponsorName && form.executiveSponsorRole && form.sponsorEndorsed && form.pidAttached);
  return true;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE': return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'NEXT': return { ...state, stage: next(state.stage) };
    case 'PREV': return { ...state, stage: prev(state.stage) };
    case 'SUBMIT': return { ...state, stage: 'outcome' };
    case 'RESET': return { stage: 1, form: EMPTY };
    default: return state;
  }
}

// ─── Shared field components ──────────────────────────────────────────────────

const inp = `w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
  placeholder:text-slate-400 transition-colors`;

const ta = `${inp} resize-none`;

function F({ label, hint, req, children }: { label: string; hint?: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}{req && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}

function SectionHeader({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
      <div>
        <h2 className="text-xl font-bold text-navy dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function CheckButton({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-start gap-3 w-full text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${checked ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'}`}>
      <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
        ${checked ? 'bg-purple-600 border-purple-600' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300">{children}</span>
    </button>
  );
}

// ─── Form sections ────────────────────────────────────────────────────────────

function Section1({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });
  return (
    <div className="space-y-6">
      <SectionHeader n={1} title="Initiative overview" sub="Describe what this initiative is and what it aims to achieve." />
      <F label="Initiative title" req>
        <input className={inp} value={form.initiativeTitle} onChange={upd('initiativeTitle')} placeholder="e.g. Enterprise data platform consolidation" />
      </F>
      <F label="Overview" req hint="What problem does this solve? What will it deliver?">
        <textarea className={ta} rows={4} value={form.initiativeOverview} onChange={upd('initiativeOverview')} placeholder="Plain-language description of the initiative..." />
      </F>
      <F label="Strategic priorities supported" req hint="Which Babcock strategic priorities does this support?">
        <textarea className={ta} rows={2} value={form.strategicPriorities} onChange={upd('strategicPriorities')} placeholder="e.g. Digital transformation, operational efficiency, margin improvement..." />
      </F>
      <F label="Scope and business impact" req hint="What is in scope? Which sectors, functions or business units are affected?">
        <textarea className={ta} rows={3} value={form.scopeAndImpact} onChange={upd('scopeAndImpact')} placeholder="Define scope and expected impact across the business..." />
      </F>
      <F label="Sector / function" req>
        <select className={inp} value={form.sector} onChange={upd('sector')}>
          <option value="">Select sector / function</option>
          {['Nuclear', 'Marine', 'Land', 'Aviation', 'Corporate / Group', 'Digital / IT', 'Finance', 'HR', 'Procurement', 'Other'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </F>
    </div>
  );
}

function Section2({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });

  const benefitOptions = [
    { value: 'overhead-efficiency', label: 'Overhead efficiency', desc: 'Reduces overheads, eliminates duplication, improves productivity' },
    { value: 'gross-margin', label: 'Gross margin', desc: 'Increases revenue, improves margin, reduces cost of delivery' },
    { value: 'both', label: 'Both', desc: 'Delivers overhead efficiency and gross margin improvement' },
    { value: 'neither', label: 'Neither', desc: 'Primary benefit is elsewhere — explain in non-financial benefits' },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionHeader n={2} title="Investment & delivery" sub="Provide financial details and describe how the initiative will be delivered." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <F label="Total investment estimate" req hint="Include all costs — technology, implementation, change, run costs.">
          <input className={inp} value={form.investmentEstimate} onChange={upd('investmentEstimate')} placeholder="e.g. £500k total (£300k capex, £200k opex p.a.)" />
        </F>
        <F label="Funding status" hint="Is funding confirmed or subject to approval?">
          <input className={inp} value={form.fundingStatus} onChange={upd('fundingStatus')} placeholder="e.g. Confirmed within sector budget" />
        </F>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <F label="Financial benefits" req hint="Quantify where possible.">
          <textarea className={ta} rows={3} value={form.financialBenefits} onChange={upd('financialBenefits')} placeholder="e.g. £180k annual saving from process automation..." />
        </F>
        <F label="Non-financial benefits" hint="Strategic or qualitative benefits.">
          <textarea className={ta} rows={3} value={form.nonFinancialBenefits} onChange={upd('nonFinancialBenefits')} placeholder="e.g. Improved data quality, reduced compliance risk..." />
        </F>
      </div>
      <F label="Primary benefit type" req>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {benefitOptions.map(opt => (
            <button key={opt.value} onClick={() => dispatch({ type: 'UPDATE', field: 'benefitType', value: opt.value })}
              className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                ${form.benefitType === opt.value ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'}`}>
              <p className={`font-semibold text-sm ${form.benefitType === opt.value ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </F>
      <F label="Delivery approach" req hint="High-level plan — phases, milestones, approach.">
        <textarea className={ta} rows={3} value={form.deliveryApproach} onChange={upd('deliveryApproach')} placeholder="e.g. Phase 1: Discovery Q1, Phase 2: Build Q2–Q3, Phase 3: Rollout Q4..." />
      </F>
      <F label="Expected timeline" hint="Overall duration and key dates.">
        <input className={inp} value={form.expectedTimeline} onChange={upd('expectedTimeline')} placeholder="e.g. 12 months, starting Q2 2025" />
      </F>
      <F label="KPIs and success measures" req hint="How will success be measured?">
        <textarea className={ta} rows={2} value={form.kpis} onChange={upd('kpis')} placeholder="e.g. Processing time -60%, error rate <2%, user adoption >85%..." />
      </F>
    </div>
  );
}

function Section3({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });

  const reviewWindows = [
    { value: 'q1', label: 'Q1 — January review' },
    { value: 'q2', label: 'Q2 — April review' },
    { value: 'q3', label: 'Q3 — July review' },
    { value: 'q4', label: 'Q4 — October review' },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionHeader n={3} title="Sponsor & governance" sub="Confirm executive sponsorship and readiness for TPMO quarterly review." />
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
        <p className="font-semibold mb-1">Quarterly review cadence</p>
        <p>The TPMO reviews Global Transformation initiatives quarterly with the ELT. Not all initiatives will progress in each cycle. Where an initiative is not progressed, the outcome will be communicated clearly with reasoning.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <F label="Executive sponsor name" req>
          <input className={inp} value={form.executiveSponsorName} onChange={upd('executiveSponsorName')} placeholder="Full name" />
        </F>
        <F label="Executive sponsor role" req>
          <input className={inp} value={form.executiveSponsorRole} onChange={upd('executiveSponsorRole')} placeholder="e.g. Chief Operating Officer" />
        </F>
      </div>
      <div className="space-y-3">
        <CheckButton checked={form.sponsorEndorsed} onClick={() => dispatch({ type: 'UPDATE', field: 'sponsorEndorsed', value: !form.sponsorEndorsed })}>
          <strong>{form.executiveSponsorName || 'The named executive sponsor'}</strong> has reviewed this submission and endorses its progression to the TPMO quarterly review.
        </CheckButton>
        <CheckButton checked={form.pidAttached} onClick={() => dispatch({ type: 'UPDATE', field: 'pidAttached', value: !form.pidAttached })}>
          A Project Initiation Document (PID) or early-stage business case exists and has been signed off. I understand this must be available to the TPMO on request.
        </CheckButton>
      </div>
      <F label="Preferred review window" hint="Select the next quarterly review window you are targeting.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
          {reviewWindows.map(w => (
            <button key={w.value} onClick={() => dispatch({ type: 'UPDATE', field: 'reviewWindowPreference', value: w.value })}
              className={`text-center p-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                ${form.reviewWindowPreference === w.value ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'}`}>
              <p className={`font-semibold text-sm ${form.reviewWindowPreference === w.value ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>{w.label}</p>
            </button>
          ))}
        </div>
      </F>
      <F label="Additional context for the TPMO" hint="Anything that would help the TPMO assess or prioritise this initiative.">
        <textarea className={ta} rows={3} value={form.additionalContext} onChange={upd('additionalContext')} placeholder="e.g. Time-sensitive due to contract renewal; linked to regulatory obligation..." />
      </F>
    </div>
  );
}

function OutcomeScreen({ form }: { form: FormData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-2xl border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/10 p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300">Submitted to TPMO pipeline</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed text-sm">
              Your initiative has been submitted to the Global TPMO for quarterly review and ELT prioritisation.
              An automated acknowledgement will be sent to <strong>{TPMO_EMAIL}</strong> confirming receipt and the next review window.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <h3 className="font-bold text-navy dark:text-white">Submission summary</h3>
        <dl className="space-y-0 text-sm divide-y divide-slate-100 dark:divide-slate-700">
          {[
            { label: 'Initiative', value: form.initiativeTitle },
            { label: 'Sector', value: form.sector },
            { label: 'Sponsor', value: `${form.executiveSponsorName} — ${form.executiveSponsorRole}` },
            { label: 'Investment', value: form.investmentEstimate },
            { label: 'Benefit type', value: form.benefitType.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()) },
            { label: 'Target review', value: form.reviewWindowPreference.toUpperCase() || 'Not specified' },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 py-2.5">
              <dt className="w-32 shrink-0 text-slate-500 dark:text-slate-400 font-medium">{label}</dt>
              <dd className="text-slate-900 dark:text-white">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-navy dark:bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-teal-light text-lg">What happens next</h3>
        <ol className="space-y-3 list-decimal pl-5 text-slate-200 text-sm">
          <li>Your submission is routed to the Global Transformation Queue in Remedy and ingested into the Data Warehouse daily.</li>
          <li>The TPMO will assess your initiative for readiness, strategic alignment, benefits and risks ahead of the quarterly ELT review.</li>
          <li>You will be notified of the outcome — progression or closure — with clear reasoning after the review.</li>
          <li>If progressed, the TPMO will engage you directly to agree next steps and delivery governance.</li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-95">
          Return to home
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Print / save record
        </button>
      </div>
    </motion.div>
  );
}

// ─── Progress & nav ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<number, string> = { 1: 'Overview', 2: 'Investment', 3: 'Governance' };

function ProgressBar({ stage }: { stage: Stage }) {
  if (stage === 'outcome') return null;
  const steps = [1, 2, 3] as const;
  const cur = stage as number;
  const pct = Math.round(((cur - 1) / (steps.length - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map(s => {
          const done = s < cur; const active = s === cur;
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors
                ${done ? 'bg-purple-600 text-white' : active ? 'bg-navy text-teal-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {done ? '✓' : s}
              </div>
              <span className={`text-xs hidden sm:block ${active ? 'text-navy dark:text-white font-semibold' : 'text-slate-400'}`}>{STEP_LABELS[s]}</span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div className="h-full bg-purple-600 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
}

function NavButtons({ stage, form, dispatch }: { stage: Stage; form: FormData; dispatch: React.Dispatch<Action> }) {
  if (stage === 'outcome') return null;
  const ready = canAdvance(stage, form);
  const isLast = stage === 3;
  return (
    <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
      {stage !== 1
        ? <button onClick={() => dispatch({ type: 'PREV' })} className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">← Back</button>
        : <div />}
      <button onClick={() => dispatch({ type: isLast ? 'SUBMIT' : 'NEXT' })} disabled={!ready}
        className={`inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-95
          ${ready ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}>
        {isLast ? 'Submit to TPMO →' : 'Continue →'}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TPMOPage() {
  const [state, dispatch] = useReducer(reducer, { stage: 1, form: EMPTY });
  const { stage, form } = state;

  useEffect(() => {
    const saved = sessionStorage.getItem('onebridge-submission-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        dispatch({ type: 'UPDATE', field: 'initiativeTitle', value: data.initiativeTitle || '' });
        dispatch({ type: 'UPDATE', field: 'initiativeOverview', value: data.initiativeOverview || '' });
        dispatch({ type: 'UPDATE', field: 'strategicPriorities', value: data.strategicPriorities || '' });
        dispatch({ type: 'UPDATE', field: 'scopeAndImpact', value: data.scopeAndBusinessImpact || '' });
        dispatch({ type: 'UPDATE', field: 'sector', value: data.sector || '' });
        dispatch({ type: 'UPDATE', field: 'investmentEstimate', value: data.totalInvestmentEstimate || '' });
        dispatch({ type: 'UPDATE', field: 'financialBenefits', value: data.financialBenefits || '' });
        dispatch({ type: 'UPDATE', field: 'benefitType', value: data.benefitType || '' });
        dispatch({ type: 'UPDATE', field: 'executiveSponsorName', value: data.executiveSponsorName || '' });
        dispatch({ type: 'UPDATE', field: 'executiveSponsorRole', value: data.executiveSponsorRole || '' });
        if (data.sponsorEndorsementConfirmed) dispatch({ type: 'UPDATE', field: 'sponsorEndorsed', value: true });
        if (data.hasPID) dispatch({ type: 'UPDATE', field: 'pidAttached', value: true });
      } catch (e) {
        console.error('Failed to pre-fill TPMO data', e);
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24">
      {stage !== 'outcome' && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            TPMO pipeline
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">Submit to the Global TPMO</h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            For mature IT initiatives that do not involve AI. Your submission will enter the Global TPMO pipeline for quarterly ELT review and prioritisation.
          </p>
        </motion.div>
      )}
      <ProgressBar stage={stage} />
      <AnimatePresence mode="wait">
        <motion.div key={String(stage)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
          className={stage !== 'outcome' ? 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8' : ''}>
          {stage === 1 && <Section1 form={form} dispatch={dispatch} />}
          {stage === 2 && <Section2 form={form} dispatch={dispatch} />}
          {stage === 3 && <Section3 form={form} dispatch={dispatch} />}
          {stage === 'outcome' && <OutcomeScreen form={form} />}
          <NavButtons stage={stage} form={form} dispatch={dispatch} />
        </motion.div>
      </AnimatePresence>
      {stage !== 'outcome' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
          Reference: BAB-ENG-MAN-157 v3.0 · Classification: UNCLASSIFIED · Reviewed quarterly by ELT
        </p>
      )}
    </div>
  );
}
