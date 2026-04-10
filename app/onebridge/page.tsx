'use client';

import { useReducer } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type BenefitType = 'overhead-efficiency' | 'gross-margin' | 'both' | 'neither' | '';

interface FormData {
  // Section 1 — Initiative overview
  initiativeTitle: string;
  initiativeOverview: string;
  strategicPriorities: string;
  operationalTechnologyImpact: string;
  scopeAndBusinessImpact: string;
  scopeLevel: 'global' | 'sector' | 'local' | '';

  // Section 2 — Investment & benefits
  totalInvestmentEstimate: string;
  fundingAvailability: string;
  irrNpvRoi: string;
  financialBenefits: string;
  nonFinancialBenefits: string;
  benefitType: BenefitType;

  // Section 3 — Complexity, risk & change
  regulatoryEthicalCyberRisks: string;
  operationalDisruptionRisk: string;
  changeManagementImpact: string;
  dependencies: string;
  deliveryRisk: string;

  // Section 4 — Delivery & outcomes
  deliveryPlan: string;
  roadmapSummary: string;
  businessCaseSummary: string;
  deliverablesDurationPhasing: string;
  kpisLongTermRoi: string;

  // Section 5 — Sponsor & governance
  executiveSponsorName: string;
  executiveSponsorRole: string;
  sponsorEndorsementConfirmed: boolean;
  hasPassedGate3: boolean;
  hasPID: boolean;

  // AI decision gate
  involvesAI: 'yes' | 'no' | '';
}

type Section = 1 | 2 | 3 | 4 | 5 | 'gate' | 'outcome';

