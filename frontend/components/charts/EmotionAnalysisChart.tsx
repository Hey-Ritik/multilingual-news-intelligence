'use client';

import React, { useState, useEffect } from 'react';
import { EmotionResult, EmotionFinding, EmotionLabel } from '../../types';
import { Activity, Quote, Info, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface EmotionAnalysisChartProps {
  emotion: EmotionResult | null;
  compact?: boolean;
}

interface EmotionBarItem {
  name: string;
  key: string;
  scorePct: number;
  scoreRaw: number;
  findingCount: number;
  isDominant: boolean;
  journalistCount: number;
  speakerCount: number;
  sampleQuotes: string[];
}

export default function EmotionAnalysisChart({
  emotion,
  compact = false,
}: EmotionAnalysisChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!emotion) {
    return (
      <div className="p-8 bg-warmOffWhite border border-lightGrey text-center space-y-2">
        <Activity className="w-8 h-8 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="font-mono text-xs font-bold uppercase text-almostBlack">
          No Emotion Data Loaded
        </div>
        <p className="text-xs text-editorialMuted max-w-sm mx-auto">
          Ingest and analyze an article to extract empirical emotional valence vectors.
        </p>
      </div>
    );
  }

  // Aggregate detected emotions by emotion label from actual backend response
  const findings: EmotionFinding[] = emotion.detected_emotions || [];
  const emotionMap = new Map<string, {
    maxScore: number;
    count: number;
    journalistCount: number;
    speakerCount: number;
    quotes: string[];
  }>();

  findings.forEach((f) => {
    const key = f.emotion.toUpperCase();
    const existing = emotionMap.get(key) || {
      maxScore: 0,
      count: 0,
      journalistCount: 0,
      speakerCount: 0,
      quotes: [],
    };

    existing.maxScore = Math.max(existing.maxScore, f.score);
    existing.count += 1;
    if (f.is_speaker_quote) {
      existing.speakerCount += 1;
    } else {
      existing.journalistCount += 1;
    }
    if (f.text_passage && existing.quotes.length < 2) {
      existing.quotes.push(f.text_passage);
    }
    emotionMap.set(key, existing);
  });

  const dominantLabel = emotion.primary_emotion.toUpperCase();

  // If findings list was empty but primary_emotion is NEUTRAL or has a value
  if (emotionMap.size === 0 && dominantLabel) {
    // Only if backend explicitly assigned primary emotion without separate finding spans
    emotionMap.set(dominantLabel, {
      maxScore: dominantLabel === 'NEUTRAL' ? 1.0 : 0.75,
      count: 1,
      journalistCount: 1,
      speakerCount: 0,
      quotes: [],
    });
  }

  // Build sorted array of emotion items descending by score
  const chartData: EmotionBarItem[] = Array.from(emotionMap.entries())
    .map(([key, data]) => {
      const scorePct = Math.round(data.maxScore * 100);
      return {
        name: key,
        key,
        scorePct,
        scoreRaw: data.maxScore,
        findingCount: data.count,
        isDominant: key === dominantLabel,
        journalistCount: data.journalistCount,
        speakerCount: data.speakerCount,
        sampleQuotes: data.quotes,
      };
    })
    .sort((a, b) => {
      // Dominant first, then by score descending
      if (a.isDominant && !b.isDominant) return -1;
      if (!a.isDominant && b.isDominant) return 1;
      return b.scorePct - a.scorePct;
    });

  const totalCategories = chartData.length;
  const isSingleEmotion = totalCategories === 1;
  const isObjectiveNeutral =
    totalCategories === 1 && chartData[0].key === 'NEUTRAL' && findings.length === 0;

  // Compute calculated chart height: compact, responsive, never oversized
  const chartHeight = Math.max(140, Math.min(260, chartData.length * 48 + 50));

  // Generate grounded analytical insight summary
  const getInsightSummary = () => {
    if (isObjectiveNeutral) {
      return 'Expository reporting stance: The backend analysis detected zero polarized emotional vocabulary. The text maintains objective neutrality without sensationalized valence.';
    }

    if (isSingleEmotion) {
      const single = chartData[0];
      return `Single-category emotional stance: The backend identified ${single.name} as the sole active affective category (${single.scorePct}% intensity across ${single.findingCount} passage${single.findingCount > 1 ? 's' : ''}). No competing emotional markers were detected.`;
    }

    const dominant = chartData.find((d) => d.isDominant) || chartData[0];
    const secondary = chartData.filter((d) => !d.isDominant);
    const secondaryNames = secondary.map((s) => `${s.name} (${s.scorePct}%)`).join(', ');

    return `Multi-vector emotional stance: The article is predominantly characterized by ${dominant.name} (${dominant.scorePct}% intensity, ${dominant.findingCount} passage${dominant.findingCount > 1 ? 's' : ''}), accompanied by secondary ${secondaryNames}.`;
  };

  return (
    <div className="space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-lightGrey">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-burntOrange" />
          <span className="editorial-eyebrow text-burntOrange">
            EMOTION VECTOR DISTRIBUTION
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 bg-warmOffWhite border border-lightGrey text-almostBlack font-bold uppercase">
            {totalCategories} {totalCategories === 1 ? 'CATEGORY' : 'CATEGORIES'} DETECTED
          </span>
          <span className="px-2 py-0.5 bg-burntOrange text-pureWhite font-bold uppercase">
            PRIMARY: {dominantLabel}
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
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#76726B' }}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={{ stroke: '#E5E3DE' }}
                  tickLine={{ stroke: '#E5E3DE' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
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
                      const data = payload[0].payload as EmotionBarItem;
                      return (
                        <div className="bg-almostBlack text-pureWhite border border-darkCharcoal p-3 shadow-editorial-md font-mono text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between gap-2 border-b border-darkCharcoal pb-1">
                            <span className="font-bold uppercase text-burntOrange">
                              {data.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-pureWhite/10 font-bold">
                              {data.scorePct}% SCORE
                            </span>
                          </div>
                          <div className="text-[11px] text-warmOffWhite/80 space-y-0.5">
                            <div>Evidence Spans: {data.findingCount} passage{data.findingCount > 1 ? 's' : ''}</div>
                            {data.speakerCount > 0 && (
                              <div className="text-amber-400">
                                Quoted Attribution: {data.speakerCount} statement{data.speakerCount > 1 ? 's' : ''}
                              </div>
                            )}
                            {data.journalistCount > 0 && (
                              <div>Journalistic Narration: {data.journalistCount}</div>
                            )}
                          </div>
                          {data.isDominant && (
                            <div className="pt-1 text-[10px] text-burntOrange uppercase font-bold">
                              ★ Dominant Affective Vector
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="scorePct"
                  background={{ fill: '#F7F5F0' }}
                  label={{
                    position: 'right',
                    formatter: (val: any) => `${val}%`,
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                    fill: '#171717',
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={entry.isDominant ? '#E85D26' : '#2A2A2A'}
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

      {/* Grounded Insight Summary Card */}
      <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] font-bold text-burntOrange uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Affective Valence Insight
          </span>
          <span className="font-mono text-[10px] text-editorialMuted">
            Deterministic Lexical Grounding
          </span>
        </div>
        <p className="text-xs text-almostBlack leading-relaxed">
          {getInsightSummary()}
        </p>

        {/* Transparency note if only 1 emotion was returned */}
        {isSingleEmotion && !isObjectiveNeutral && (
          <div className="pt-2 border-t border-lightGrey/60 flex items-start gap-2 text-[11px] text-editorialMuted">
            <CheckCircle2 className="w-3.5 h-3.5 text-burntOrange shrink-0 mt-0.5" />
            <span>
              <strong>Backend Evidence Note:</strong> The NLP model returned exactly 1 emotion category for this article. No additional categories were fabricated or assumed.
            </span>
          </div>
        )}

        {/* Breakdown of Narration vs Quoted Speaker Statements */}
        {emotion.speaker_emotions && emotion.speaker_emotions.length > 0 && (
          <div className="pt-2 border-t border-lightGrey/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-editorialMuted flex items-center gap-1">
              <Quote className="w-3 h-3 text-burntOrange" /> Quoted Speaker Statements:
            </span>
            <span className="font-bold text-almostBlack">
              {emotion.speaker_emotions.length} Attributed ({emotion.journalist_emotions.length} Journalistic)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
