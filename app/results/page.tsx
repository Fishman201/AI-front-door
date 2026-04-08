'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ClassificationResult, RiskTier, TreeNode } from '@/types/decision-tree';
import treeDataRaw from '@/data/decision-tree.json';
import { classify } from '@/lib/classify';
import { generateExportJson } from '@/lib/generate-json';
import { matchUseCases } from '@/lib/match-use-cases';
import DownloadPDF from '@/components/results/DownloadPDF';

const treeData = treeDataRaw as { nodes: TreeNode[] };

type ResultData = {
  answers: Record<string, string>;
  // classification is null for non-proposal entry paths (explore, report-concern)
  classification: ClassificationResult | null;
  entryType: string | null;
}

type OneBridgeSubmission = {
  initiativeTitle?: string;
  initiativeOverview?: string;
  strategicPriorities?: string;
  scopeLevel?: string;
  scopeAndBusinessImpact?: string;
  totalInvestmentEstimate?: string;
  benefitType?: string;
  financialBenefits?: string;
  nonFinancialBenefits?: string;
  regulatoryEthicalCyberRisks?: string;
  deliveryPlan?: string;
  kpisLongTermRoi?: string;
  executiveSponsorName?: string;
  executiveSponsorRole?: string;
}

function ResultsPage() {
  const [data, setData] = useState<ResultData | null>(null);
  const [oneBridgeData, setOneBridgeData] = useState<OneBridgeSubmission | null>(null);
  const [noData, setNoData] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const searchParams = useSearchParams();

  // Warning fix: extract the primitive string from searchParams *outside* the effect.
  // The searchParams object itself can be a new reference on every render in Next.js,
  // causing this effect to fire repeatedly and thrash state. A string is stable.
  const encParam = searchParams.get('a');

  useEffect(() => {
    // 1. Try to load from URL params
    if (encParam) {
      try {
        const decoded = JSON.parse(atob(encParam));
        const recalc = classify(decoded.a, treeData.nodes);
        if (recalc) {
          setData({ answers: decoded.a, classification: recalc, entryType: decoded.e });
          return;
        }
      } catch (e) {
        console.error("Failed to parse linked URL data");
      }
    }

    // 2. Try to load from Session Storage
    const stored = sessionStorage.getItem('ai-front-door-result');
    if (stored) {
      try {
        setData(JSON.parse(stored));
        return;
      } catch (e) {
        console.error("Failed to parse session result", e);
      }
    }

    // 3. Issue 1 fix: Nothing found — signal no-data rather than showing
    // a spinner that never resolves.
    setNoData(true);
  }, [encParam]);

  // Load OneBridge submission if present
  useEffect(() => {
    const stored = sessionStorage.getItem('onebridge-submission');
    if (stored) {
      try {
        setOneBridgeData(JSON.parse(stored));
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  // Issue 1 fix: show a proper "no assessment found" screen instead of an
  // infinite loading spinner.
  if (noData) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-6xl">📋</div>
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">No Assessment Found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            There is no saved assessment to display. Please complete the questionnaire first.
          </p>
        </div>
        <Link
          href="/assess"
          className="bg-teal text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-light shadow-md hover:shadow-lg transition-all"
        >
          Start a New Assessment →
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-center">
        <div className="text-slate-500 animate-pulse">Loading assessment results...</div>
      </div>
    );
  }

  const { classification, answers } = data;

  // Issue 2 fix: explore/report-concern paths produce classification: null.
  // Guard here prevents destructuring crashes below.
  if (!classification) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-6xl">
          {data.entryType === 'report-concern' ? '🔔' : '🔍'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
            {data.entryType === 'report-concern' ? 'Concern Reported' : 'Exploring AI Projects'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            {data.entryType === 'report-concern'
              ? 'Thank you for flagging this. Contact AIDEX directly to report an incident or governance concern.'
              : 'Browse the AI Registry to discover active projects across the organisation.'}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/" className="bg-teal text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-light shadow-md hover:shadow-lg transition-all">
            ← Back to Home
          </Link>
          <Link href="/assess" className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Start a Proposal Instead
          </Link>
        </div>
      </div>
    );
  }

  // Issue 5+6+7 fix: safe copy link — proper Unicode encoding, awaited promise,
  // real error feedback instead of a false "Copied!" on failure.
  const handleCopyLink = () => {
    try {
      // encodeURIComponent + unescape makes btoa Unicode-safe (Issue 6)
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ a: data.answers, e: data.entryType }))));
      const url = `${window.location.origin}/results?a=${encoded}`;
      // Issue 7: await the Promise so we only show success on actual success
      navigator.clipboard.writeText(url)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch(() => {
          alert('Could not copy to clipboard — please copy the URL from your browser bar manually.');
        });
    } catch {
      alert('Could not generate shareable link. Try exporting as JSON instead.');
    }
  };

  const matchedCases = matchUseCases(classification.factorLevels, classification.tier);

  const getTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 1: return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500', name: 'Limited Risk' };
      case 2: return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500', name: 'Moderate Risk' };
      case 3: return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500', name: 'High Risk' };
      case 4: return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-600', name: 'Critical Risk' };
    }
  };

  const getTierSummary = (tier: RiskTier) => {
    switch (tier) {
      case 1: return "Your use case can be approved locally with standard controls.";
      case 2: return "Your use case needs business and risk owner review before proceeding.";
      case 3: return "Your use case requires AIDEX governance review and specialist sign-offs.";
      case 4: return "Your use case requires enhanced evidence, specialist reviews, and final written approval.";
    }
  };

  const tierStyle = getTierColor(classification.tier);

  const getIconForArea = (area: string) => {
    if (area.includes('Data')) return '📊';
    if (area.includes('Privacy')) return '🔒';
    if (area.includes('Security')) return '🛡️';
    if (area.includes('Procurement')) return '📋';
    if (area.includes('Legal')) return '⚖️';
    if (area.includes('Domain')) return '🏗️';
    return '📝';
  };

  const allPossibleSpecialists = [
    { area: 'Data Governance', typicalOwner: 'Information Asset Owner' },
    { area: 'Privacy', typicalOwner: 'Privacy Compliance Owner' },
    { area: 'Security', typicalOwner: 'Security Representative' },
    { area: 'Procurement', typicalOwner: 'Procurement Lead' },
    { area: 'Legal', typicalOwner: 'Legal/Contract Owner' },
    { area: 'Domain/Duty Holder', typicalOwner: 'Domain Subject Matter Expert' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 print:py-0 print:space-y-6 pb-24 font-sans">
      
      {answers['why-ai'] === 'not-sure' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
          <p className="text-amber-800 font-bold mb-1">⚠️ Your assessment flagged an 'AI by default' concern.</p>
          <p className="text-amber-700 text-sm">
            The manual requires a clear business case for why AI is better than a manual or conventional approach. Consider completing a stronger 'Why AI?' assessment before proceeding.
          </p>
        </div>
      )}

      {/* SECTION A */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-700 print:shadow-none print:border-2">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${tierStyle.border} ${tierStyle.bg} dark:bg-opacity-20`}>
            <span className={`text-4xl font-bold ${tierStyle.text} dark:text-white`}>
              T{classification.tier}
            </span>
          </div>
          <span className={`mt-3 font-semibold ${tierStyle.text} dark:text-slate-200 uppercase tracking-wider text-sm`}>
            {tierStyle.name}
          </span>
        </div>
        
        <div className="flex-grow space-y-3 text-center md:text-left">
          <h2 className="text-2xl font-bold text-navy dark:text-teal-light">
            Pathway {classification.pathway} — {classification.pathwayName}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {getTierSummary(classification.tier)}
          </p>
          {classification.aidexRequired && (
            <div className="inline-block mt-2 bg-teal text-white px-3 py-1 rounded-full text-sm font-medium">
              ✓ AIDEX Review Required
            </div>
          )}
        </div>
      </section>

      {/* SECTION B */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Your Approval Pathway</h3>
        
        {classification.pathway === 'A' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p><strong>When used:</strong> Low-consequence internal productivity support; no sensitive data; no restricted trigger; no consequential automation.</p>
            <p><strong>Minimum inputs:</strong> Short 'Why AI?' assessment, basic classification, user guidance.</p>
            <p><strong>Typical approvers:</strong> Local Business Owner or delegated manager.</p>
          </div>
        )}
        {classification.pathway === 'B' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p><strong>When used:</strong> Internal support with moderate decision influence, moderate data sensitivity, or operational dependency.</p>
            <p><strong>Minimum inputs:</strong> Documented classification, risk review, required specialist concurrence.</p>
            <p><strong>Typical approvers:</strong> Business Owner plus Risk Owner, with specialist and AIDEX input as triggered.</p>
          </div>
        )}
        {classification.pathway === 'C' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p><strong>When used:</strong> Externally relied-upon, customer-facing, regulated/sensitive context, agentic capability, or stronger operational consequence.</p>
            <p><strong>Minimum inputs:</strong> AI Audit Pack, validation evidence, specialist reviews, approval record.</p>
            <p><strong>Typical approvers:</strong> AIDEX review plus accountable owners and required specialists.</p>
          </div>
        )}
        {classification.pathway === 'D' && (
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p><strong>When used:</strong> Critical or high-consequence use including safety-, mission-, legal-, political-, or security-critical contexts.</p>
            <p><strong>Minimum inputs:</strong> Enhanced evidence, residual risk rationale, strengthened assurance, explicit written approval.</p>
            <p><strong>Typical approvers:</strong> Designated final approver after AIDEX review.</p>
          </div>
        )}
      </section>

      {/* SECTION C */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Specialist Reviews Required</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPossibleSpecialists.map(spec => {
            const triggered = classification.specialistReviews.find(r => r.area === spec.area);
            if (triggered) {
              return (
                <div key={spec.area} className="flex gap-4 p-4 rounded-lg bg-teal-light/20 border border-teal dark:bg-slate-700 dark:border-slate-600">
                   <div className="text-2xl">{getIconForArea(spec.area)}</div>
                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{spec.area}</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{triggered.reason}</p>
                     <p className="text-xs font-semibold text-teal mt-2">Contact: {triggered.typicalOwner}</p>
                   </div>
                </div>
              );
            } else {
              return (
                <div key={spec.area} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 opacity-60 dark:bg-slate-800/50 dark:border-slate-800">
                   <div className="text-2xl grayscale opacity-50">{getIconForArea(spec.area)}</div>
                   <div>
                     <h4 className="font-semibold text-slate-500">{spec.area}</h4>
                     <p className="text-sm text-slate-400 mt-1">✓ Not required for this use case</p>
                   </div>
                </div>
              );
            }
          })}
        </div>
      </section>

      {/* SECTION D */}
      {classification.aidexRequired ? (
        <section className="bg-teal dark:bg-teal-900 text-white rounded-xl shadow-md p-6 md:p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🏛️</span> You need to engage AIDEX
          </h3>
          <p className="mb-6 opacity-90">
            <strong>When to involve them:</strong> Before approval routing — early, not after the fact.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">What to send them:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
                <li>Short use-case summary and intended purpose</li>
                <li>Data profile (what information is involved)</li>
                <li>Expected users and audience</li>
                <li>Likely decision impact</li>
                <li>This classification summary (Export to PDF)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact Points:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span>✉️</span> Mailbox: <a href="mailto:#" className="underline">Onboarding</a></li>
                <li className="flex gap-2"><span>💬</span> Teams: <a href="#" className="underline">AIDEX Channel</a></li>
                <li className="flex gap-2"><span>📝</span> Form: <a href="#" className="underline">AI Intake Form</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-teal-light/20 text-sm italic opacity-90">
            Expected outcome: AIDEX will provide an early steer on the likely approval route, evidence burden, and which specialist inputs are needed.
          </div>
        </section>
      ) : (
        <section className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 flex gap-3 items-center">
          <span className="text-xl">ℹ️</span>
          <p>AIDEX review is not strictly required for this use case, but you can contact them if you're unsure about any aspect of your classification.</p>
        </section>
      )}

      {/* SECTION E */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Evidence Requirements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-navy dark:text-white">
                <th className="pb-3 pr-4 font-semibold">Evidence Area</th>
                <th className="pb-3 pr-4 font-semibold">What to Retain</th>
                <th className="pb-3 font-semibold w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <tr>
                <td className="py-4 pr-4 font-medium">Core Documentation</td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">Use case description, purpose, owners, 'Why AI?' assessment, classification, autonomy assessment, approvals</td>
                <td className="py-4 text-green-600 font-medium">✓ Required</td>
              </tr>
              <tr className={classification.tier >= 2 ? '' : 'opacity-50'}>
                <td className="py-4 pr-4 font-medium">Validation Evidence</td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">Testing, reliability checks, failure-mode analysis, usability, oversight design</td>
                <td className="py-4 font-medium">
                  {classification.tier >= 2 ? <span className="text-green-600">✓ Required</span> : 'Optional'}
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-medium">Supplier Evidence</td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">Service description, limitations, hosting, contractual position, sub-processors, change notifications</td>
                <td className="py-4 font-medium text-amber-600">If 3rd-party AI</td>
              </tr>
              <tr className={classification.tier >= 3 ? '' : 'opacity-50'}>
                <td className="py-4 pr-4 font-medium">Operational Evidence</td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">Monitoring plan, logs, incidents, complaints, challenge records, review outputs</td>
                <td className="py-4 font-medium">
                  {classification.tier >= 3 ? <span className="text-green-600">✓ Required</span> : 'If deployed'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION F: DYNAMIC USE CASES */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Similar Use Cases</h3>
        <p className="text-sm text-slate-500 mb-4">These examples from the manual match closely with your answers.</p>
        <div className="space-y-4">
          {matchedCases.map(ex => (
             <div key={ex.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
               <div className="flex justify-between items-start mb-2 gap-4">
                 <h4 className="font-semibold text-slate-900 dark:text-white">Example: {ex.name}</h4>
                 <span className="shrink-0 text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded font-medium">
                    Path {Array.isArray(ex.pathway) ? ex.pathway.join('/') : ex.pathway}
                 </span>
               </div>
               <p className={`text-sm mb-2 font-medium
                  ${ex.fit === 'good' ? 'text-green-600' : 
                    ex.fit === 'prohibited' ? 'text-red-600' : 'text-amber-600'}`
               }>
                 {ex.fit === 'good' ? '✅ Good Fit' : ex.fit === 'prohibited' ? '🛑 Prohibited/Stop' : '⚠️ Borderline/Restricted'} 
                 <span className="text-slate-500 font-normal ml-2">— {ex.keyConcern}</span>
               </p>
             </div>
          ))}
          {matchedCases.length === 0 && (
            <p className="text-sm text-slate-500">No exact comparison cases found in the manual.</p>
          )}
        </div>
      </section>

      {/* SECTION G */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:border-none print:shadow-none">
        <button 
          className="w-full p-6 md:p-8 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          <h3 className="text-xl font-bold text-navy dark:text-white m-0">Your Answers</h3>
          <span className="text-2xl text-slate-400">{showAnswers ? '−' : '+'}</span>
        </button>
        
        {showAnswers && (
          <div className="px-6 md:px-8 pb-8 pt-0 space-y-4">
            {Object.entries(answers).map(([nodeId, optionId]) => {
              const node = treeData.nodes.find(n => n.id === nodeId);
              if (!node) return null;
              const option = node.options.find(o => o.id === optionId);
              if (!option) return null;
              
              return (
                <div key={nodeId} className="border-b border-slate-100 dark:border-slate-700 py-3 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{node.question}</p>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-slate-900 dark:text-white font-medium">{option.label}</p>
                    {option.classificationImpact && (
                      <span className="shrink-0 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                        {option.classificationImpact.factor}: {option.classificationImpact.level}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="pt-4 text-center">
               <Link href="/assess" className="text-sm text-teal hover:underline font-medium">Revise Answers (Starts Over)</Link>
            </div>
          </div>
        )}
      </section>

      {/* SECTION H & ACTIONS */}
      <section className="bg-navy dark:bg-slate-900 text-white rounded-xl shadow-md p-6 md:p-8">
        <h3 className="text-xl font-bold text-teal-light mb-6">What Happens Next</h3>
        
        <ol className="space-y-4 list-decimal pl-5 mb-8 text-slate-200">
          {classification.pathway === 'A' && (
            <><li>Complete the 'Why AI?' assessment form</li><li>Get local business owner approval</li><li>Begin your use case with standard controls</li></>
          )}
          {classification.pathway === 'B' && (
            <><li>Document your classification and complete the risk review</li><li>Get business owner and risk owner sign-off</li><li>Obtain specialist concurrence where triggered</li><li>Proceed with agreed controls</li></>
          )}
          {classification.pathway === 'C' && (
            <><li>Contact AIDEX via the intake route</li><li>Prepare the AI Audit Pack</li><li>Undergo AIDEX governance review</li><li>Obtain all required specialist approvals</li><li>Proceed with agreed controls and monitoring</li></>
          )}
          {classification.pathway === 'D' && (
            <><li>Contact AIDEX immediately</li><li>Prepare enhanced evidence and assurance case</li><li>Undergo AIDEX governance review</li><li>Complete all specialist reviews</li><li>Obtain designated final written approval</li><li>Proceed with strengthened controls and monitoring</li></>
          )}
        </ol>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
          <DownloadPDF classification={classification} answers={answers} oneBridgeData={oneBridgeData ?? undefined} />
          
          <button 
            onClick={() => generateExportJson(answers, classification, data.entryType)}
            className="shrink-0 border-2 border-slate-500 text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-700 hover:text-white transition-colors"
          >
            Export JSON
          </button>
          
          <button 
            onClick={handleCopyLink}
            className="shrink-0 border-2 border-teal text-teal-light px-6 py-3 rounded-lg font-medium hover:bg-teal hover:text-white transition-colors"
          >
            {linkCopied ? '✓ Link Copied' : 'Share Link'}
          </button>

          <Link href="/assess" className="shrink-0 block mt-4 sm:mt-0 ml-auto border border-slate-600 text-slate-400 px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors text-center">
            New Assessment
          </Link>
        </div>
      </section>

    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading Results Engine...</div>}>
      <ResultsPage />
    </Suspense>
  );
}
