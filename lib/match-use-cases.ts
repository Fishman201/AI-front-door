import examplesRaw from '@/data/example-use-cases.json';
import { FactorLevel, RiskTier } from '@/types/decision-tree';

export interface ExampleUseCase {
  id: string;
  name: string;
  value: string;
  tier: number | number[] | null;
  pathway: string | string[] | null;
  fit: string;
  keyConcern: string;
  factors: Partial<Record<string, string | string[]>>;
  score?: number;
}

export function matchUseCases(userFactors: Record<string, FactorLevel>, userTier: RiskTier) {
  const examples = examplesRaw as unknown as ExampleUseCase[];

  const levelScore = { low: 1, moderate: 2, high: 3 } as Record<string, number>;

  const scored = examples.map(ex => {
    let score = 0;
    
    Object.entries(userFactors).forEach(([factor, userLev]) => {
      const uScore = levelScore[userLev as string];
      let exLevRaw = ex.factors[factor];
      if (!exLevRaw) return; // neutral if unlisted
      
      const exLevs = Array.isArray(exLevRaw) ? exLevRaw : [exLevRaw];
      
      let bestMatch = 0;
      exLevs.forEach(lev => {
         const eScore = levelScore[lev];
         if (!eScore || !uScore) return;
         if (eScore === uScore) bestMatch = Math.max(bestMatch, 2);
         else if (Math.abs(eScore - uScore) === 1) bestMatch = Math.max(bestMatch, 1);
      });
      score += bestMatch;
    });

    return { ...ex, score };
  });

  // Filter logic: Exclude prohibited examples unless the user's classification is also Tier 4 / prohibited
  const valid = scored.filter(ex => {
    if (ex.fit === 'prohibited' || ex.fit === 'prohibited-or-stop') {
      return userTier === 4;
    }
    return true;
  });

  valid.sort((a, b) => b.score! - a.score!);
  return valid.slice(0, 3);
}
