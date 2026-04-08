'use client';

import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { ClassificationResult } from '@/types/decision-tree';
import treeDataRaw from '@/data/decision-tree.json';
import { TreeNode } from '@/types/decision-tree';

const treeData = treeDataRaw as { nodes: TreeNode[] };

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
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { fontSize: 24, color: '#1B2A4A', marginBottom: 10, fontWeight: 'bold' },
  subheader: { fontSize: 10, color: '#666666', marginBottom: 10 },
  rule: { borderBottom: '2px solid #0D7377', marginBottom: 20 },
  tier: { fontSize: 28, marginBottom: 10, fontWeight: 'bold' },
  tier1: { color: '#16A34A' },
  tier2: { color: '#D97706' },
  tier3: { color: '#EA580C' },
  tier4: { color: '#DC2626' },
  normalText: { fontSize: 12, marginBottom: 6, color: '#333333', lineHeight: 1.5 },
  boldText: { fontSize: 12, fontWeight: 'bold', color: '#1B2A4A' },
  sectionTitle: { fontSize: 18, color: '#1B2A4A', marginTop: 20, marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 5 },
  box: { padding: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginTop: 10, marginBottom: 10 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e2e8f0', paddingVertical: 5 },
  tableHeader: { flexDirection: 'row', borderBottom: '2px solid #1B2A4A', paddingVertical: 5, backgroundColor: '#f1f5f9' },
  col1: { width: '25%', fontSize: 10, paddingRight: 5 },
  col2: { width: '45%', fontSize: 10, paddingRight: 5 },
  col3: { width: '30%', fontSize: 10 },
  colBold: { fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 10 },
});

