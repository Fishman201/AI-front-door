'use client';

import { useState, useReducer } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_IT_BP_EMAIL in your .env.local to route notifications to the
// correct IT Business Partner mailbox.
const IT_BP_EMAIL = process.env.NEXT_PUBLIC_IT_BP_EMAIL ?? 'it.businesspartners@babcock.com';

// ─── Maturity gates ───────────────────────────────────────────────────────────
// These are the four criteria an initiative must meet before it can re-enter
// the main routing flow. Each maps to a Gate 3 requirement from slide 7 / slide 9.

interface MaturityGate {
  id: string;
  gate: string;
  title: string;
  description: string;
  guidance: string;
}

const MATURITY_GATES: MaturityGate[] = [
  {
    id: 'gate-scope',
    gate: 'Gate 3 — Scope',
    title: 'Defined scope and business impact',
    description: 'The initiative must have a clear, documented scope — what is included, what is excluded, and which business units or functions will be affected.',
    guidance: 'Work with your IT Business Partner to document the scope. Use the standard scope template in the IS Catalogue.',
  },
  {
    id: 'gate-pid',
    gate: 'Gate 3 — Documentation',
    title: 'Project Initiation Document or business case',
    description: 'A signed-off PID or an early-stage business case must exist. This should include identified benefits, cost estimates, and an outline delivery approach.',
    guidance: 'Contact the IT Engagement team to start a Business Engagement Request. They will help you shape the PID.',
  },
  {
    id: 'gate-sponsor',
    gate: 'Gate 3 — Governance',
    title: 'Named executive sponsor',
    description: 'An executive sponsor at Director level or above must be identified and must have confirmed their support for the initiative progressing.',
    guidance: 'Speak to your sector or functional leadership to identify and confirm a sponsor before submitting.',
  },
  {
    id: 'gate-it',
    gate: 'Gate 3 — Technical',
    title: 'IT engagement confirmed',
    description: 'You must have engaged with the IT team to confirm the technical direction — including architecture, tooling, and any dependencies on existing systems or programmes.',
    guidance: 'Raise a Business Engagement Request via the IS Catalogue to get IT formally engaged.',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  initiativeTitle: string;
  initiativeSummary: string;
  ownerName: string;
  ownerEmail: string;
  sector: string;
  estimatedValue: string;
  gatesCompleted: Record<string, boolean>;
  additionalContext: string;
}

type Stage = 'intro' | 'capture' | 'maturity' | 'outcome';

interface State {
  stage: Stage;
  form: FormData;
}

type Action =
  | { type: 'SET_STAGE'; stage: Stage }
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: string }
  | { type: 'TOGGLE_GATE'; gateId: string }
  | { type: 'RESET' };

const EMPTY_FORM: FormData = {
  initiativeTitle: '',
  initiativeSummary: '',
  ownerName: '',
  ownerEmail: '',
  sector: '',
  estimatedValue: '',
  gatesCompleted: {},
  additionalContext: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.stage };
    case 'UPDATE_FIELD':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'TOGGLE_GATE':
      return {
        ...state,
        form: {
          ...state.form,
          gatesCompleted: {
            ...state.form.gatesCompleted,
            [action.gateId]: !state.form.gatesCompleted[action.gateId],
          },
        },
      };
    case 'RESET':
      return { stage: 'intro', form: EMPTY_FORM };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputClass = `w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  placeholder:text-slate-400 transition-colors`;

const textareaClass = `${inputClass} resize-none`;

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}

function completedGateCount(form: FormData): number {
  return Object.values(form.gatesCompleted).filter(Boolean).length;
}

function canSubmit(form: FormData): boolean {
  return !!(form.initiativeTitle && form.ownerName && form.ownerEmail && form.sector);
}

// ─── Stages ───────────────────────────────────────────────────────────────────

function IntroStage({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300">Your initiative isn't ready for OneBridge yet</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
          OneBridge is for mature initiatives that have passed Gate 3 of the Babcock transformation lifecycle.
          Before you can submit, your initiative needs to reach the right level of definition — with a clear scope,
          an executive sponsor, IT engagement confirmed, and an outline business case.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
          This page will capture the basics, explain what you need to do to get there, and notify your
          IT Business Partner so they can support you through the process.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: '1', label: 'Tell us about your idea', desc: 'A short summary so we can route you to the right support' },
          { step: '2', label: 'Review the maturity gates', desc: 'See exactly what needs to be in place before you can submit' },
          { step: '3', label: 'Get IT Business Partner support', desc: 'We notify them automatically so they can reach out to help' },
        ].map(({ step, label, desc }) => (
          <div key={step} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-navy text-teal-light text-sm font-bold flex items-center justify-center">{step}</div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'capture' })}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
        >
          Start →
        </button>
      </div>
    </motion.div>
  );
}

