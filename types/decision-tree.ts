export type ClassificationFactor =
  | 'dataSensitivity'
  | 'decisionInfluence'
  | 'audienceReliance'
  | 'autonomyAction'
  | 'domainSensitivity'
  | 'changeSinceApproval';

export type FactorLevel = 'low' | 'moderate' | 'high';

export type RiskTier = 1 | 2 | 3 | 4;
export type ApprovalPathway = 'A' | 'B' | 'C' | 'D';

export interface TreeOption {
  id: string;
  label: string;
  description?: string;
  value: string;
  nextNodeId: string | 'RESULTS' | 'PROHIBITED' | 'RESTRICTED';
  classificationImpact?: {
    factor: ClassificationFactor;
    level: FactorLevel;
  };
  prohibitedReason?: string;   // shown if nextNodeId = 'PROHIBITED'
  restrictedReason?: string;   // shown if nextNodeId = 'RESTRICTED'
}

export interface TreeNode {
  id: string;
  question: string;
  helpText?: string;           // expandable explanation
  manualReference?: string;    // e.g. "Section 2.2, Row 1"
  options: TreeOption[];
}

export interface ClassificationResult {
  tier: RiskTier;
  tierLabel: string;           // 'Limited' | 'Moderate' | 'High' | 'Critical'
  pathway: ApprovalPathway;
  pathwayName: string;         // 'Local Business Control' | etc
  aidexRequired: boolean;
  aidexReason?: string;
  specialistReviews: SpecialistReview[];
  evidenceBurden: string[];
  factorLevels: Record<ClassificationFactor, FactorLevel>;
}

export interface SpecialistReview {
  area: string;                // e.g. 'Privacy'
  reason: string;              // why triggered
  typicalOwner: string;        // who to contact
}

export interface IntakeRecord {
  id: string;
  timestamp: string;
  entryType: string;
  answers: Record<string, string>;  // nodeId -> optionId
  classification: ClassificationResult | null;
}
