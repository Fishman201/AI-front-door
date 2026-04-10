'use client';

import { useReducer, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
const AIDEX_EMAIL = process.env.NEXT_PUBLIC_AIDEX_EMAIL ?? 'aidex@babcock.com';

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskTier = 1 | 2 | 3 | 4 | null;
type Stage = 1 | 2 | 3 | 4 | 'outcome';

interface FormData {
  // Section 1 — Initiative
  initiativeTitle: string;
  initiativeOverview: string;
  whyAI: string;
  sector: string;
  aiTools: string;

  // Section 2 — Data & risk
  dataProfile: string;
  dataSensitivity: 'public-internal' | 'controlled' | 'sensitive' | '';
  decisionInfluence: 'support-only' | 'informs-decisions' | 'determines-outcomes' | '';
  audienceReliance: 'internal-aid' | 'internal-ops' | 'external' | '';
  autonomyLevel: 'content-for-review' | 'bounded-actions' | 'autonomous-actions' | '';
  domainSensitivity: 'no-trigger' | 'operationally-relevant' | 'restricted-domain' | '';

  // Section 3 — Delivery
  deliveryApproach: string;
  supplierDetails: string;
  monitoringPlan: string;
  humanOversightDesign: string;
  kpis: string;

  // Section 4 — Governance
  executiveSponsorName: string;
  executiveSponsorRole: string;
  sponsorEndorsed: boolean;
  pidAttached: boolean;
  aidexEarlyEngagement: boolean;
  additionalContext: string;

  // Derived
  riskTier: RiskTier;
}

interface State {
  stage: Stage;
  form: FormData;
}

type Action =
  | { type: 'UPDATE'; field: keyof FormData; value: string | boolean | number | null }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const EMPTY: FormData = {
  initiativeTitle: '', initiativeOverview: '', whyAI: '', sector: '', aiTools: '',
  dataProfile: '', dataSensitivity: '', decisionInfluence: '', audienceReliance: '',
  autonomyLevel: '', domainSensitivity: '',
  deliveryApproach: '', supplierDetails: '', monitoringPlan: '', humanOversightDesign: '', kpis: '',
  executiveSponsorName: '', executiveSponsorRole: '',
  sponsorEndorsed: false, pidAttached: false, aidexEarlyEngagement: false,
  additionalContext: '',
  riskTier: null,
};

const STAGES: Stage[] = [1, 2, 3, 4, 'outcome'];

function nextStage(s: Stage): Stage { const i = STAGES.indexOf(s); return STAGES[Math.min(i + 1, STAGES.length - 1)]; }
function prevStage(s: Stage): Stage { const i = STAGES.indexOf(s); return STAGES[Math.max(i - 1, 0)]; }

// ─── Risk tier calculation (mirrors lib/classify.ts logic) ────────────────────────

function calcTier(form: FormData): RiskTier {
  if (!form.dataSensitivity || !form.decisionInfluence || !form.audienceReliance || !form.autonomyLevel || !form.domainSensitivity) {
    return null;
  }

  const scores = [
    { 'public-internal': 1, controlled: 2, sensitive: 3 }[form.dataSensitivity] || 0,
    { 'support-only': 1, 'informs-decisions': 2, 'determines-outcomes': 3 }[form.decisionInfluence] || 0,
    { 'internal-aid': 1, 'internal-ops': 2, external: 3 }[form.audienceReliance] || 0,
    { 'content-for-review': 1, 'bounded-actions': 2, 'autonomous-actions': 3 }[form.autonomyLevel] || 0,
    { 'no-trigger': 1, 'operationally-relevant': 2, 'restricted-domain': 3 }[form.domainSensitivity] || 0,
  ];
  const max = Math.max(...scores);
  if (max === 3) {
    if (scores[4] === 3 && (scores[1] === 3 || scores[3] === 3)) return 4;
    return 3;
  }
  if (max === 2) return 2;
  if (scores.every(s => s <= 1 && s > 0)) return 1;
  return null;
}

function canAdvance(stage: Stage, form: FormData): boolean {
  if (stage === 1) return !!(form.initiativeTitle && form.initiativeOverview && form.whyAI && form.sector);
  if (stage === 2) return !!(form.dataSensitivity && form.decisionInfluence && form.audienceReliance && form.autonomyLevel && form.domainSensitivity);
  if (stage === 3) return !!(form.deliveryApproach && form.humanOversightDesign && form.kpis);
  if (stage === 4) return !!(form.executiveSponsorName && form.executiveSponsorRole && form.sponsorEndorsed && form.pidAttached);
  return true;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE': {
      const updated = { ...state.form, [action.field]: action.value };
      return { ...state, form: { ...updated, riskTier: calcTier(updated) } };
    }
    case 'NEXT': return { ...state, stage: nextStage(state.stage) };
    case 'PREV': return { ...state, stage: prevStage(state.stage) };
    case 'SUBMIT': return { ...state, stage: 'outcome' };
    case 'RESET': return { stage: 1, form: EMPTY };
    default: return state;
  }
}

