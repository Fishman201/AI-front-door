import { v4 as uuidv4 } from 'uuid';
import { ClassificationResult } from '@/types/decision-tree';
import treeData from '@/data/decision-tree.json';
import { matchUseCases } from './match-use-cases';

export function generateExportJson(answers: Record<string, string>, classification: ClassificationResult, entryType: string | null) {
  const answerDetails: Record<string, any> = {};
  for (const [nodeId, optionId] of Object.entries(answers)) {
    const node = (treeData.nodes as any[]).find(n => n.id === nodeId);
    if (!node) continue;
    const option = node.options.find((o: any) => o.id === optionId);
    if (option) {
       answerDetails[nodeId] = { optionId, label: option.label };
    }
  }

  const matches = matchUseCases(classification.factorLevels, classification.tier);
  const matchedSummaries = matches.map(m => ({
    name: m.name,
    pathway: Array.isArray(m.pathway) ? m.pathway.join('/') : m.pathway,
    fit: m.fit
  }));

  const payload = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    assessmentId: uuidv4(),
    manualReference: "BAB-ENG-MAN-157 v3.0",
    entryType: entryType || 'unknown',
    classification,
    answers: answerDetails,
    warnings: answers['why-ai'] === 'not-sure' ? ['AI by default'] : [],
    similarUseCases: matchedSummaries
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-front-door-export-${payload.assessmentId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
