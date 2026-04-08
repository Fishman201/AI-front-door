import { Initiative, Route, RoutingResult } from '@/types/initiative';

export function routeInitiative(initiative: Initiative): RoutingResult {
  const reasons: string[] = [];

  // Q1 – AI involvement → must go via AI Steering Committee
  if (initiative.involvesAI) {
    reasons.push('Initiative involves AI/ML/Generative AI → must go via AI Steering Committee.');
    return { route: 'SUBMIT_TO_ONEBRIDGE_AI_SC', reasons };
  }

  // Q2 – Not a Global Transformation → use local/sector PMO route
  if (!initiative.isGlobalTransformation) {
    reasons.push('Initiative is not a Global Transformation → use local/sector PMO or IT engagement route.');
    return { route: 'DO_NOT_SUBMIT_LOCAL_ROUTE', reasons };
  }

  // Q3 – Maturity / readiness checks
  const maturityIssues: string[] = [];
  if (!initiative.hasPassedGate3)        maturityIssues.push('Has not passed Gate 3.');
  if (!initiative.hasPIDOrBusinessCase)  maturityIssues.push('No PID or early-stage Business Case.');
  if (!initiative.hasExecutiveSponsor)   maturityIssues.push('No Executive Sponsor confirmed.');
  if (!initiative.hasSufficientDetail)   maturityIssues.push('Insufficient detail on scope/benefits/delivery.');

  if (maturityIssues.length > 0) {
    reasons.push('Initiative is not mature enough for OneBridge:', ...maturityIssues);
    return { route: 'DO_NOT_SUBMIT_NOT_MATURE', reasons };
  }

  // Q4 – Awareness of governance expectations
  if (!initiative.understandsQuarterlyGovernance) {
    reasons.push('Initiative lead must review OneBridge / governance guidance before submitting.');
    return { route: 'REVIEW_GUIDANCE_FIRST', reasons };
  }

  // Mature Global Transformation, non-AI → OneBridge → TPMO
  reasons.push('Mature Global Transformation, non‑AI → submit via OneBridge for TPMO / ExCo / ELT quarterly review.');
  return { route: 'SUBMIT_TO_ONEBRIDGE_TPMO', reasons };
}