// ─── Shared components ────────────────────────────────────────────────────────

const inp = `w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
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

function SH({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
      <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
      <div>
        <h2 className="text-xl font-bold text-navy dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function FactorSelect({ label, hint, field, value, options, dispatch }: {
  label: string; hint?: string; field: keyof FormData;
  value: string; options: { value: string; label: string; desc: string }[];
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <F label={label} hint={hint} req>
      <div className="space-y-2 mt-1">
        {options.map(opt => (
          <button key={opt.value} onClick={() => dispatch({ type: 'UPDATE', field, value: opt.value })}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
              ${value === opt.value ? 'border-teal bg-teal/10 dark:bg-teal/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/40'}`}>
            <p className={`font-semibold text-sm ${value === opt.value ? 'text-teal dark:text-teal-light' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </F>
  );
}

function CheckButton({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-start gap-3 w-full text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
        ${checked ? 'border-teal bg-teal/10 dark:bg-teal/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/40'}`}>
      <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
        ${checked ? 'bg-teal border-teal' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300">{children}</span>
    </button>
  );
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: RiskTier }) {
  if (!tier) return null;
  const map = {
    1: { label: 'Tier 1 — Limited', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' },
    2: { label: 'Tier 2 — Moderate', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
    3: { label: 'Tier 3 — High', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
    4: { label: 'Tier 4 — Critical', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700' },
  };
  const { label, cls } = map[tier];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${cls}`}>
      Indicative risk classification: {label}
    </motion.div>
  );
}

// ─── Form sections ────────────────────────────────────────────────────────────

function Section1({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });
  return (
    <div className="space-y-6">
      <SH n={1} title="Initiative overview" sub="Describe the AI initiative and why AI is the right approach." />
      <div className="bg-teal/10 dark:bg-teal/20 border border-teal/30 rounded-xl p-4 text-sm text-teal-800 dark:text-teal-200">
        <p className="font-semibold mb-1">AI initiatives — mandatory governance</p>
        <p>All initiatives involving AI, ML, or Generative AI must be reviewed by the AI Steering Committee. No AI initiative may progress beyond Gate 7 (Execute) without approval.</p>
      </div>
      <F label="Initiative title" req>
        <input className={inp} value={form.initiativeTitle} onChange={upd('initiativeTitle')} placeholder="e.g. AI-assisted maintenance scheduling" />
      </F>
      <F label="Initiative overview" req hint="What will this AI system do? What problem does it solve?">
        <textarea className={ta} rows={4} value={form.initiativeOverview} onChange={upd('initiativeOverview')} placeholder="Describe what the AI does, the inputs it receives, and the outputs it produces..." />
      </F>
      <F label="Why AI?" req hint="Why is AI better than a manual or conventional approach for this problem? This is required by the governance manual (Section 3.3).">
        <textarea className={ta} rows={3} value={form.whyAI} onChange={upd('whyAI')} placeholder="Explain the clear problem and why AI outperforms manual or rule-based alternatives..." />
      </F>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <F label="Sector / function" req>
          <select className={inp} value={form.sector} onChange={upd('sector')}>
            <option value="">Select sector / function</option>
            {['Nuclear', 'Marine', 'Land', 'Aviation', 'Corporate / Group', 'Digital / IT', 'Finance', 'HR', 'Procurement', 'Other'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </F>
        <F label="AI tools or platforms involved" hint="Name the AI model, service, or platform being used.">
          <input className={inp} value={form.aiTools} onChange={upd('aiTools')} placeholder="e.g. Azure OpenAI, Microsoft Copilot, in-house ML model..." />
        </F>
      </div>
    </div>
  );
}

function Section2({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="space-y-8">
      <SH n={2} title="Risk classification" sub="Answer each factor to generate your indicative risk tier. This mirrors the AI Front Door classification." />

      <AnimatePresence>
        {form.riskTier && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TierBadge tier={form.riskTier} />
          </motion.div>
        )}
      </AnimatePresence>

      <FactorSelect label="Data sensitivity" hint="What kind of information will this AI handle?" field="dataSensitivity" value={form.dataSensitivity} dispatch={dispatch}
        options={[
          { value: 'public-internal', label: 'Public or ordinary internal data', desc: 'No special sensitivity — general business information' },
          { value: 'controlled', label: 'Controlled internal information', desc: 'Limited sensitivity — internal use, access restricted' },
          { value: 'sensitive', label: 'Personal, classified, or legally sensitive data', desc: 'Personal data, special category, export-controlled, legally privileged' },
        ]} />

      <FactorSelect label="Decision influence" hint="How much influence will the AI have on decisions or outcomes?" field="decisionInfluence" value={form.decisionInfluence} dispatch={dispatch}
        options={[
          { value: 'support-only', label: 'Drafting, research, or admin support only', desc: 'Human always decides — AI only suggests or drafts' },
          { value: 'informs-decisions', label: 'Supports internal decisions', desc: 'AI informs but does not decide or act autonomously' },
          { value: 'determines-outcomes', label: 'Materially shapes or determines outcomes', desc: 'Operational, customer, workforce, safety, legal, or financial outcomes' },
        ]} />

      <FactorSelect label="Audience and reliance" hint="Who will use or rely on the AI's outputs?" field="audienceReliance" value={form.audienceReliance} dispatch={dispatch}
        options={[
          { value: 'internal-aid', label: 'Internal working aid — immediate team only', desc: 'Outputs stay within a small working group' },
          { value: 'internal-ops', label: 'Internal operational teams rely on it', desc: 'Wider business depends on the AI output for their work' },
          { value: 'external', label: 'Customer-facing or externally relied upon', desc: 'Customers or external parties see or depend on the output' },
        ]} />

      <FactorSelect label="Autonomy and action" hint="What can the AI system actually do?" field="autonomyLevel" value={form.autonomyLevel} dispatch={dispatch}
        options={[
          { value: 'content-for-review', label: 'Generates content for human review', desc: 'All outputs reviewed by a human before any action is taken' },
          { value: 'bounded-actions', label: 'Can recommend or trigger bounded steps', desc: 'Limited automation with human checkpoints in place' },
          { value: 'autonomous-actions', label: 'Can act on systems autonomously', desc: 'Sends communications, changes data, or self-initiates actions' },
        ]} />

      <FactorSelect label="Domain sensitivity" hint="Does this involve a specialist or regulated domain?" field="domainSensitivity" value={form.domainSensitivity} dispatch={dispatch}
        options={[
          { value: 'no-trigger', label: 'No — standard business domain', desc: 'No special regulatory or safety considerations' },
          { value: 'operationally-relevant', label: 'Operationally relevant', desc: 'Relevant to operations but not restricted or regulated' },
          { value: 'restricted-domain', label: 'Safety-critical, defence, or regulated domain', desc: 'Security-sensitive, workforce decisioning, or mission-relevant' },
        ]} />
    </div>
  );
}

function Section3({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });
  return (
    <div className="space-y-6">
      <SH n={3} title="Delivery & oversight" sub="Describe how the AI will be built, validated, and monitored." />
      <F label="Delivery approach" req hint="How will this AI initiative be built and deployed? Include phasing and key milestones.">
        <textarea className={ta} rows={3} value={form.deliveryApproach} onChange={upd('deliveryApproach')} placeholder="e.g. Phase 1: Proof of concept (internal, Q1). Phase 2: Pilot (Q2). Phase 3: Production rollout (Q3–Q4)..." />
      </F>
      <F label="Supplier and model details" hint="Who supplies the AI? Where is it hosted? What are the contractual data protections?">
        <textarea className={ta} rows={3} value={form.supplierDetails} onChange={upd('supplierDetails')} placeholder="e.g. Microsoft Azure OpenAI — hosted in UK West — DPA in place — no training on Babcock data..." />
      </F>
      <F label="Human oversight design" req hint="How will humans remain in control? What review and challenge mechanisms exist?">
        <textarea className={ta} rows={3} value={form.humanOversightDesign} onChange={upd('humanOversightDesign')} placeholder="e.g. All outputs reviewed by qualified engineer before action. Escalation path defined. Manual override available at all times..." />
      </F>
      <F label="Operational monitoring plan" hint="How will the AI be monitored in production? Who owns ongoing oversight?">
        <textarea className={ta} rows={3} value={form.monitoringPlan} onChange={upd('monitoringPlan')} placeholder="e.g. Monthly accuracy reviews by data team. Incident log maintained. Quarterly review by AI owner..." />
      </F>
      <F label="KPIs and success measures" req hint="How will you know the AI is performing as intended?">
        <textarea className={ta} rows={2} value={form.kpis} onChange={upd('kpis')} placeholder="e.g. Accuracy >95%, false positive rate <3%, user adoption >80%, zero critical incidents in first 6 months..." />
      </F>
    </div>
  );
}

function Section4({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'UPDATE', field: f, value: e.target.value });
  return (
    <div className="space-y-6">
      <SH n={4} title="Governance & sponsor" sub="Confirm executive sponsorship and AIDEX engagement." />
      {form.riskTier && form.riskTier >= 3 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 text-sm text-red-800 dark:text-red-300">
          <p className="font-semibold mb-1">High / Critical risk — enhanced evidence required</p>
          <p>Based on your risk classification (Tier {form.riskTier}), this initiative requires an AI Audit Pack, supplier evidence, operational monitoring plan, and specialist reviews before the AI Steering Committee can approve it.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <F label="Executive sponsor name" req>
          <input className={inp} value={form.executiveSponsorName} onChange={upd('executiveSponsorName')} placeholder="Full name" />
        </F>
        <F label="Executive sponsor role" req>
          <input className={inp} value={form.executiveSponsorRole} onChange={upd('executiveSponsorRole')} placeholder="e.g. Chief Digital Officer" />
        </F>
      </div>
      <div className="space-y-3">
        <CheckButton checked={form.sponsorEndorsed} onClick={() => dispatch({ type: 'UPDATE', field: 'sponsorEndorsed', value: !form.sponsorEndorsed })}>
          <strong>{form.executiveSponsorName || 'The named executive sponsor'}</strong> has reviewed this submission and endorses its progression to the AI Steering Committee.
        </CheckButton>
        <CheckButton checked={form.pidAttached} onClick={() => dispatch({ type: 'UPDATE', field: 'pidAttached', value: !form.pidAttached })}>
          A Project Initiation Document (PID) or early-stage business case exists. I understand this must be available to AIDEX and the AI Steering Committee on request.
        </CheckButton>
        <CheckButton checked={form.aidexEarlyEngagement} onClick={() => dispatch({ type: 'UPDATE', field: 'aidexEarlyEngagement', value: !form.aidexEarlyEngagement })}>
          I have engaged with AIDEX early — before this formal submission — to get an initial steer on the approval route and evidence requirements.
        </CheckButton>
      </div>
      <F label="Additional context for AIDEX" hint="Anything else that would help AIDEX or the AI Steering Committee assess this initiative.">
        <textarea className={ta} rows={3} value={form.additionalContext} onChange={upd('additionalContext')} placeholder="e.g. Previous proof of concept results; regulatory pre-engagement; time-sensitive deployment window..." />
      </F>
    </div>
  );
}

// ─── Outcome ──────────────────────────────────────────────────────────────────

function OutcomeScreen({ form }: { form: FormData }) {
  const tier = form.riskTier;
  const tierInfo = tier ? {
    1: { label: 'Tier 1 — Limited risk', pathway: 'Pathway A — Local Business Control', cls: 'border-green-400 bg-green-50 dark:bg-green-900/10', text: 'text-green-800 dark:text-green-300' },
    2: { label: 'Tier 2 — Moderate risk', pathway: 'Pathway B — Business and Risk Review', cls: 'border-amber-400 bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-800 dark:text-amber-300' },
    3: { label: 'Tier 3 — High risk', pathway: 'Pathway C — EPT Governance Review', cls: 'border-orange-400 bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-800 dark:text-orange-300' },
    4: { label: 'Tier 4 — Critical risk', pathway: 'Pathway D — Final Written Approval', cls: 'border-red-400 bg-red-50 dark:bg-red-900/10', text: 'text-red-800 dark:text-red-300' },
  }[tier] : null;

  const nextSteps: Record<number, string[]> = {
    1: ['Complete the "Why AI?" assessment form.', 'Get local business owner approval.', 'Begin with standard controls.'],
    2: ['Document your classification and complete the risk review.', 'Get business owner and risk owner sign-off.', 'Obtain specialist concurrence where triggered.', 'Proceed with agreed controls.'],
    3: ['Contact AIDEX via the intake route immediately.', 'Prepare the AI Audit Pack.', 'Undergo AIDEX governance review.', 'Obtain all required specialist approvals.', 'Proceed with agreed controls and monitoring.'],
    4: ['Contact AIDEX immediately.', 'Prepare enhanced evidence and assurance case.', 'Undergo AIDEX governance review.', 'Complete all specialist reviews.', 'Obtain designated final written approval.', 'Proceed with strengthened controls and monitoring.'],
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Route verdict */}
      <div className={`rounded-2xl border-2 p-8 space-y-4 ${tierInfo?.cls ?? 'border-teal bg-teal/5'}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${tierInfo?.text ?? 'text-teal dark:text-teal-light'}`}>
              Submitted to AIDEX pipeline
            </h2>
            {tierInfo && (
              <div className="mt-2 space-y-1">
                <p className={`font-semibold text-sm ${tierInfo.text}`}>{tierInfo.label} · {tierInfo.pathway}</p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Your submission has been routed to the AI Steering Committee queue. AIDEX has been notified at <strong>{AIDEX_EMAIL}</strong>. An automated acknowledgement will confirm the review timeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <h3 className="font-bold text-navy dark:text-white">Submission summary</h3>
        <dl className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
          {[
            { label: 'Initiative', value: form.initiativeTitle },
            { label: 'Sector', value: form.sector },
            { label: 'AI tools', value: form.aiTools || 'Not specified' },
            { label: 'Sponsor', value: `${form.executiveSponsorName} — ${form.executiveSponsorRole}` },
            { label: 'Risk tier', value: tier ? `Tier ${tier}` : 'Not calculated' },
            { label: 'Governance pathway', value: tierInfo?.pathway ?? '—' },
            { label: 'AIDEX early engagement', value: form.aidexEarlyEngagement ? 'Yes' : 'Not yet' },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 py-2.5">
              <dt className="w-40 shrink-0 text-slate-500 dark:text-slate-400 font-medium">{label}</dt>
              <dd className="text-slate-900 dark:text-white">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Next steps */}
      <div className="bg-navy dark:bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-teal-light text-lg">What happens next</h3>
        <ol className="space-y-3 list-decimal pl-5 text-slate-200 text-sm">
          {tier && nextSteps[tier].map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        {!form.aidexEarlyEngagement && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm text-amber-300">
            You indicated you haven't engaged AIDEX yet. Contact them early — before the formal review — to get an initial steer and avoid delays.
          </div>
        )}
      </div>

      {/* AIDEX contact */}
      <div className="bg-teal dark:bg-teal-900 text-white rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-lg">Contact AIDEX</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-teal-light text-xs font-bold uppercase mb-1">Email</p><a href={`mailto:${AIDEX_EMAIL}`} className="underline">{AIDEX_EMAIL}</a></div>
          <div><p className="text-teal-light text-xs font-bold uppercase mb-1">Teams</p><a href="#" className="underline">AIDEX channel</a></div>
          <div><p className="text-teal-light text-xs font-bold uppercase mb-1">Intake form</p><a href="#" className="underline">AI Intake Form</a></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/" className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95">
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

const LABELS: Record<number, string> = { 1: 'Overview', 2: 'Risk', 3: 'Delivery', 4: 'Governance' };

function ProgressBar({ stage, tier }: { stage: Stage; tier: RiskTier }) {
  if (stage === 'outcome') return null;
  const steps = [1, 2, 3, 4] as const;
  const cur = stage as number;
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2 items-start">
        <div className="flex flex-1 justify-between">
          {steps.map(s => {
            const done = s < cur; const active = s === cur;
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors
                  ${done ? 'bg-teal text-white' : active ? 'bg-navy text-teal-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  {done ? '✓' : s}
                </div>
                <span className={`text-xs hidden sm:block ${active ? 'text-navy dark:text-white font-semibold' : 'text-slate-400'}`}>{LABELS[s]}</span>
              </div>
            );
          })}
        </div>
        {tier && <div className="ml-4 shrink-0"><TierBadge tier={tier} /></div>}
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div className="h-full bg-teal rounded-full" animate={{ width: `${((cur - 1) / 3) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
}

function NavButtons({ stage, form, dispatch }: { stage: Stage; form: FormData; dispatch: React.Dispatch<Action> }) {
  if (stage === 'outcome') return null;
  const ready = canAdvance(stage, form);
  const isLast = stage === 4;
  return (
    <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
      {stage !== 1
        ? <button onClick={() => dispatch({ type: 'PREV' })} className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">← Back</button>
        : <div />}
      <button onClick={() => dispatch({ type: isLast ? 'SUBMIT' : 'NEXT' })} disabled={!ready}
        className={`inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95
          ${ready ? 'bg-teal hover:bg-teal-light text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}>
        {isLast ? 'Submit to AIDEX →' : 'Continue →'}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIDEXPage() {
  const [state, dispatch] = useReducer(reducer, { stage: 1, form: EMPTY });
  const { stage, form } = state;

  useEffect(() => {
    const saved = sessionStorage.getItem('onebridge-submission-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        dispatch({ type: 'UPDATE', field: 'initiativeTitle', value: data.initiativeTitle || '' });
        dispatch({ type: 'UPDATE', field: 'initiativeOverview', value: data.initiativeOverview || '' });
        dispatch({ type: 'UPDATE', field: 'sector', value: data.sector || '' });
        dispatch({ type: 'UPDATE', field: 'executiveSponsorName', value: data.executiveSponsorName || '' });
        dispatch({ type: 'UPDATE', field: 'executiveSponsorRole', value: data.executiveSponsorRole || '' });
        if (data.sponsorEndorsementConfirmed) dispatch({ type: 'UPDATE', field: 'sponsorEndorsed', value: true });
        if (data.hasPID) dispatch({ type: 'UPDATE', field: 'pidAttached', value: true });
      } catch (e) {
        console.error('Failed to pre-fill AIDEX data', e);
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24">
      {stage !== 'outcome' && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            AIDEX pipeline — AI initiatives
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">
            Submit to the AI Steering Committee
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            For all initiatives involving AI, ML, or Generative AI. Your submission will be reviewed by AIDEX and the AI Steering Committee before any initiative progresses beyond Gate 7.
          </p>
        </motion.div>
      )}
      <ProgressBar stage={stage} tier={form.riskTier} />
      <AnimatePresence mode="wait">
        <motion.div key={String(stage)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
          className={stage !== 'outcome' ? 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8' : ''}>
          {stage === 1 && <Section1 form={form} dispatch={dispatch} />}
          {stage === 2 && <Section2 form={form} dispatch={dispatch} />}
          {stage === 3 && <Section3 form={form} dispatch={dispatch} />}
          {stage === 4 && <Section4 form={form} dispatch={dispatch} />}
          {stage === 'outcome' && <OutcomeScreen form={form} />}
          <NavButtons stage={stage} form={form} dispatch={dispatch} />
        </motion.div>
      </AnimatePresence>
      {stage !== 'outcome' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
          Reference: BAB-ENG-MAN-157 v3.0 · Classification: UNCLASSIFIED · Reviewed by AI Steering Committee
        </p>
      )}
    </div>
  );
}
