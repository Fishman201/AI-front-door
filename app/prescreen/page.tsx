'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_ONEBRIDGE_URL in your .env.local to point at the real form.
// Falls back to a placeholder route within this app so the build never errors.
const ONEBRIDGE_URL = process.env.NEXT_PUBLIC_ONEBRIDGE_URL ?? '/onebridge';

function OneBridgeLink() {
  const isExternal = ONEBRIDGE_URL.startsWith('http');
  const className =
    'inline-flex items-center gap-3 bg-navy hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 active:scale-95';

  if (isExternal) {
    return (
      <a href={ONEBRIDGE_URL} target="_blank" rel="noopener noreferrer" className={className}>
        <span>Continue to OneBridge</span>
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link href={ONEBRIDGE_URL} className={className}>
      <span>Continue to OneBridge</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerMap = Record<string, string>;

interface Question {
  id: string;
  text: string;
  helpText?: string;
  options: { id: string; label: string; detail?: string }[];
}

// ─── Questions ────────────────────────────────────────────────────────────────
// Each question has a yes/no/unsure style answer that contributes to a verdict.
// Signal questions: any "yes" answer is an AI signal.
// A single confirmed signal → IS_AI.
// All "no" → NOT_AI.
// Any "unsure" with no "yes" → UNCLEAR.

const QUESTIONS: Question[] = [
  {
    id: 'q-learn',
    text: 'Does the tool or system learn from data or improve its outputs over time without being explicitly reprogrammed?',
    helpText: 'This covers machine learning, neural networks, and adaptive systems that change behaviour based on patterns in data.',
    options: [
      { id: 'yes', label: 'Yes', detail: 'It learns or adapts from data' },
      { id: 'no', label: 'No', detail: 'It follows fixed, pre-set rules only' },
      { id: 'unsure', label: 'Not sure', detail: 'I don\'t know how it works under the hood' },
    ],
  },
  {
    id: 'q-generate',
    text: 'Does it generate content, predictions, recommendations, or decisions — rather than simply retrieving or displaying stored information?',
    helpText: 'Examples: writing text, producing images, scoring candidates, forecasting values, classifying records, or suggesting next actions.',
    options: [
      { id: 'yes', label: 'Yes', detail: 'It produces outputs that weren\'t pre-written' },
      { id: 'no', label: 'No', detail: 'It only retrieves or presents existing data' },
      { id: 'unsure', label: 'Not sure', detail: 'I\'m not certain what type of output it produces' },
    ],
  },
  {
    id: 'q-vendor',
    text: 'Does the solution use or connect to a third-party AI service, model, or platform?',
    helpText: 'Examples: OpenAI / ChatGPT, Microsoft Copilot, Google Gemini, AWS AI services, Palantir AI Platform, or similar vendor AI APIs or products.',
    options: [
      { id: 'yes', label: 'Yes', detail: 'It uses an external AI service or API' },
      { id: 'no', label: 'No', detail: 'It is entirely built on conventional or in-house logic' },
      { id: 'unsure', label: 'Not sure', detail: 'I\'m not certain what\'s powering it' },
    ],
  },
  {
    id: 'q-nlp',
    text: 'Does it process or understand natural language — reading, interpreting, or responding to text or speech written by humans?',
    helpText: 'This includes chatbots, document summarisation, sentiment analysis, transcription, translation, or any free-text interpretation.',
    options: [
      { id: 'yes', label: 'Yes', detail: 'It reads, interprets, or responds to human language' },
      { id: 'no', label: 'No', detail: 'It only handles structured data or fixed inputs' },
      { id: 'unsure', label: 'Not sure', detail: 'I\'m not sure if language processing is involved' },
    ],
  },
  {
    id: 'q-automate',
    text: 'Does it make autonomous or semi-autonomous decisions — acting on data without a human reviewing each individual output before it takes effect?',
    helpText: 'For example: automatically routing tickets, triggering workflows, flagging records, approving requests, or adjusting system settings.',
    options: [
      { id: 'yes', label: 'Yes', detail: 'It acts without a human reviewing each output' },
      { id: 'no', label: 'No', detail: 'A human reviews and approves every output' },
      { id: 'unsure', label: 'Not sure', detail: 'The level of human oversight isn\'t clear to me' },
    ],
  },
];

// ─── Verdict logic ────────────────────────────────────────────────────────────

type Verdict = 'IS_AI' | 'NOT_AI' | 'UNCLEAR' | null;

function deriveVerdict(answers: AnswerMap): Verdict {
  const vals = Object.values(answers);
  if (vals.length === 0) return null;
  if (vals.includes('yes')) return 'IS_AI';
  if (vals.includes('unsure')) return 'UNCLEAR';
  if (vals.length === QUESTIONS.length && vals.every(v => v === 'no')) return 'NOT_AI';
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${selected
          ? 'border-teal bg-teal/10 dark:bg-teal/20 shadow-sm'
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

function VerdictPanel({ verdict, answers }: { verdict: Verdict; answers: AnswerMap }) {
  const unsureCount = Object.values(answers).filter(v => v === 'unsure').length;
  const yesCount = Object.values(answers).filter(v => v === 'yes').length;

  if (verdict === 'IS_AI') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-teal bg-teal/5 dark:bg-teal/10 p-8 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-teal dark:text-teal-light">This initiative involves AI</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Based on your answers ({yesCount} AI indicator{yesCount !== 1 ? 's' : ''} detected), this initiative must be assessed and governed through the AI Front Door before progressing to OneBridge.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">What this means:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>You must complete an AI classification assessment before submitting to OneBridge.</li>
            <li>Depending on the risk tier, AIDEX review and specialist sign-offs may be required.</li>
            <li>All AI initiatives must pass through the AI Steering Committee regardless of sector or scale.</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-teal hover:bg-teal-light text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
        >
          <span>Proceed to AI Front Door</span>
          <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    );
  }

  if (verdict === 'NOT_AI') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-8 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">↗</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">This does not appear to involve AI</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Based on your answers, this initiative does not trigger the AI governance pathway. You may proceed directly to OneBridge for standard Global Transformation intake — provided your initiative meets the required maturity criteria (Gate 3, PID/business case, executive sponsor).
            </p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold mb-1">⚠️ Before you proceed</p>
          <p>If your initiative later incorporates AI, automation, or machine learning features, you must return to the AI Front Door at that point — even if it has already been submitted to OneBridge.</p>
        </div>

        <OneBridgeLink />
      </motion.div>
    );
  }

  if (verdict === 'UNCLEAR') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/10 p-8 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xl">?</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">It's not clear whether this involves AI</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              You answered "not sure" on {unsureCount} question{unsureCount !== 1 ? 's' : ''}. Where there is genuine uncertainty about whether a tool or system involves AI, the safe and required default is to treat it as an AI initiative and route it accordingly.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">Recommended next step:</p>
          <p>Speak to your Business Partner or IT Engagement team to clarify how the solution works before submitting. If you cannot confirm it is not AI, proceed through the AI Front Door.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-teal hover:bg-teal-light text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95"
          >
            <span>Treat as AI — Proceed to Front Door</span>
            <span aria-hidden="true">→</span>
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium px-6 py-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            ← Review my answers
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PreScreenPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <PreScreenContent />
    </Suspense>
  );
}