const MyDoc = ({ classification, answers, oneBridgeData }: { classification: ClassificationResult, answers: Record<string, string>, oneBridgeData?: OneBridgeSubmission }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>AI Front Door — Classification Summary</Text>
      <Text style={styles.subheader}>Generated on {new Date().toLocaleDateString()} | Classification: UNCLASSIFIED</Text>
      <View style={styles.rule} />
      
      <Text style={[styles.tier, (styles as any)[`tier${classification.tier}`]]}>
        Risk Tier {classification.tier} — {classification.tierLabel}
      </Text>
      
      <Text style={styles.normalText}><Text style={styles.boldText}>Approval Pathway:</Text> Path {classification.pathway} — {classification.pathwayName}</Text>
      <Text style={styles.normalText}>
        <Text style={styles.boldText}>AIDEX Involvement:</Text> {classification.aidexRequired ? `Required — ${classification.aidexReason}` : 'Not Required'}
      </Text>

      <View style={styles.box}>
        <Text style={styles.normalText}>This assessment determines the governance, oversight, and evidence requirements for your AI use case according to manual BAB-ENG-MAN-157 v3.0.</Text>
      </View>
      <Text style={styles.footer}>Generated from the AI Front Door | This classification is guidance only. All approvals must follow the formal governance process. | Page 1</Text>
    </Page>

    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Factor Assessment</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.col1, styles.colBold]}>Factor</Text>
        <Text style={[styles.col2, styles.colBold]}>Your Answer</Text>
        <Text style={[styles.col3, styles.colBold]}>Level</Text>
      </View>
      
      {Object.entries(answers).map(([nodeId, optionId]) => {
        const node = treeData.nodes.find(n => n.id === nodeId);
        if (!node) return null;
        const option = node.options.find(o => o.id === optionId);
        if (!option || !option.classificationImpact) return null;

        return (
          <View key={nodeId} style={styles.tableRow}>
             <Text style={styles.col1}>{option.classificationImpact.factor}</Text>
             <Text style={styles.col2}>{option.label}</Text>
             <Text style={styles.col3}>{option.classificationImpact.level}</Text>
          </View>
        )
      })}
      
      {answers['why-ai'] === 'not-sure' && (
         <View style={[styles.box, {marginTop: 20}]}>
           <Text style={styles.boldText}>Warning: AI by default</Text>
           <Text style={styles.normalText}>The assessment flagged that AI may have been selected by default. Ensure a strong business case justifies AI over conventional methods.</Text>
         </View>
      )}
      <Text style={styles.footer}>Generated from the AI Front Door | This classification is guidance only. All approvals must follow the formal governance process. | Page 2</Text>
    </Page>

    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Required Actions &amp; Evidence</Text>
      
      <Text style={styles.boldText}>Specialist Reviews Triggered:</Text>
      {classification.specialistReviews.length === 0 ? (
        <Text style={styles.normalText}>None explicitly triggered by factors.</Text>
      ) : (
        classification.specialistReviews.map(r => (
          <Text key={r.area} style={styles.normalText}>• {r.area}: {r.typicalOwner} ({r.reason})</Text>
        ))
      )}

      <Text style={[styles.boldText, {marginTop: 15}]}>Evidence Required:</Text>
      {classification.evidenceBurden.map(e => (
         <Text key={e} style={styles.normalText}>• {e}</Text>
      ))}
      <Text style={styles.footer}>Generated from the AI Front Door | This classification is guidance only. All approvals must follow the formal governance process. | Page 3</Text>
    </Page>

    {classification.aidexRequired && (
      <Page size="A4" style={styles.page}>
         <Text style={styles.sectionTitle}>AIDEX Engagement Guidance</Text>
         <Text style={styles.normalText}>You must engage AIDEX before proceeding with approval routing.</Text>
         
         <Text style={[styles.boldText, {marginTop: 10}]}>What to send them:</Text>
         <Text style={styles.normalText}>• Short use-case summary and intended purpose</Text>
         <Text style={styles.normalText}>• Data profile (what information is involved)</Text>
         <Text style={styles.normalText}>• Expected users and audience</Text>
         <Text style={styles.normalText}>• Likely decision impact</Text>
         <Text style={styles.normalText}>• This classification summary document</Text>

         <Text style={styles.footer}>Generated from the AI Front Door | This classification is guidance only. All approvals must follow the formal governance process. | Page 4</Text>
      </Page>
    )}

    {oneBridgeData && oneBridgeData.initiativeTitle && (
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>OneBridge Submission — Initiative Summary</Text>
        <Text style={styles.subheader}>Linked from OneBridge triage completed prior to AI Assessment</Text>
        <View style={styles.rule} />

        {oneBridgeData.initiativeTitle && (
          <View style={[styles.box, { marginBottom: 12 }]}>
            <Text style={styles.boldText}>Initiative Title</Text>
            <Text style={styles.normalText}>{oneBridgeData.initiativeTitle}</Text>
          </View>
        )}

        {oneBridgeData.executiveSponsorName && (
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.colBold]}>Executive Sponsor</Text>
            <Text style={styles.col2}>{oneBridgeData.executiveSponsorName}{oneBridgeData.executiveSponsorRole ? ` — ${oneBridgeData.executiveSponsorRole}` : ''}</Text>
          </View>
        )}
        {oneBridgeData.scopeLevel && (
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.colBold]}>Scope Level</Text>
            <Text style={styles.col2}>{oneBridgeData.scopeLevel.charAt(0).toUpperCase() + oneBridgeData.scopeLevel.slice(1)}</Text>
          </View>
        )}
        {oneBridgeData.totalInvestmentEstimate && (
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.colBold]}>Investment Estimate</Text>
            <Text style={styles.col2}>{oneBridgeData.totalInvestmentEstimate}</Text>
          </View>
        )}
        {oneBridgeData.benefitType && (
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.colBold]}>Benefit Type</Text>
            <Text style={styles.col2}>{oneBridgeData.benefitType.replace(/-/g, ' ')}</Text>
          </View>
        )}
        {oneBridgeData.initiativeOverview && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.boldText}>Initiative Overview</Text>
            <Text style={styles.normalText}>{oneBridgeData.initiativeOverview}</Text>
          </View>
        )}
        {oneBridgeData.strategicPriorities && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.boldText}>Strategic Priorities</Text>
            <Text style={styles.normalText}>{oneBridgeData.strategicPriorities}</Text>
          </View>
        )}
        {oneBridgeData.financialBenefits && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.boldText}>Financial Benefits</Text>
            <Text style={styles.normalText}>{oneBridgeData.financialBenefits}</Text>
          </View>
        )}
        {oneBridgeData.regulatoryEthicalCyberRisks && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.boldText}>Regulatory, Ethical & Cyber Risks</Text>
            <Text style={styles.normalText}>{oneBridgeData.regulatoryEthicalCyberRisks}</Text>
          </View>
        )}
        {oneBridgeData.kpisLongTermRoi && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.boldText}>KPIs & Long-Term ROI</Text>
            <Text style={styles.normalText}>{oneBridgeData.kpisLongTermRoi}</Text>
          </View>
        )}
        <Text style={styles.footer}>Generated from the AI Front Door | OneBridge Submission Data | Classification: UNCLASSIFIED</Text>
      </Page>
    )}
  </Document>
);

export default function PDFDocumentBuilder({ classification, answers, oneBridgeData }: { classification: ClassificationResult, answers: Record<string, string>, oneBridgeData?: OneBridgeSubmission }) {
  // Issue 9 fix: memoize the document element so @react-pdf/renderer doesn't
  // re-run its expensive layout engine on every parent render (e.g., when
  // showAnswers toggles on the results page). Only rebuilds when data changes.
  const doc = useMemo(
    () => <MyDoc classification={classification} answers={answers} oneBridgeData={oneBridgeData} />,
    [classification, answers, oneBridgeData]
  );

  return (
    <PDFDownloadLink 
      document={doc} 
      fileName={`Classification_T${classification.tier}.pdf`}
      className="shrink-0 bg-teal text-white px-6 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors shadow-sm inline-block text-center w-full sm:w-auto"
    >
      {({ loading }: { loading: boolean }) => (
        loading ? 'Generating PDF...' : 'Download PDF Summary'
      )}
    </PDFDownloadLink>
  );
}
