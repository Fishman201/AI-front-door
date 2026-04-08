import {
  ClassificationResult,
  FactorLevel,
  ClassificationFactor,
  TreeNode,
  SpecialistReview,
  RiskTier,
  ApprovalPathway,
} from '@/types/decision-tree';

export function classify(
  answers: Record<string, string>,
  nodes: TreeNode[]
): ClassificationResult | null {
  // Check if we are in an exploratory path rather than a full tree
  const exploratoryPaths = ['explore', 'report-concern'];
  if (answers['entry'] && exploratoryPaths.includes(answers['entry'])) {
    return null; // Don't generate a classification for non-proposals
  }

  // Calculate default factor levels
  const factorLevels: Record<ClassificationFactor, FactorLevel> = {
    dataSensitivity: 'low',
    decisionInfluence: 'low',
    audienceReliance: 'low',
    autonomyAction: 'low',
    domainSensitivity: 'low',
    changeSinceApproval: 'low',
  };

  // Extract factor levels from the given answers
  for (const nodeId in answers) {
    const selectedOptionId = answers[nodeId];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const option = node.options.find((o) => o.id === selectedOptionId);
    if (option && option.classificationImpact) {
      factorLevels[option.classificationImpact.factor] =
        option.classificationImpact.level;
    }
  }

  // Determine Tier
  const allLevels = Object.values(factorLevels);
  let tier: RiskTier = 1;

  const hasHigh = allLevels.includes('high');
  const hasModerate = allLevels.includes('moderate');

  if (hasHigh) {
    tier = 3;
    // Elevate to tier 4
    if (
      factorLevels.domainSensitivity === 'high' &&
      (factorLevels.decisionInfluence === 'high' ||
        factorLevels.autonomyAction === 'high')
    ) {
      tier = 4;
    }
  } else if (hasModerate) {
    tier = 2;
  }

  // Map Tier to labeling / pathway
  const tierLabels: Record<RiskTier, string> = {
    1: 'Limited',
    2: 'Moderate',
    3: 'High',
    4: 'Critical',
  };

  const pathwayMap: Record<RiskTier, ApprovalPathway> = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  };

  const pathwayNameMap: Record<ApprovalPathway, string> = {
    A: 'Local Business Control',
    B: 'Business and Risk Review',
    C: 'EPT Governance Review',
    D: 'Final Written Approval',
  };

  const pathway = pathwayMap[tier];

  // AIDEX Logic
  let aidexRequired = false;
  let aidexReason = '';

  if (tier >= 3) {
    aidexRequired = true;
    aidexReason = `Required for Tier ${tier} (High/Critical risk) use cases.`;
  } else if (factorLevels.audienceReliance === 'high') {
    aidexRequired = true;
    aidexReason = 'Required due to external/customer reliance.';
  } else if (factorLevels.autonomyAction === 'high') {
    aidexRequired = true;
    aidexReason = 'Required due to high autonomy action authority.';
  }

  // Specialist Reviews
  const specialistReviews: SpecialistReview[] = [];

  const tierMapScore = { low: 1, moderate: 2, high: 3 };

  if (tierMapScore[factorLevels.dataSensitivity] >= 2) {
    specialistReviews.push({
      area: 'Data Governance',
      reason: 'Use case handles controlled or sensitive data.',
      typicalOwner: 'Information Asset Owner',
    });
  }

  // If High data sensitivity, we assume Personal Data could be involved based on options
  if (factorLevels.dataSensitivity === 'high') {
    specialistReviews.push({
      area: 'Privacy',
      reason: 'Use case handles sensitive or personal data.',
      typicalOwner: 'Privacy Compliance Owner',
    });
  }

  if (
    factorLevels.dataSensitivity === 'high' ||
    tierMapScore[factorLevels.autonomyAction] >= 2
  ) {
    specialistReviews.push({
      area: 'Security',
      reason: 'High data sensitivity or significant system autonomy.',
      typicalOwner: 'Security Representative',
    });
  }

  // Assuming third-party AI is involved for POC
  specialistReviews.push({
    area: 'Procurement',
    reason: 'Use case appears to involve third-party AI or external services.',
    typicalOwner: 'Procurement Lead',
  });

  if (
    factorLevels.audienceReliance === 'high' ||
    factorLevels.decisionInfluence === 'high'
  ) {
    specialistReviews.push({
      area: 'Legal',
      reason:
        'External reliance or high influence on material decisions detected.',
      typicalOwner: 'Legal/Contract Owner',
    });
  }

  if (factorLevels.domainSensitivity === 'high') {
    specialistReviews.push({
      area: 'Domain/Duty Holder',
      reason: 'Safety-critical, restricted or regulated domain detected.',
      typicalOwner: 'Domain Subject Matter Expert / Duty Holder', // Needs specific finding in reality
    });
  }

  // Evidence Burden By Tier
  const evidenceBurdenList: Record<RiskTier, string[]> = {
    1: ['Use case description', "'Why AI?' assessment", 'Basic classification'],
    2: [
      'Use case description',
      "'Why AI?' assessment",
      'Basic classification',
      'Risk review',
      'Validation evidence',
      'Specialist concurrence',
    ],
    3: [
      'Use case description',
      "'Why AI?' assessment",
      'Basic classification',
      'Risk review',
      'Validation evidence',
      'Specialist concurrence',
      'AI Audit Pack',
      'Supplier evidence',
      'Operational monitoring plan',
    ],
    4: [
      'Use case description',
      "'Why AI?' assessment",
      'Basic classification',
      'Risk review',
      'Validation evidence',
      'Specialist concurrence',
      'AI Audit Pack',
      'Supplier evidence',
      'Operational monitoring plan',
      'Enhanced assurance',
      'Residual risk rationale',
      'Explicit written approval record',
    ],
  };

  return {
    tier,
    tierLabel: tierLabels[tier],
    pathway,
    pathwayName: pathwayNameMap[pathway],
    aidexRequired,
    aidexReason,
    specialistReviews,
    evidenceBurden: evidenceBurdenList[tier],
    factorLevels,
  };
}

