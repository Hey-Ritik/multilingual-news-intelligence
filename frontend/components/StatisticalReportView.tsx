import React, { useState } from 'react';
import { FullAnalysisReport } from '../types';
import { downloadPdfReport } from '../lib/api';
import { BarChart3, Download, PieChart, FileText, Loader2, CheckCircle, Shield } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart as RechartsPie
} from 'recharts';

interface StatisticalReportViewProps {
  report?: FullAnalysisReport;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function StatisticalReportView({
  report,
  onGenerateReport,
  isGenerating
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="font-bold text-slate-800 text-sm">Generate Comprehensive Statistical Report</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
          Synthesizes all linguistic findings, emotional classifications, entity distributions,
          and cross-language verification data into an academic report.
        </p>
        <button
          type="button"
          onClick={onGenerateReport}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {isGenerating ? 'Synthesizing Report...' : 'Compile Statistical Report &amp; PDF'}
        </button>
      </div>
    );
  }

  const stats = report.statistics;

  // Prepare framing category bar data
  const framingCategoryData = Object.entries(stats.framing_indicators_by_category).map(([cat, cnt]) => ({
    name: cat.replace(/_/g, ' '),
    count: cnt
  }));

  // Sentiment distribution pie data
  const sentimentPieData = [
    { name: 'Positive', value: Math.round(report.sentiment.positive_score * 100), color: '#10b981' },
    { name: 'Neutral', value: Math.round(report.sentiment.neutral_score * 100), color: '#94a3b8' },
    { name: 'Negative', value: Math.round(report.sentiment.negative_score * 100), color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Download Action */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> Report Ready
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {report.report_id}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Statistical Report &amp; Evidence Documentation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compiled on {report.generated_at} • Normalized density and multi-signal metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition"
        >
          {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">Framing Density</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">
            {stats.evidence_density_per_1000_tokens}
          </div>
          <div className="text-[11px] text-slate-400">Indicators per 1k tokens</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">Sentiment Valence</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.sentiment_score > 0 ? `+${stats.sentiment_score}` : stats.sentiment_score}
          </div>
          <div className="text-[11px] text-slate-400">Primary Emotion: {stats.primary_emotion}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">Discovered Candidates</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.discovery_candidates_total}
          </div>
          <div className="text-[11px] text-slate-400">{stats.verified_same_event_count} Verified Same-Event</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">Document Scope</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.word_count}
          </div>
          <div className="text-[11px] text-slate-400">{stats.sentence_count} sentences • {stats.char_count} chars</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Framing Category Indicators */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" /> Framing Indicators by Category
          </h4>
          {framingCategoryData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">
              No high-intensity framing indicators observed.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={framingCategoryData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} findings`, 'Count']} />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]}>
                    {framingCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Sentiment Valence Composition */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" /> Sentiment Valence Composition
          </h4>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Ratio']} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology and Limitations Accordion/Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" /> Methodology &amp; Analytical Transparency
        </h4>
        <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
          <p><strong>System Methodology:</strong> {report.methodology_summary}</p>
          <div>
            <strong>Documented Limitations:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
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

