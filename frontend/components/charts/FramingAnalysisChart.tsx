'use client';

import React, { useState, useEffect } from 'react';
import { FramingAnalysisResult, FramingEvidence } from '../../types';
import { Shield, Info, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FramingAnalysisChartProps {
  framing: FramingAnalysisResult | null;
  compact?: boolean;
}

interface FramingBarItem {
  categoryKey: string;
  categoryLabel: string;
  count: number;
  pctOfTotal: number;
  sampleQuotes: string[];
  evidenceStrength: string;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  LOADED_LANGUAGE: 'Loaded Language',
  SENSATIONALISM_EXAGGERATION: 'Sensationalism & Exaggeration',
  THREAT_FRAMING: 'Threat & Fear Framing',
  FEAR_APPEAL: 'Threat & Fear Framing',
  ACTOR_PORTRAYAL: 'Actor Agency & Portrayal',
  IN_GROUP_OUT_GROUP: 'In-Group vs Out-Group',
  SYMPATHY_APPEAL: 'Sympathy & Victim Appeal',
  GENERALIZATION: 'Sweeping Generalization',
  HEDGING_QUALIFYING: 'Hedging & Evasive Qualification',
  GOVERNMENT_CRITICAL: 'Institutional & Govt Critique',
  ATTRIBUTION_OF_ALLEGED_FACTS: 'Attribution of Allegations',
};

export default function FramingAnalysisChart({
  framing,
  compact = false,
}: FramingAnalysisChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!framing) {
    return (
      <div className="p-8 bg-warmOffWhite border border-lightGrey text-center space-y-2">
        <Shield className="w-8 h-8 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="font-mono text-xs font-bold uppercase text-almostBlack">
          No Framing Analysis Loaded
        </div>
        <p className="text-xs text-editorialMuted max-w-sm mx-auto">
          Ingest an article to run deterministic lexical framing and actor agency analysis.
        </p>
      </div>
    );
  }

  const findings: FramingEvidence[] = framing.findings || [];
  const totalFindings = findings.length;

  // Aggregate findings by category
  const categoryMap = new Map<string, {
    count: number;
    quotes: string[];
    strengths: string[];
  }>();

  findings.forEach((f) => {
    const key = f.category || 'OTHER';
    const existing = categoryMap.get(key) || { count: 0, quotes: [], strengths: [] };
    existing.count += 1;
    if (f.exact_text && existing.quotes.length < 2) {
      existing.quotes.push(f.exact_text);
    }
    if (f.evidence_strength) {
      existing.strengths.push(f.evidence_strength);
    }
    categoryMap.set(key, existing);
  });

  // If category_counts has entries not in findings
  if (categoryMap.size === 0 && framing.category_counts) {
    Object.entries(framing.category_counts).forEach(([cat, cnt]) => {
      if (cnt > 0) {
        categoryMap.set(cat, { count: cnt, quotes: [], strengths: [] });
      }
    });
  }

  // Build sorted array descending by count
  const chartData: FramingBarItem[] = Array.from(categoryMap.entries())
    .map(([key, data]) => {
      const displayName = CATEGORY_DISPLAY_NAMES[key] || key.replace(/_/g, ' ');
      const pctOfTotal = totalFindings > 0 ? Math.round((data.count / totalFindings) * 100) : 0;
      const primaryStrength = data.strengths[0] || 'medium';
      return {
        categoryKey: key,
        categoryLabel: displayName,
        count: data.count,
        pctOfTotal,
        sampleQuotes: data.quotes,
        evidenceStrength: primaryStrength,
      };
    })
    .sort((a, b) => b.count - a.count);

  const activeCategoriesCount = chartData.length;
  const isZeroFindings = totalFindings === 0;
  const isSingleCategory = activeCategoriesCount === 1;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Controlled height so bars never become giant monoliths
  const chartHeight = Math.max(130, Math.min(260, chartData.length * 46 + 40));

  // Determine dominant framing axis
  const topCategory = chartData[0];

  return (
    <div className="space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-lightGrey">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-burntOrange" />
          <span className="editorial-eyebrow text-burntOrange">
            FRAMING &amp; RHETORICAL SIGNALS
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 bg-warmOffWhite border border-lightGrey text-almostBlack font-bold uppercase">
            {totalFindings} {totalFindings === 1 ? 'SIGNAL' : 'SIGNALS'} DETECTED
          </span>
          <span className="px-2 py-0.5 bg-burntOrange text-pureWhite font-bold uppercase">
            DENSITY: {framing.density_per_1000_tokens.toFixed(1)}/1K
          </span>
        </div>
      </div>

      {isZeroFindings ? (
        <div className="p-8 bg-warmOffWhite border border-lightGrey text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto stroke-[1.25]" />
          <div className="font-mono text-xs font-bold uppercase text-almostBlack">
            Zero Framing Indicators Observed
          </div>
          <p className="text-xs text-editorialMuted max-w-sm mx-auto leading-relaxed">
            The reporting adheres strictly to neutral descriptive standards. No loaded vocabulary, asymmetrical agency, or threat appeals were found above heuristic thresholds.
          </p>
        </div>
      ) : (
        <>
          {/* Main Bar Chart Container */}
          <div className="w-full">
            {isMounted ? (
              <div style={{ height: `${chartHeight}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 8, right: 40, left: 20, bottom: 8 }}
                    barSize={18}
                    maxBarSize={20}
                  >
                    <XAxis
                      type="number"
                      domain={[0, Math.max(maxCount, 2)]}
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#76726B' }}
                      axisLine={{ stroke: '#E5E3DE' }}
                      tickLine={{ stroke: '#E5E3DE' }}
                    />
                    <YAxis
                      dataKey="categoryLabel"
                      type="category"
                      width={160}
                      tick={{
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 600,
                        fill: '#171717',
                      }}
                      axisLine={{ stroke: '#E5E3DE' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(232, 93, 38, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as FramingBarItem;
                          return (
                            <div className="bg-almostBlack text-pureWhite border border-darkCharcoal p-3 shadow-editorial-md font-mono text-xs space-y-1.5 max-w-xs">
                              <div className="flex items-center justify-between gap-2 border-b border-darkCharcoal pb-1">
                                <span className="font-bold uppercase text-burntOrange">
                                  {data.categoryLabel}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-pureWhite/10 font-bold">
                                  {data.count} ({data.pctOfTotal}%)
                                </span>
                              </div>
                              <div className="text-[11px] text-warmOffWhite/80">
                                <div>Normalized Share: {data.pctOfTotal}% of signals</div>
                                <div>Intensity: {data.evidenceStrength}</div>
                              </div>
                              {data.sampleQuotes.length > 0 && (
                                <div className="pt-1 border-t border-darkCharcoal/60 text-[10px] text-warmOffWhite/70 italic">
                                  Spans: &quot;{data.sampleQuotes[0]}&quot;
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      background={{ fill: '#F7F5F0' }}
                      label={{
                        position: 'right',
                        formatter: (val: any) => `${val} (${Math.round((val / totalFindings) * 100)}%)`,
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 600,
                        fill: '#171717',
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.categoryKey}`}
                          fill={index === 0 ? '#E85D26' : '#2A2A2A'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{ height: `${chartHeight}px` }}
                className="w-full bg-warmOffWhite animate-pulse border border-lightGrey"
              />
            )}
          </div>

          {/* Grounded Insight Card */}
          <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] font-bold text-burntOrange uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Linguistic Framing Interpretation
              </span>
              <span className="font-mono text-[10px] text-editorialMuted">
                Coverage: {framing.evidence_coverage_percentage ?? 0}% sentences
              </span>
            </div>

            {isSingleCategory ? (
              <div className="space-y-1">
                <p className="text-xs text-almostBlack leading-relaxed">
                  <strong>Single-Axis Pattern:</strong> All <strong>{totalFindings}</strong> detected indicators concentrate under <strong>{topCategory.categoryLabel}</strong> (100% of detected framing signals, density {framing.density_per_1000_tokens.toFixed(1)}/1k tokens).
                </p>
                <div className="text-[11px] text-editorialMuted flex items-start gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-burntOrange shrink-0 mt-0.5" />
                  <span>
                    No other rhetorical categories (threat framing, in-group polarization, or sympathy appeals) met detection thresholds.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-almostBlack leading-relaxed">
                Multi-axis framing distribution: <strong>{topCategory.categoryLabel}</strong> constitutes the leading framing signal ({topCategory.count} instances, {topCategory.pctOfTotal}% of signals), followed by {chartData.slice(1).map((c) => `${c.categoryLabel} (${c.count})`).join(', ')}.
              </p>
            )}

            {/* Structured Category Badges Row */}
            <div className="pt-2 border-t border-lightGrey/60 flex flex-wrap gap-1.5">
              {chartData.map((c) => (
                <span
                  key={c.categoryKey}
                  className="font-mono text-[10px] px-2 py-0.5 bg-pureWhite border border-lightGrey text-almostBlack flex items-center gap-1"
                >
                  <strong className="text-burntOrange">{c.categoryLabel}:</strong> {c.count} ({c.pctOfTotal}%)
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
