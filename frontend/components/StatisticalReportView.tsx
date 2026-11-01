'use client';

import React, { useState } from 'react';
import { FullAnalysisReport } from '../types';
import { downloadPdfReport } from '../lib/api';
import { Button } from './ui/Button';
import {
  BarChart3,
  Download,
  PieChart as PieIcon,
  FileText,
  Loader2,
  CheckCircle2,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart as RechartsPie,
} from 'recharts';

interface StatisticalReportViewProps {
  report?: FullAnalysisReport;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

const SWISS_PIE_COLORS = ['#E85D26', '#76726B', '#171717'];

export default function StatisticalReportView({
  report,
  onGenerateReport,
  isGenerating,
}: StatisticalReportViewProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsDownloadingPdf(true);
    try {
      const blob = await downloadPdfReport(report);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news_framing_report_${report.article.article_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`PDF download failed: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!report) {
    return (
      <div className="bg-pureWhite border border-lightGrey p-12 text-center shadow-editorial-sm space-y-4">
        <BarChart3 className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h4 className="font-editorial font-bold text-base uppercase text-almostBlack tracking-tight">
            Generate Comprehensive Statistical Report
          </h4>
          <p className="text-xs text-editorialMuted max-w-md mx-auto leading-relaxed">
            Synthesizes all linguistic findings, emotional classifications, entity distributions,
            and cross-language verification data into an academic report.
          </p>
        </div>
        <Button
          type="button"
          onClick={onGenerateReport}
          disabled={isGenerating}
          variant="primary"
          size="sm"
          showArrow
          icon={isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          iconPosition="left"
          className="uppercase tracking-wider font-mono text-xs px-6"
        >
          {isGenerating ? 'Synthesizing Report...' : 'Compile Statistical Report & PDF'}
        </Button>
      </div>
    );
  }

  const stats = report.statistics;

  // Prepare framing category bar data
  const framingCategoryData = Object.entries(stats.framing_indicators_by_category)
    .map(([cat, cnt]) => ({
      name: cat.replace(/_/g, ' '),
      count: cnt,
    }))
    .sort((a, b) => b.count - a.count);

  // Sentiment distribution pie data
  const sentimentPieData = [
    { name: 'Positive', value: Math.round(report.sentiment.positive_score * 100), color: '#171717' },
    { name: 'Neutral', value: Math.round(report.sentiment.neutral_score * 100), color: '#76726B' },
    { name: 'Negative', value: Math.round(report.sentiment.negative_score * 100), color: '#E85D26' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Download Action */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> REPORT READY
            </span>
            <span className="font-mono text-[10px] text-editorialMuted">
              ID: {report.report_id}
            </span>
          </div>
          <h3 className="font-editorial font-black text-xl uppercase tracking-tight text-almostBlack">
            Statistical Report &amp; Evidence Documentation
          </h3>
          <p className="text-xs text-editorialMuted">
            Compiled on {report.generated_at} • Normalized density and multi-signal metrics.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          variant="primary"
          size="sm"
          showArrow
          icon={isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          iconPosition="left"
          className="uppercase tracking-wider font-mono text-xs px-5"
        >
          {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-pureWhite border border-lightGrey p-4 shadow-editorial-sm">
          <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider">
            Framing Density
          </div>
          <div className="font-editorial font-black text-2xl text-burntOrange mt-0.5">
            {stats.evidence_density_per_1000_tokens}
          </div>
          <div className="font-mono text-[9px] text-editorialMuted">Indicators per 1k tokens</div>
        </div>

        <div className="bg-pureWhite border border-lightGrey p-4 shadow-editorial-sm">
          <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider">
            Sentiment Valence
          </div>
          <div className="font-editorial font-black text-2xl text-almostBlack mt-0.5">
            {stats.sentiment_score > 0 ? `+${stats.sentiment_score}` : stats.sentiment_score}
          </div>
          <div className="font-mono text-[9px] text-editorialMuted">Primary: {stats.primary_emotion}</div>
        </div>

        <div className="bg-pureWhite border border-lightGrey p-4 shadow-editorial-sm">
          <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider">
            Discovered Candidates
          </div>
          <div className="font-editorial font-black text-2xl text-almostBlack mt-0.5">
            {stats.discovery_candidates_total}
          </div>
          <div className="font-mono text-[9px] text-emerald-700 font-bold">
            {stats.verified_same_event_count} Verified Same-Event
          </div>
        </div>

        <div className="bg-pureWhite border border-lightGrey p-4 shadow-editorial-sm">
          <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider">
            Document Scope
          </div>
          <div className="font-editorial font-black text-2xl text-almostBlack mt-0.5">
            {stats.word_count}
          </div>
          <div className="font-mono text-[9px] text-editorialMuted">
            {stats.sentence_count} sentences • {stats.char_count} chars
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Chart 1: Framing Category Indicators */}
        <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">
                FRAMING INDICATORS BY CATEGORY
              </span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {framingCategoryData.length} AXES
            </span>
          </div>

          {framingCategoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center font-mono text-xs text-editorialMuted">
              No high-intensity framing indicators observed.
            </div>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={framingCategoryData}
                  layout="vertical"
                  margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
                  barSize={16}
                  maxBarSize={18}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#76726B' }}
                    axisLine={{ stroke: '#E5E3DE' }}
                    tickLine={{ stroke: '#E5E3DE' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={130}
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 600, fill: '#171717' }}
                    axisLine={{ stroke: '#E5E3DE' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #2A2A2A',
                      color: '#F7F5F0',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                    }}
                    formatter={(value) => [`${value} findings`, 'Count']}
                  />
                  <Bar dataKey="count" background={{ fill: '#F7F5F0' }}>
                    {framingCategoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#E85D26' : '#171717'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Sentiment Valence Composition */}
        <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">
                SENTIMENT VALENCE COMPOSITION
              </span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              POLARITY RATIO
            </span>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #2A2A2A',
                    color: '#F7F5F0',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [`${value}%`, 'Ratio']}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology and Limitations Callout */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-lightGrey">
          <Shield className="w-4 h-4 text-burntOrange" />
          <span className="editorial-eyebrow text-burntOrange">
            METHODOLOGY &amp; ANALYTICAL TRANSPARENCY
          </span>
        </div>
        <div className="text-xs text-almostBlack space-y-2 leading-relaxed">
          <p>
            <strong>System Methodology:</strong> {report.methodology_summary}
          </p>
          <div className="pt-2 border-t border-lightGrey/60">
            <strong className="font-mono text-[10px] uppercase text-almostBlack block mb-1">
              Documented Limitations:
            </strong>
            <ul className="list-disc list-inside space-y-1 text-editorialMuted text-[11px]">
              {report.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