interface State {
  currentSection: Section;
  form: FormData;
  route: 'ai-steering' | 'tpmo' | 'rejected' | null;
  rejectionReason: string;
  submitted: boolean;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: string | boolean }
  | { type: 'NEXT_SECTION' }
  | { type: 'PREV_SECTION' }
  | { type: 'SET_ROUTE'; route: 'ai-steering' | 'tpmo' | 'rejected'; reason?: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const EMPTY_FORM: FormData = {
  initiativeTitle: '', initiativeOverview: '', strategicPriorities: '',
  operationalTechnologyImpact: '', scopeAndBusinessImpact: '', scopeLevel: '',
  totalInvestmentEstimate: '', fundingAvailability: '', irrNpvRoi: '',
  financialBenefits: '', nonFinancialBenefits: '', benefitType: '',
  regulatoryEthicalCyberRisks: '', operationalDisruptionRisk: '',
  changeManagementImpact: '', dependencies: '', deliveryRisk: '',
  deliveryPlan: '', roadmapSummary: '', businessCaseSummary: '',
  deliverablesDurationPhasing: '', kpisLongTermRoi: '',
  executiveSponsorName: '', executiveSponsorRole: '',
  sponsorEndorsementConfirmed: false, hasPassedGate3: false, hasPID: false,
  involvesAI: '',
};

const SECTION_ORDER: Section[] = [1, 2, 3, 4, 5, 'gate', 'outcome'];

function nextSection(current: Section): Section {
  const idx = SECTION_ORDER.indexOf(current);
  return SECTION_ORDER[Math.min(idx + 1, SECTION_ORDER.length - 1)];
}

function prevSection(current: Section): Section {
  const idx = SECTION_ORDER.indexOf(current);
  return SECTION_ORDER[Math.max(idx - 1, 0)];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'NEXT_SECTION':
      return { ...state, currentSection: nextSection(state.currentSection) };
    case 'PREV_SECTION':
      return { ...state, currentSection: prevSection(state.currentSection) };
    case 'SET_ROUTE':
      return { ...state, route: action.route, rejectionReason: action.reason || '', currentSection: 'outcome' };
    case 'SUBMIT':
      return { ...state, submitted: true };
    case 'RESET':
      return { currentSection: 1, form: EMPTY_FORM, route: null, rejectionReason: '', submitted: false };
    default:
      return state;
  }
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const FORM_SECTIONS: Section[] = [1, 2, 3, 4, 5];
const SECTION_LABELS: Record<number, string> = {
  1: 'Overview', 2: 'Investment', 3: 'Risk', 4: 'Delivery', 5: 'Sponsor',
};

function ProgressBar({ current }: { current: Section }) {
  const numericSections = FORM_SECTIONS;
  const currentIdx = typeof current === 'number' ? numericSections.indexOf(current as 1|2|3|4|5) : numericSections.length;
  const pct = Math.round(((currentIdx) / numericSections.length) * 100);

  if (current === 'outcome') return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {numericSections.map((s) => {
          const done = typeof current === 'number' ? (s as number) < (current as number) : true;
          const active = current === s;
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors
                ${done ? 'bg-teal text-white' : active ? 'bg-navy text-teal-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {done ? '✓' : s}
              </div>
              <span className={`text-xs hidden sm:block ${active ? 'text-navy dark:text-white font-semibold' : 'text-slate-400'}`}>
                {SECTION_LABELS[s as number]}
              </span>
            </div>
          );
        })}
        {/* Gate step */}
        <div className="flex flex-col items-center flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors
            ${current === 'gate' ? 'bg-navy text-teal-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
            ⚡
          </div>
          <span className={`text-xs hidden sm:block ${current === 'gate' ? 'text-navy dark:text-white font-semibold' : 'text-slate-400'}`}>
            AI gate
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal rounded-full"
          animate={{ width: current === 'gate' ? '100%' : `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────

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

const inputClass = `w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
  placeholder:text-slate-400 transition-colors`;

const textareaClass = `${inputClass} resize-none`;

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className={inputClass} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea className={textareaClass} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

// ─── Section components ───────────────────────────────────────────────────────

function Section1({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (v: string) => dispatch({ type: 'UPDATE_FIELD', field, value: v });
  return (
    <div className="space-y-6">
      <SectionHeader
        number={1}
        title="Initiative overview"
        subtitle="Provide a clear description of what this initiative is and what it aims to achieve."
      />
      <Field label="Initiative title" required>
        <TextInput value={form.initiativeTitle} onChange={upd('initiativeTitle')} placeholder="e.g. Automated maintenance scheduling system" />
      </Field>
      <Field label="Initiative overview" required hint="Describe the initiative in plain language. What problem does it solve? What will it do?">
        <TextArea value={form.initiativeOverview} onChange={upd('initiativeOverview')} rows={4} placeholder="Provide a clear summary of the initiative..." />
      </Field>
      <Field label="Strategic priorities supported" required hint="Which of Babcock's strategic priorities does this initiative support?">
        <TextArea value={form.strategicPriorities} onChange={upd('strategicPriorities')} placeholder="e.g. Operational efficiency, digital transformation..." />
      </Field>
      <Field label="Operational technology impact" hint="Will this initiative affect any operational technology, control systems, or critical infrastructure?">
        <TextArea value={form.operationalTechnologyImpact} onChange={upd('operationalTechnologyImpact')} placeholder="Describe any OT impact, or state 'None identified'..." />
      </Field>
      <Field label="Scope level" required hint="Is this a global enterprise-wide initiative, sector-specific, or local?">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          {(['global', 'sector', 'local'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'scopeLevel', value: opt })}
              className={`capitalize text-center p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
                ${form.scopeLevel === opt
                  ? 'border-teal bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-teal/50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Scope and business impact" required hint="What is in scope? What business units, functions, or sectors will be affected?">
        <TextArea value={form.scopeAndBusinessImpact} onChange={upd('scopeAndBusinessImpact')} rows={4} placeholder="Define the scope and expected business impact..." />
      </Field>
    </div>
  );
}

function Section2({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (v: string) => dispatch({ type: 'UPDATE_FIELD', field, value: v });
  const benefitOptions: { value: BenefitType; label: string; desc: string }[] = [
    { value: 'overhead-efficiency', label: 'Overhead efficiency', desc: 'Reduces overheads, eliminates duplicated effort, or improves productivity' },
    { value: 'gross-margin', label: 'Gross margin', desc: 'Increases revenue, improves margin, or reduces cost of delivery' },
    { value: 'both', label: 'Both', desc: 'Delivers both overhead efficiency and gross margin improvement' },
    { value: 'neither', label: 'Neither', desc: 'Primary benefit is elsewhere (explain in non-financial benefits)' },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader
        number={2}
        title="Investment & benefits"
        subtitle="Provide financial details and quantify the expected return on investment."
      />
      <Field label="Total investment estimate" required hint="Include all costs: technology, implementation, change management, and ongoing run costs.">
        <TextInput value={form.totalInvestmentEstimate} onChange={upd('totalInvestmentEstimate')} placeholder="e.g. £250,000 total (£150k capital, £100k ongoing p.a.)" />
      </Field>
      <Field label="Funding availability" required hint="Is funding confirmed, or does it require approval?">
        <TextInput value={form.fundingAvailability} onChange={upd('fundingAvailability')} placeholder="e.g. Confirmed within sector budget / Requires central funding approval" />
      </Field>
      <Field label="IRR, NPV and ROI timeframe" hint="Provide financial return metrics where available. State assumptions clearly.">
        <TextArea value={form.irrNpvRoi} onChange={upd('irrNpvRoi')} placeholder="e.g. NPV £400k over 5 years, IRR 22%, payback in 3 years..." />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Financial benefits" required hint="Quantify financial benefits where possible.">
          <TextArea value={form.financialBenefits} onChange={upd('financialBenefits')} placeholder="e.g. £120k annual cost saving from reduced manual processing..." />
        </Field>
        <Field label="Non-financial benefits" hint="Describe qualitative or strategic benefits.">
          <TextArea value={form.nonFinancialBenefits} onChange={upd('nonFinancialBenefits')} placeholder="e.g. Improved data quality, reduced compliance risk, better staff experience..." />
        </Field>
      </div>
      <Field label="Primary benefit type" required hint="Select the category that best describes the primary benefit this initiative delivers.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {benefitOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'benefitType', value: opt.value })}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
                ${form.benefitType === opt.value
                  ? 'border-teal bg-teal/10 dark:bg-teal/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/50'}`}
            >
              <p className={`font-semibold text-sm ${form.benefitType === opt.value ? 'text-teal dark:text-teal-light' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Section3({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (v: string) => dispatch({ type: 'UPDATE_FIELD', field, value: v });
  return (
    <div className="space-y-6">
      <SectionHeader
        number={3}
        title="Complexity, risk & change"
        subtitle="Identify the key risks and change management requirements associated with this initiative."
      />
      <Field label="Regulatory, ethical and cyber risks" required hint="Describe any regulatory obligations, ethical considerations, data privacy implications, or cybersecurity risks.">
        <TextArea value={form.regulatoryEthicalCyberRisks} onChange={upd('regulatoryEthicalCyberRisks')} rows={4} placeholder="e.g. GDPR implications for personal data processing; export control considerations; no material cyber risk identified..." />
      </Field>
      <Field label="Operational disruption risk" required hint="What is the risk of disruption to existing operations during delivery or go-live?">
        <TextArea value={form.operationalDisruptionRisk} onChange={upd('operationalDisruptionRisk')} placeholder="e.g. Moderate risk during cutover period — mitigation: phased rollout with parallel running..." />
      </Field>
      <Field label="Change management and retraining impact" required hint="What workforce change, training, or communications will be required?">
        <TextArea value={form.changeManagementImpact} onChange={upd('changeManagementImpact')} placeholder="e.g. Training required for approximately 50 users across 3 sites; updated SOPs needed..." />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Dependencies" hint="List key dependencies — on other programmes, technology, third parties, or regulatory approvals.">
          <TextArea value={form.dependencies} onChange={upd('dependencies')} placeholder="e.g. Dependent on ERP upgrade programme completing Q3; requires vendor security accreditation..." />
        </Field>
        <Field label="Delivery risk" hint="What are the main risks to successful delivery? How will they be managed?">
          <TextArea value={form.deliveryRisk} onChange={upd('deliveryRisk')} placeholder="e.g. Key person risk on supplier side; mitigated by contract clause requiring named resource continuity..." />
        </Field>
      </div>
    </div>
  );
}

function Section4({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (v: string) => dispatch({ type: 'UPDATE_FIELD', field, value: v });
  return (
    <div className="space-y-6">
      <SectionHeader
        number={4}
        title="Delivery & outcomes"
        subtitle="Describe how this initiative will be delivered and what success looks like."
      />
      <Field label="Delivery plan" required hint="Provide a high-level summary of how the initiative will be delivered. Include approach, phases, and key milestones.">
        <TextArea value={form.deliveryPlan} onChange={upd('deliveryPlan')} rows={4} placeholder="e.g. Phase 1: Discovery and vendor selection (Q1). Phase 2: Build and test (Q2–Q3). Phase 3: Pilot rollout (Q4)..." />
      </Field>
      <Field label="Roadmap summary" hint="Where does this initiative sit in the existing roadmap or portfolio? Is a roadmap template attached?">
        <TextArea value={form.roadmapSummary} onChange={upd('roadmapSummary')} placeholder="e.g. Aligns with Digital Backbone programme roadmap — see attached template. Estimated start Q2 2025..." />
      </Field>
      <Field label="Business case summary" required hint="Summarise the business case. A full business case document should be attached or referenced.">
        <TextArea value={form.businessCaseSummary} onChange={upd('businessCaseSummary')} rows={4} placeholder="e.g. Full business case v1.2 attached. Summary: current manual process costs £350k p.a.; solution reduces to £90k p.a. with one-off investment of £200k..." />
      </Field>
      <Field label="Deliverables, duration and phasing" required hint="What will be delivered, over what timeframe, in what phases?">
        <TextArea value={form.deliverablesDurationPhasing} onChange={upd('deliverablesDurationPhasing')} placeholder="e.g. Deliverable 1: Configured platform (Month 4). Deliverable 2: Trained user base (Month 6). Total duration: 9 months..." />
      </Field>
      <Field label="KPIs and long-term ROI expectations" required hint="What will be measured to confirm success? What is the expected return over a 3–5 year horizon?">
        <TextArea value={form.kpisLongTermRoi} onChange={upd('kpisLongTermRoi')} placeholder="e.g. KPIs: processing time reduction (target -60%), error rate (target <2%), user adoption (target >85%). 5-year ROI: £620k net benefit..." />
      </Field>
    </div>
  );
}

function Section5({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  const upd = (field: keyof FormData) => (v: string) => dispatch({ type: 'UPDATE_FIELD', field, value: v });
  return (
    <div className="space-y-6">
      <SectionHeader
        number={5}
        title="Sponsor & governance"
        subtitle="Confirm executive sponsorship. All initiatives submitted via OneBridge must have a named executive sponsor."
      />
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-5 text-sm text-amber-800 dark:text-amber-300 space-y-4">
        <div>
          <p className="font-bold text-base mb-1">Maturity requirements</p>
          <p>Your initiative must have passed Gate 3 of the Babcock transformation lifecycle and be supported by a PID or early-stage business case before submission.</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'hasPassedGate3', value: !form.hasPassedGate3 })}
            className="flex items-center gap-3 w-full text-left focus:outline-none"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
              ${form.hasPassedGate3 ? 'bg-amber-600 border-amber-600 dark:bg-amber-500 dark:border-amber-500' : 'border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-800'}`}>
              {form.hasPassedGate3 && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="font-semibold">We have successfully passed Gate 3</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'hasPID', value: !form.hasPID })}
            className="flex items-center gap-3 w-full text-left focus:outline-none"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
              ${form.hasPID ? 'bg-amber-600 border-amber-600 dark:bg-amber-500 dark:border-amber-500' : 'border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-800'}`}>
              {form.hasPID && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="font-semibold">We have a documented PID or Business Case</span>
          </button>
        </div>
      </div>
      <Field label="Executive sponsor name" required>
        <TextInput value={form.executiveSponsorName} onChange={upd('executiveSponsorName')} placeholder="Full name of the executive sponsor" />
      </Field>
      <Field label="Executive sponsor role" required>
        <TextInput value={form.executiveSponsorRole} onChange={upd('executiveSponsorRole')} placeholder="e.g. Chief Operating Officer, Sector Managing Director" />
      </Field>
      <Field label="Sponsor endorsement" required hint="Confirm that the named executive sponsor has reviewed this submission and endorses its progression.">
        <button
          onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'sponsorEndorsementConfirmed', value: !form.sponsorEndorsementConfirmed })}
          className={`flex items-start gap-3 w-full text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
            ${form.sponsorEndorsementConfirmed
              ? 'border-teal bg-teal/10 dark:bg-teal/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal/50'}`}
        >
          <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
            ${form.sponsorEndorsementConfirmed ? 'bg-teal border-teal' : 'border-slate-300 dark:border-slate-600'}`}>
            {form.sponsorEndorsementConfirmed && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            I confirm that <strong>{form.executiveSponsorName || 'the named executive sponsor'}</strong> has endorsed this submission and is aware it will be reviewed by the TPMO and/or AI Steering Committee.
          </span>
        </button>
      </Field>
    </div>
  );
}

function AIGate({ form, dispatch }: { form: FormData; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 pb-2">
        <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center mx-auto shadow-md">
          <span className="text-teal-light text-2xl font-bold">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">AI decision gate</h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          All initiatives involving AI, machine learning, or generative AI must be routed to the AI Steering Committee. This determines your governance pathway.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <p className="font-semibold text-slate-900 dark:text-white">
          Does this initiative involve Artificial Intelligence, Machine Learning, or Generative AI?
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This includes any component that uses AI — even if AI is not the primary purpose of the initiative. If you are unsure, select Yes and AIDEX will advise.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {([
            { value: 'yes', label: 'Yes', desc: 'Routes to Peter P / AI Steering Committee', color: 'teal' },
            { value: 'no', label: 'No', desc: 'Routes to TPMO quarterly review', color: 'purple' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'involvesAI', value: opt.value })}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${form.involvesAI === opt.value
                  ? opt.color === 'teal'
                    ? 'border-teal bg-teal/10 dark:bg-teal/20 focus:ring-teal'
                    : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 focus:ring-purple-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:focus:ring-offset-slate-900'}`}
            >
              <p className={`text-lg font-bold ${form.involvesAI === opt.value
                ? opt.color === 'teal' ? 'text-teal dark:text-teal-light' : 'text-purple-700 dark:text-purple-300'
                : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {form.involvesAI === 'yes' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-teal/10 dark:bg-teal/20 border border-teal/40 rounded-xl p-4 text-sm text-teal-800 dark:text-teal-200">
          <p className="font-semibold mb-1">AI initiatives: mandatory routing</p>
          <p>This submission will be routed to the AI Steering Committee. No AI initiative may progress beyond Gate 7 (Execute) without AI Steering Committee review and approval. AIDEX will be notified automatically.</p>
        </motion.div>
      )}
      {form.involvesAI === 'no' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold mb-1">Global Transformation route</p>
          <p>This submission will enter the TPMO quarterly review cycle. The ELT will be given visibility of this initiative as part of the Global Transformation pipeline.</p>
        </motion.div>
      )}
    </div>
  );
}

function OutcomeScreen({ form, route, rejectionReason }: { form: FormData; route: 'ai-steering' | 'tpmo' | 'rejected', rejectionReason?: string }) {
  const isAI = route === 'ai-steering';
  const isRejected = route === 'rejected';

  if (isRejected) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className={`rounded-2xl p-8 border-2 ${rejectionReason?.includes('maturity') ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/10' : 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/10'} space-y-4`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${rejectionReason?.includes('maturity') ? 'bg-amber-500' : 'bg-red-500'}`}>
              <span className="text-white text-xl">!</span>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${rejectionReason?.includes('maturity') ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                {rejectionReason?.includes('maturity') ? 'Initiative needs further development' : 'Initiative Rejected by OneBridge Triage'}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                {rejectionReason}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-navy dark:bg-slate-900 text-white rounded-2xl p-6 space-y-4">
          <h3 className={`font-bold text-lg ${rejectionReason?.includes('maturity') ? 'text-teal-light' : 'text-red-400'}`}>
            {rejectionReason?.includes('maturity') ? 'Support is available' : 'What happens next'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {rejectionReason?.includes('maturity') 
              ? 'Your initiative does not yet meet the Gate 3 maturity requirements for global OneBridge review. We have a dedicated IT Pipeline process to help you mature your idea, document the business case, and engage with the right stakeholders.'
              : 'Your initiative does not meet the necessary threshold for global OneBridge review. Do not submit this initiative to the central Transformation Queue at this time.'}
            <br/><br/>
            {rejectionReason?.includes('maturity')
              ? 'Use the IT Pipeline tracker to capture your progress and notify an IT Business Partner who can provide direct support.'
              : 'Instead, please follow the local PMO route within your sector or function to progress this activity, or revisit the requirements and return once the maturity or scope criteria have been met.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {rejectionReason?.includes('maturity') ? (
            <Link
              href="/it-pipeline"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            >
              Develop initiative in IT Pipeline →
            </Link>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95"
            >
              Start Over
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Return to AI Front Door
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Route verdict */}
      <div className={`rounded-2xl p-8 border-2 space-y-4 ${isAI ? 'border-teal bg-teal/5 dark:bg-teal/10' : 'border-purple-400 bg-purple-50 dark:bg-purple-900/10'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${isAI ? 'bg-teal' : 'bg-purple-600'}`}>
            <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isAI ? 'text-teal dark:text-teal-light' : 'text-purple-700 dark:text-purple-300'}`}>
              {isAI ? 'Routed to AI Steering Committee' : 'Routed to TPMO — Quarterly Review'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {isAI
                ? 'Your initiative has been identified as involving AI and has been routed to Peter P and the AI Steering Committee for governance review. An automated acknowledgement will be sent confirming the review timeline.'
                : 'Your initiative has been entered into the Global TPMO pipeline for quarterly review and ELT prioritisation. An automated acknowledgement will be sent confirming the next review window.'}
            </p>
            <div className={`mt-4 inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wide ${isAI ? 'bg-teal/10 border border-teal/30 text-teal-800 dark:bg-teal/20 dark:text-teal-200' : 'bg-purple-100 border border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}`}>
              {isAI ? 'Queue: AI Initiatives Queue / Support: AIDEX' : 'Queue: Transformation Queue'}
            </div>
          </div>
        </div>
      </div>

      {/* Submission summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h3 className="font-bold text-navy dark:text-white text-lg">Submission summary</h3>
        <dl className="space-y-3 text-sm">
          {[
            { label: 'Initiative', value: form.initiativeTitle },
            { label: 'Executive sponsor', value: `${form.executiveSponsorName}${form.executiveSponsorRole ? ` — ${form.executiveSponsorRole}` : ''}` },
            { label: 'Benefit type', value: form.benefitType.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()) },
            { label: 'Investment estimate', value: form.totalInvestmentEstimate },
            { label: 'Governance route', value: isAI ? 'AI Steering Committee' : 'Global TPMO' },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
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
          {isAI ? (
            <>
              <li>An automated acknowledgement email will be sent confirming your submission has been received and the expected review timeline.</li>
              <li>Your submission is routed to the AI Steering Committee queue in Remedy and ingested into the Data Warehouse.</li>
              <li>AIDEX will conduct AI-assisted analysis of your submission against pre-defined strategic criteria ahead of the quarterly review.</li>
              <li>The AI Steering Committee will review your initiative. You will be notified of the outcome — progression or closure — with clear reasoning.</li>
            </>
          ) : (
            <>
              <li>An automated acknowledgement email will be sent confirming your submission has been received and the next quarterly review window.</li>
              <li>Your submission is routed to the Global Transformation Queue in Remedy and ingested into the Data Warehouse.</li>
              <li>The TPMO will assess your initiative for readiness, benefits, risks and strategic alignment ahead of the ELT review.</li>
              <li>The ELT will review and prioritise initiatives. You will be notified of the outcome with clear reasoning.</li>
            </>
          )}
        </ol>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mt-8">
        {isAI ? (
          <button
            onClick={() => {
                const mapping = generateAIMapping(form);
                sessionStorage.setItem('ai-front-door-prefill', JSON.stringify(mapping));
                sessionStorage.setItem('onebridge-submission-data', JSON.stringify(form));
                window.location.href = '/aidex';
            }}
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95"
          >
            Continue to AIDEX Submission →
          </button>
        ) : (
          <button
            onClick={() => {
                sessionStorage.setItem('onebridge-submission-data', JSON.stringify(form));
                window.location.href = '/tpmo';
            }}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 active:scale-95"
          >
            Continue to TPMO Intake →
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Print / save record
        </button>
      </div>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
      <div className="w-9 h-9 rounded-full bg-navy text-teal-light flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
        {number}
      </div>
      <div>
        <h2 className="text-xl font-bold text-navy dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function canAdvance(section: Section, form: FormData): boolean {
  switch (section) {
    case 1: return !!(form.initiativeTitle && form.initiativeOverview && form.strategicPriorities && form.scopeAndBusinessImpact && form.scopeLevel);
    case 2: return !!(form.totalInvestmentEstimate && form.fundingAvailability && form.financialBenefits && form.benefitType);
    case 3: return !!(form.regulatoryEthicalCyberRisks && form.operationalDisruptionRisk && form.changeManagementImpact);
    case 4: return !!(form.deliveryPlan && form.businessCaseSummary && form.deliverablesDurationPhasing && form.kpisLongTermRoi);
    case 5: return !!(form.executiveSponsorName && form.executiveSponsorRole && form.sponsorEndorsementConfirmed && form.hasPassedGate3 && form.hasPID);
    case 'gate': return form.involvesAI === 'yes' || form.involvesAI === 'no';
    default: return true;
  }
}

// ─── Triage Logic ─────────────────────────────────────────────────────────────

function onebridgeTriage(form: FormData): { status: 'ai-steering' | 'tpmo' | 'rejected', reason?: string } {
  // 1. Maturity Gate
  if (!form.hasPassedGate3 || !form.hasPID) {
    return { status: 'rejected', reason: "This initiative has low maturity. All initiatives must pass Gate 3 and have a documented PID or business case before central transformation review." };
  }

  // 2. AI Detection
  const aiKeywords = ['ai', 'machine learning', 'ml', 'generative ai', 'genai', 'llm'];
  const desc = (form.initiativeTitle + ' ' + form.initiativeOverview).toLowerCase();
  const isAutoAi = aiKeywords.some(key => desc.includes(key));
  const isAi = form.involvesAI === 'yes' || isAutoAi;

  if (isAi) {
    return { status: 'ai-steering' };
  }

  // 3. Scope and Strategic Alignment
  if (form.scopeLevel !== 'global') {
    return { status: 'rejected', reason: "This initiative is local/sector in scope. Non-AI initiatives must have reach a global transformation threshold for central review." };
  }

  // 4. Value Filter
  const validBenefits = ['overhead-efficiency', 'gross-margin', 'both'];
  if (!validBenefits.includes(form.benefitType)) {
    return { status: 'rejected', reason: "The primary benefit type is not currently aligned with central priorities. Initiatives must deliver against overhead efficiency or gross margin targets." };
  }

  return { status: 'tpmo' };
}

// ─── AI Mapping Heuristic (Mock LLM) ──────────────────────────────────────────

export function generateAIMapping(form: FormData): Record<string, string> {
  const combinedText = `
    ${form.initiativeTitle} ${form.initiativeOverview} 
    ${form.strategicPriorities} ${form.operationalTechnologyImpact} 
    ${form.scopeAndBusinessImpact} ${form.regulatoryEthicalCyberRisks} 
    ${form.operationalDisruptionRisk} ${form.changeManagementImpact}
    ${form.deliveryPlan} ${form.businessCaseSummary}
  `.toLowerCase();

  const answers: Record<string, string> = {};

  // Entry: Always a new proposal from OneBridge
  answers['entry'] = 'new-proposal';

  // Why AI
  if (combinedText.includes('outperforms') || combinedText.includes('roi') || form.kpisLongTermRoi?.length > 50) {
    answers['why-ai'] = 'clear-advantage';
  } else {
    answers['why-ai'] = 'exploring';
  }

  // Data Sensitivity
  if (combinedText.includes('personal') || combinedText.includes('gdpr') || combinedText.includes('classified') || combinedText.includes('sensitive') || combinedText.includes('customer data')) {
    answers['data-sensitivity'] = 'sensitive';
  } else if (combinedText.includes('internal') || combinedText.includes('controlled') || combinedText.includes('employee')) {
    answers['data-sensitivity'] = 'controlled';
  } else {
    answers['data-sensitivity'] = 'public-internal';
  }

  // Decision Influence
  if (combinedText.includes('determine') || combinedText.includes('automate decision') || combinedText.includes('final say')) {
    answers['decision-influence'] = 'determines-outcomes';
  } else if (combinedText.includes('inform') || combinedText.includes('support decision') || combinedText.includes('recommend')) {
    answers['decision-influence'] = 'informs-decisions';
  } else {
    answers['decision-influence'] = 'support-only';
  }

  // Audience Reliance
  if (combinedText.includes('customer') || combinedText.includes('external') || combinedText.includes('public') || combinedText.includes('supplier')) {
    answers['audience-reliance'] = 'external';
  } else if (form.scopeLevel === 'global' || combinedText.includes('operational teams') || combinedText.includes('functions')) {
    answers['audience-reliance'] = 'internal-ops';
  } else {
    answers['audience-reliance'] = 'internal-aid';
  }

  // Autonomy Action
  if (combinedText.includes('autonomous') || combinedText.includes('without human') || combinedText.includes('self-initiate')) {
    answers['autonomy-action'] = 'autonomous-actions';
  } else if (combinedText.includes('bounded') || combinedText.includes('trigger') || combinedText.includes('action')) {
    answers['autonomy-action'] = 'bounded-actions';
  } else {
    answers['autonomy-action'] = 'content-for-review';
  }

  // Domain Sensitivity
  if (combinedText.includes('safety') || combinedText.includes('defence') || combinedText.includes('military') || combinedText.includes('regulated') || combinedText.includes('security')) {
    answers['domain-sensitivity'] = 'restricted-domain';
  } else if (combinedText.includes('operation') || combinedText.includes('engineering') || combinedText.includes('infrastructure')) {
    answers['domain-sensitivity'] = 'operationally-relevant';
  } else {
    answers['domain-sensitivity'] = 'no-trigger';
  }

  return answers;
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────

function NavButtons({ section, form, dispatch }: { section: Section; form: FormData; dispatch: React.Dispatch<Action> }) {
  if (section === 'outcome') return null;
  const isGate = section === 'gate';
  const ready = canAdvance(section, form);

  const handleNext = () => {
    if (isGate) {
      const triage = onebridgeTriage(form);
      dispatch({ type: 'SET_ROUTE', route: triage.status, reason: triage.reason });
    } else {
      dispatch({ type: 'NEXT_SECTION' });
    }
  };

  return (
    <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
      {section !== 1 ? (
        <button
          onClick={() => dispatch({ type: 'PREV_SECTION' })}
          className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          ← Back
        </button>
      ) : <div />}
      <button
        onClick={handleNext}
        disabled={!ready}
        className={`inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95
          ${ready
            ? 'bg-teal hover:bg-teal-light text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'}`}
      >
        {isGate ? 'Submit to OneBridge →' : 'Continue →'}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OneBridgePage() {
  const [state, dispatch] = useReducer(reducer, {
    currentSection: 1,
    form: EMPTY_FORM,
    route: null,
    rejectionReason: '',
    submitted: false,
  });

  const { currentSection, form, route, rejectionReason } = state;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24">

      {/* Page header */}
      {currentSection !== 'outcome' && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-2"
        >
          <div className="inline-flex items-center gap-2 bg-navy text-teal-light text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            OneBridge — Initiative submission
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">
            Submit a transformation or AI initiative
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Complete all sections accurately. This form is not an idea capture tool — it is for mature initiatives with a defined scope, identified benefits, an engaged sponsor, and an outline delivery approach.
          </p>
        </motion.div>
      )}

      {/* Progress */}
      <ProgressBar current={currentSection} />

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={String(currentSection)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8"
        >
          {currentSection === 1 && <Section1 form={form} dispatch={dispatch} />}
          {currentSection === 2 && <Section2 form={form} dispatch={dispatch} />}
          {currentSection === 3 && <Section3 form={form} dispatch={dispatch} />}
          {currentSection === 4 && <Section4 form={form} dispatch={dispatch} />}
          {currentSection === 5 && <Section5 form={form} dispatch={dispatch} />}
          {currentSection === 'gate' && <AIGate form={form} dispatch={dispatch} />}
          {currentSection === 'outcome' && route && <OutcomeScreen form={form} route={route} rejectionReason={rejectionReason} />}
          <NavButtons section={currentSection} form={form} dispatch={dispatch} />
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      {currentSection !== 'outcome' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
          Reference: BAB-ENG-MAN-157 v3.0 · Classification: UNCLASSIFIED · All submissions are reviewed quarterly
        </p>
      )}
    </div>
  );
}
