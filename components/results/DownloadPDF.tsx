'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ClassificationResult } from '@/types/decision-tree';

const PDFDownloadButton = dynamic(() => import('./PDFDocumentBuilder'), {
  ssr: false,
  loading: () => <button className="bg-slate-200 text-slate-400 px-6 py-3 rounded-lg font-medium cursor-wait shrink-0 w-full sm:w-auto">Loading PDF Engine...</button>
});

type OneBridgeSubmission = Record<string, string | undefined>;

export default function DownloadPDF({ classification, answers, oneBridgeData }: { classification: ClassificationResult, answers: Record<string, string>, oneBridgeData?: OneBridgeSubmission }) {
  return <PDFDownloadButton classification={classification} answers={answers} oneBridgeData={oneBridgeData} />;
}