function CaptureStage({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-full bg-navy text-teal-light flex items-center justify-center font-bold text-sm shrink-0">1</div>
        <div>
          <h2 className="text-xl font-bold text-navy dark:text-white">Tell us about your initiative</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Capture the basics so your IT Business Partner knows what to expect.</p>
        </div>
      </div>

      <Field label="Initiative title" required>
        <input className={inputClass} value={form.initiativeTitle} onChange={upd('initiativeTitle')} placeholder="e.g. Automated invoice processing" />
      </Field>

      <Field label="Brief summary" hint="What problem are you trying to solve? What do you think the solution might look like?">
        <textarea className={textareaClass} rows={4} value={form.initiativeSummary} onChange={upd('initiativeSummary')} placeholder="Describe your idea in plain language — no need for a formal write-up at this stage..." />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Your name" required>
          <input className={inputClass} value={form.ownerName} onChange={upd('ownerName')} placeholder="Full name" />
        </Field>
        <Field label="Your email" required>
          <input className={inputClass} type="email" value={form.ownerEmail} onChange={upd('ownerEmail')} placeholder="name@babcock.com" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Sector or function" required hint="Which part of Babcock does this relate to?">
          <select className={inputClass} value={form.sector} onChange={upd('sector')}>
            <option value="">Select sector / function</option>
            {['Nuclear', 'Marine', 'Land', 'Aviation', 'Corporate / Group', 'Digital / IT', 'Finance', 'HR', 'Procurement', 'Other'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Rough value or saving estimate" hint="Order of magnitude is fine — even a range helps us prioritise support.">
          <input className={inputClass} value={form.estimatedValue} onChange={upd('estimatedValue')} placeholder="e.g. £50k–£200k saving p.a." />
        </Field>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'intro' })}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'maturity' })}
          disabled={!canSubmit(form)}
          className={`inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95
            ${canSubmit(form) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
}

function MaturityStage({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const completed = completedGateCount(form);
  const allDone = completed === MATURITY_GATES.length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-full bg-navy text-teal-light flex items-center justify-center font-bold text-sm shrink-0">2</div>
        <div>
          <h2 className="text-xl font-bold text-navy dark:text-white">Maturity gates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Check off each gate your initiative has already met. Your IT Business Partner will help you close any gaps.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            animate={{ width: `${(completed / MATURITY_GATES.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">{completed} / {MATURITY_GATES.length}</span>
      </div>

      {/* Gates */}
      <div className="space-y-4">
        {MATURITY_GATES.map(gate => {
          const done = !!form.gatesCompleted[gate.id];
          return (
            <div key={gate.id} className={`rounded-xl border-2 transition-all duration-200 overflow-hidden
              ${done ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_GATE', gateId: gate.id })}
                className="w-full text-left p-5 flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${done ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {done && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${done ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {gate.gate}
                    </span>
                  </div>
                  <p className={`font-semibold text-sm ${done ? 'text-blue-800 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>{gate.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{gate.description}</p>
                </div>
              </button>
              <AnimatePresence>
                {!done && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-4 pl-15"
                  >
                    <div className="ml-10 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">How to get there: </span>{gate.guidance}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Field label="Additional context for your IT Business Partner" hint="Anything else that would help them understand your initiative or prioritise support.">
        <textarea
          className={textareaClass}
          rows={3}
          value={form.additionalContext}
          onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'additionalContext', value: e.target.value })}
          placeholder="e.g. This is time-sensitive due to a contract renewal in Q3; we have a preferred vendor in mind..."
        />
      </Field>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal/10 dark:bg-teal/20 border border-teal/40 rounded-xl p-4 text-sm"
        >
          <p className="font-semibold text-teal dark:text-teal-light mb-1">All gates met — you may be ready to re-enter the main flow</p>
          <p className="text-slate-600 dark:text-slate-300">
            If all four gates are genuinely complete, your IT Business Partner can confirm you are ready to return to the routing flow and submit via OneBridge.
          </p>
          <Link href="/prescreen?from=routing" className="inline-flex items-center gap-2 mt-3 text-teal dark:text-teal-light font-semibold text-sm hover:underline">
            Return to routing flow →
          </Link>
        </motion.div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'capture' })}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'outcome' })}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
        >
          Notify IT Business Partner →
        </button>
      </div>
    </motion.div>
  );
}