function PreScreenContent() {
  const searchParams = useSearchParams();
  const isFromRouting = searchParams.get('from') === 'routing';
  const [answers, setAnswers] = useState<AnswerMap>({});

  const setAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  // Early-exit: as soon as first 'yes' is recorded we have a verdict
  const earlyVerdictReached = Object.values(answers).includes('yes');
  const allAnswered = QUESTIONS.every(q => q.id in answers);
  const verdict = earlyVerdictReached || allAnswered ? deriveVerdict(answers) : null;

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-24 space-y-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        {isFromRouting && (
          <div className="inline-flex items-center gap-2 bg-navy text-teal-light text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            <span>Step 0 of 2</span>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white leading-tight">
          Does your initiative involve AI?
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Answer these short questions to find out whether your initiative needs to go through the AI Front Door before OneBridge — or can proceed directly to standard transformation intake.
        </p>
      </motion.div>

      {/* Progress bar */}
      {answeredCount > 0 && (
        <div className="space-y-1.5" aria-label={`${answeredCount} of ${QUESTIONS.length} questions answered`}>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{answeredCount} of {QUESTIONS.length} answered</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {QUESTIONS.map((q, index) => {
          // Once we have a confirmed 'IS_AI' verdict, stop showing further questions
          const isVisible = !earlyVerdictReached || q.id in answers;

          if (!isVisible) return null;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-5">
                {/* Question header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-navy dark:bg-slate-700 text-teal-light text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                      {q.text}
                    </p>
                  </div>
                  {q.helpText && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-10">
                      {q.helpText}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-10">
                  {q.options.map(opt => (
                    <OptionButton
                      key={opt.id}
                      label={opt.label}
                      detail={opt.detail}
                      selected={answers[q.id] === opt.id}
                      onClick={() => setAnswer(q.id, opt.id)}
                    />
                  ))}
                </div>

                {/* Inline signal label */}
                <AnimatePresence>
                  {answers[q.id] === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-10"
                    >
                      <span className="inline-flex items-center gap-1.5 bg-teal/10 text-teal dark:text-teal-light border border-teal/30 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <span>⚡</span> AI indicator detected
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Verdict */}
      <AnimatePresence>
        {verdict && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <hr className="border-slate-200 dark:border-slate-700 mb-8" />
            <VerdictPanel verdict={verdict} answers={answers} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-4">
        Reference: BAB-ENG-MAN-157 v3.0 · If unsure, contact your Business Partner or the IT Engagement team.
      </p>
    </div>
  );
}
