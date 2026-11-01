'use client';

import React, { useState, useEffect } from 'react';
import { ArticleCandidate, CandidateOutcome } from '../../types';
import { Globe2, Info, CheckCircle2, GitCompare, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface LanguageDistributionChartProps {
  candidates: ArticleCandidate[];
  compact?: boolean;
}

interface LanguageBarItem {
  code: string;
  name: string;
  count: number;
  pctOfTotal: number;
  verifiedCount: number;
  possibleCount: number;
  publishers: string[];
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English (EN)',
  hi: 'Hindi (HI)',
  kn: 'Kannada (KN)',
  te: 'Telugu (TE)',
  ta: 'Tamil (TA)',
};

export default function LanguageDistributionChart({
  candidates,
  compact = false,
}: LanguageDistributionChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalCandidates = candidates ? candidates.length : 0;

  if (totalCandidates === 0) {
    return (
      <div className="p-8 bg-warmOffWhite border border-lightGrey text-center space-y-2">
        <Globe2 className="w-8 h-8 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="font-mono text-xs font-bold uppercase text-almostBlack">
          No Discovered Candidates Yet
        </div>
        <p className="text-xs text-editorialMuted max-w-sm mx-auto leading-relaxed">
          Select target languages and execute discovery search to retrieve same-event coverage from Google News RSS and GDELT across 5 Indic languages.
        </p>
      </div>
    );
  }

  // Aggregate candidate counts by language
  const langMap = new Map<string, {
    count: number;
    verified: number;
    possible: number;
    publishers: Set<string>;
  }>();

  candidates.forEach((cand) => {
    const code = (cand.language || 'en').toLowerCase();
    const existing = langMap.get(code) || {
      count: 0,
      verified: 0,
      possible: 0,
      publishers: new Set<string>(),
    };

    existing.count += 1;
    const outcomeNorm = String(cand.outcome).toUpperCase();
    if (outcomeNorm.includes('VERIFIED')) {
      existing.verified += 1;
    } else if (outcomeNorm.includes('POSSIBLE') || outcomeNorm.includes('LIKELY')) {
      existing.possible += 1;
    }

    if (cand.publisher) {
      existing.publishers.add(cand.publisher);
    }
    langMap.set(code, existing);
  });

  // Build sorted array descending by candidate count
  const chartData: LanguageBarItem[] = Array.from(langMap.entries())
    .map(([code, data]) => {
      const name = LANGUAGE_NAMES[code] || `${code.toUpperCase()} (${code.toUpperCase()})`;
      const pctOfTotal = Math.round((data.count / totalCandidates) * 100);
      return {
        code,
        name,
        count: data.count,
        pctOfTotal,
        verifiedCount: data.verified,
        possibleCount: data.possible,
        publishers: Array.from(data.publishers),
      };
    })
    .sort((a, b) => b.count - a.count);

  const activeLanguagesCount = chartData.length;
  const isSingleLanguage = activeLanguagesCount === 1;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const totalVerified = chartData.reduce((acc, cur) => acc + cur.verifiedCount, 0);

  // Controlled height so bars never become giant monoliths
  const chartHeight = Math.max(130, Math.min(250, chartData.length * 46 + 40));

  // Determine top language
  const topLanguage = chartData[0];

  return (
    <div className="space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-lightGrey">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-burntOrange" />
          <span className="editorial-eyebrow text-burntOrange">
            CROSS-LANGUAGE COVERAGE DISTRIBUTION
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 bg-warmOffWhite border border-lightGrey text-almostBlack font-bold uppercase">
            {totalCandidates} {totalCandidates === 1 ? 'CANDIDATE' : 'CANDIDATES'}
          </span>
          <span className="px-2 py-0.5 bg-almostBlack text-pureWhite font-bold uppercase">
            {activeLanguagesCount} {activeLanguagesCount === 1 ? 'LANGUAGE' : 'LANGUAGES'}
          </span>
          <span className="px-2 py-0.5 bg-burntOrange text-pureWhite font-bold uppercase">
            {totalVerified} VERIFIED
          </span>
        </div>
      </div>

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
                  dataKey="name"
                  type="category"
                  width={120}
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
                      const data = payload[0].payload as LanguageBarItem;
                      return (
                        <div className="bg-almostBlack text-pureWhite border border-darkCharcoal p-3 shadow-editorial-md font-mono text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between gap-2 border-b border-darkCharcoal pb-1">
                            <span className="font-bold uppercase text-burntOrange">
                              {data.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-pureWhite/10 font-bold">
                              {data.count} ({data.pctOfTotal}%)
                            </span>
                          </div>
                          <div className="text-[11px] text-warmOffWhite/80 space-y-0.5">
                            <div>Verified Matches: {data.verifiedCount}</div>
                            <div>Possible Matches: {data.possibleCount}</div>
                            {data.publishers.length > 0 && (
                              <div className="text-editorialMuted truncate text-[10px] pt-1">
                                Sources: {data.publishers.slice(0, 3).join(', ')}
                              </div>
                            )}
                          </div>
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
                    formatter: (val: any) => `${val} (${Math.round((val / totalCandidates) * 100)}%)`,
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                    fill: '#171717',
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.code}`}
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

      {/* Grounded Interpretation Card */}
      <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] font-bold text-burntOrange uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Coverage Distribution Analysis
          </span>
          <span className="font-mono text-[10px] text-editorialMuted">
            {totalVerified} of {totalCandidates} Verified Same-Event
          </span>
        </div>

        {isSingleLanguage ? (
          <div className="space-y-1">
            <p className="text-xs text-almostBlack leading-relaxed">
              <strong>Monolingual Retrieval:</strong> All <strong>{totalCandidates}</strong> discovered candidates were retrieved in <strong>{topLanguage.name}</strong>.
            </p>
            <div className="text-[11px] text-editorialMuted flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-burntOrange shrink-0 mt-0.5" />
              <span>
                Other selected language queries did not return matching articles meeting the cosine similarity threshold (&ge; 0.60).
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-almostBlack leading-relaxed">
            Multilingual event coverage confirmed across <strong>{activeLanguagesCount} languages</strong>. <strong>{topLanguage.name}</strong> provides the highest candidate density ({topLanguage.count} articles, {topLanguage.pctOfTotal}% of total), with concurrent coverage in {chartData.slice(1).map((c) => `${c.name} (${c.count})`).join(', ')}.
          </p>
        )}

        {/* Breakdown Language Badges */}
        <div className="pt-2 border-t border-lightGrey/60 flex flex-wrap gap-1.5">
          {chartData.map((c) => (
            <span
              key={c.code}
              className="font-mono text-[10px] px-2 py-0.5 bg-pureWhite border border-lightGrey text-almostBlack flex items-center gap-1"
            >
              <strong className="text-burntOrange">{c.name}:</strong> {c.count} items ({c.verifiedCount} verified)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