function OutcomeStage({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const completed = completedGateCount(form);
  const gapCount = MATURITY_GATES.length - completed;
  const gaps = MATURITY_GATES.filter(g => !form.gatesCompleted[g.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Confirmation */}
      <div className="rounded-2xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/10 p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">IT Business Partner notified</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed text-sm">
              Your initiative details have been captured and your IT Business Partner has been notified at <strong>{IT_BP_EMAIL}</strong>. They will reach out to help you develop and mature the initiative.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h3 className="font-bold text-navy dark:text-white">Initiative summary</h3>
        <dl className="space-y-3 text-sm">
          {[
            { label: 'Initiative', value: form.initiativeTitle },
            { label: 'Owner', value: `${form.ownerName} — ${form.ownerEmail}` },
            { label: 'Sector', value: form.sector },
            { label: 'Estimated value', value: form.estimatedValue || 'Not provided' },
            { label: 'Gates met', value: `${completed} of ${MATURITY_GATES.length}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <dt className="w-32 shrink-0 text-slate-500 dark:text-slate-400 font-medium">{label}</dt>
              <dd className="text-slate-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Gaps to close */}
      {gapCount > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-navy dark:text-white">Gates to close before re-submitting</h3>
          <div className="space-y-3">
            {gaps.map(gate => (
              <div key={gate.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{gate.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{gate.guidance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-navy dark:bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-teal-light text-lg">What happens next</h3>
        <ol className="space-y-3 list-decimal pl-5 text-slate-200 text-sm">
          <li>Your IT Business Partner will contact you within 5 working days to discuss your initiative and agree a support plan.</li>
          <li>Together you will work through the {gapCount > 0 ? `${gapCount} remaining gate${gapCount > 1 ? 's' : ''}` : 'final documentation'} to bring the initiative to Gate 3 maturity.</li>
          <li>Once all four gates are met, your IT Business Partner will confirm you are ready to re-enter the routing flow.</li>
          <li>Return to this page or go directly to the routing flow when your initiative is ready.</li>
        </ol>
        <div className="pt-4 border-t border-slate-700/50">
          <Link
            href="/prescreen?from=routing"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95"
          >
            Return to routing flow when ready →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Print / save record
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Start again
        </button>
      </div>
    </motion.div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STAGES: { id: Stage; label: string }[] = [
  { id: 'intro', label: 'Overview' },
  { id: 'capture', label: 'Your idea' },
  { id: 'maturity', label: 'Gates' },
  { id: 'outcome', label: 'Done' },
];

function ProgressBar({ stage }: { stage: Stage }) {
  if (stage === 'outcome') return null;
  const idx = STAGES.findIndex(s => s.id === stage);
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {STAGES.filter(s => s.id !== 'outcome').map((s, i) => {
          const done = i < idx;
          const active = s.id === stage;
          return (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors
                ${done ? 'bg-blue-500 text-white' : active ? 'bg-navy text-teal-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${active ? 'text-navy dark:text-white font-semibold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          animate={{ width: `${(idx / (STAGES.length - 2)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ITPipelinePage() {
  const [state, dispatch] = useReducer(reducer, { stage: 'intro', form: EMPTY_FORM });
  const { stage, form } = state;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24">

      {stage !== 'outcome' && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-2"
        >
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            IT pipeline — early-stage initiatives
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">
            Develop your initiative
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Before an initiative can be submitted to OneBridge it needs to reach Gate 3 maturity.
            We'll capture your idea and connect you with an IT Business Partner to help get it there.
          </p>
        </motion.div>
      )}

      <ProgressBar stage={stage} />

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
          className={stage !== 'outcome' ? 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8' : ''}
        >
          {stage === 'intro'    && <IntroStage dispatch={dispatch} />}
          {stage === 'capture'  && <CaptureStage form={form} dispatch={dispatch} />}
          {stage === 'maturity' && <MaturityStage form={form} dispatch={dispatch} />}
          {stage === 'outcome'  && <OutcomeStage form={form} dispatch={dispatch} />}
        </motion.div>
      </AnimatePresence>

      {stage !== 'outcome' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
          Reference: BAB-ENG-MAN-157 v3.0 · Classification: UNCLASSIFIED
        </p>
      )}
    </div>
  );
}
