// Core types for OneBridge Initiative Routing

export type BenefitType = 'NEITHER' | 'OVERHEAD_EFFICIENCY' | 'GROSS_MARGIN' | 'BOTH';

export interface Initiative {
  id: string;

  // Entry questions
  involvesAI: boolean;                 // Q1
  isGlobalTransformation: boolean;     // Q2

  // Maturity / lifecycle
  hasPassedGate3: boolean;             // Gate 3
  hasPIDOrBusinessCase: boolean;
  hasExecutiveSponsor: boolean;
  hasSufficientDetail: boolean;        // scope, benefits, delivery

  // Awareness
  understandsQuarterlyGovernance: boolean;

  // Form sections (optional — for future full submission)
  title?: string;
  overview?: string;
  strategicPriorities?: string[];
  operationalTechImpact?: string;
  scopeAndBusinessImpact?: string;

  totalInvestmentEstimate?: number;
  fundingAvailable?: boolean;
  irr?: number | null;
  npv?: number | null;
  roiTimeframeMonths?: number | null;
  benefitType?: BenefitType;
  financialBenefits?: string;
  nonFinancialBenefits?: string;

  regulatoryEthicalCyberRisks?: string;
  operationalDisruptionRisk?: string;
  changeAndRetrainingImpact?: string;
  dependenciesAndDeliveryRisk?: string;

  deliveryPlanProvided?: boolean;
  roadmapAttached?: boolean;
  businessCaseAttached?: boolean;
  deliverablesDefined?: boolean;
  durationDefined?: boolean;
  kpisDefined?: boolean;
  longTermROIExpectations?: string;

  executiveSponsorName?: string;
  sponsorEndorsementConfirmed?: boolean;
}

export type Route =
  | 'DO_NOT_SUBMIT_LOCAL_ROUTE'
  | 'DO_NOT_SUBMIT_NOT_MATURE'
  | 'REVIEW_GUIDANCE_FIRST'
  | 'SUBMIT_TO_ONEBRIDGE_AI_SC'
  | 'SUBMIT_TO_ONEBRIDGE_TPMO';

export interface RoutingResult {
  route: Route;
  reasons: string[];
}