export function detectProhibitedOrRestricted(
  answers: Record<string, string>,
  nodes: TreeNode[]
): { status: 'PROHIBITED' | 'RESTRICTED' | 'OK'; reason?: string } {
  // Issue 10 fix: expanded to all 6 ClassificationFactors (was only 4) and
  // removed @ts-ignore. Previously 'changeSinceApproval' and 'audienceReliance'
  // were silently excluded, meaning future tree questions using those factors
  // would never trigger restricted/prohibited logic.
  const factorLevels: Record<string, string> = {
    dataSensitivity: 'low',
    decisionInfluence: 'low',
    audienceReliance: 'low',
    autonomyAction: 'low',
    domainSensitivity: 'low',
    changeSinceApproval: 'low',
  };

  for (const nodeId in answers) {
    const selectedOptionId = answers[nodeId];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const option = node.options.find((o) => o.id === selectedOptionId);
    if (option && option.classificationImpact) {
      const { factor, level } = option.classificationImpact;
      if (factor in factorLevels) {
        factorLevels[factor] = level;
      }
    }
  }

  if (
    factorLevels.dataSensitivity === 'high' &&
    // POC heuristic: assume we lack an "approved tools" check right now. Let's just flag it if no other tool mentioned.
    true // We might normally check for 'approved-tools' factor here
  ) {
    // According to reqs: "PROHIBITED if dataSensitivity=high + no mention of approved tools"
    // We will conditionally return this if the mock tool selection is unapproved.
    // However, since we don't have that node yet, we will just restrict instead or leave logic ready.
  }

  // "PROHIBITED if: domainSensitivity = high + autonomyAction = high + decisionInfluence = high"
  if (
    factorLevels.domainSensitivity === 'high' &&
    factorLevels.autonomyAction === 'high' &&
    factorLevels.decisionInfluence === 'high'
  ) {
    return {
      status: 'PROHIBITED',
      reason:
        'Safety-critical domain with autonomous action and decision authority requires explicit pre-authorisation and is generally prohibited without exception frameworks.',
    };
  }

  // RESTRICTED if: domainSensitivity = high + autonomyAction >= moderate
  if (
    factorLevels.domainSensitivity === 'high' &&
    (factorLevels.autonomyAction === 'moderate' ||
      factorLevels.autonomyAction === 'high')
  ) {
    return {
      status: 'RESTRICTED',
      reason:
        'Defence, workforce, or safety-critical use cases with system autonomy are restricted. Additional controls and direct EPT oversight are mandatory.',
    };
  }

  return { status: 'OK' };
}
