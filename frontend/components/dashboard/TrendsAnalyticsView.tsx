'use client';

import React from 'react';
import { BarChart3, PieChart as PieIcon, ArrowRight, Activity, Globe, Shield, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  IngestedArticle,
  SentimentResult,
  EmotionResult,
  FramingAnalysisResult,
  NamedEntity,
  ArticleCandidate,
  FullAnalysisReport
} from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface TrendsAnalyticsViewProps {
  article: IngestedArticle | null;
  sentiment: SentimentResult | null;
  emotion: EmotionResult | null;
  framing: FramingAnalysisResult | null;
  entities: NamedEntity[];
  candidates: ArticleCandidate[];
  fullReport?: FullAnalysisReport;
  onNavigateTab: (tab: any) => void;
}

const SWISS_COLORS = ['#E85D26', '#171717', '#F4A261', '#C7471D', '#76726B', '#D8D5CE'];

export default function TrendsAnalyticsView({
  article,
  sentiment,
  emotion,
  framing,
  entities,
  candidates,
  fullReport,
  onNavigateTab,
}: TrendsAnalyticsViewProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!article || !sentiment || !emotion) {
    return (
      <div className="p-16 bg-pureWhite border border-lightGrey text-center space-y-4">
        <BarChart3 className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h3 className="font-editorial font-bold text-lg uppercase text-almostBlack tracking-tight">
            No Empirical Analytics Yet
          </h3>
          <p className="text-xs text-editorialMuted max-w-md mx-auto leading-relaxed">
            Analytical distributions are generated directly from actual backend NLP results.
            Analyse a news article to inspect emotion vectors, entity frequencies, and framing category counts.
          </p>
        </div>
        <Button
          onClick={() => onNavigateTab('article-analysis')}
          variant="primary"
          size="sm"
          showArrow
          className="uppercase tracking-wider font-mono text-xs"
        >
          Analyze An Article
        </Button>
      </div>
    );
  }

  // 1. Emotion Data (Actual values from detected_emotions)
  const emotionMap: Record<string, number> = {};
  if (emotion && emotion.detected_emotions) {
    emotion.detected_emotions.forEach((e) => {
      emotionMap[e.emotion] = Math.max(emotionMap[e.emotion] || 0, Math.round(e.score * 100));
    });
  }
  if (Object.keys(emotionMap).length === 0 && emotion?.primary_emotion) {
    emotionMap[emotion.primary_emotion] = 100;
  }
  const emotionData = Object.entries(emotionMap).map(([key, score]) => ({
    name: key,
    score,
  }));

  // 2. Entity Types Distribution (Actual counts from extracted entities)
  const entityTypeCounts: Record<string, number> = {};
  entities.forEach((ent) => {
    const label = ent.label || 'OTHER';
    entityTypeCounts[label] = (entityTypeCounts[label] || 0) + 1;
  });
  const entityTypeData = Object.entries(entityTypeCounts).map(([type, count]) => ({
    name: type,
    count,
  }));

  // 3. Framing Findings by Category (Actual counts from framing analyzer)
  const framingCategoryCounts: Record<string, number> = {};
  if (framing && framing.findings) {
    framing.findings.forEach((f) => {
      const cat = f.category.replace(/_/g, ' ');
      framingCategoryCounts[cat] = (framingCategoryCounts[cat] || 0) + 1;
    });
  }
  const framingData = Object.entries(framingCategoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 4. Candidate Language Distribution (Actual discovered candidate counts)
  const candidateLangCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    const l = c.language.toUpperCase();
    candidateLangCounts[l] = (candidateLangCounts[l] || 0) + 1;
  });
  const candidateLangData = Object.entries(candidateLangCounts).map(([lang, count]) => ({
    name: lang,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">EMPIRICAL NLP ANALYTICS</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              {'//'} ACTUAL BACKEND DISTRIBUTIONS
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack mt-1">
            Quantitative Breakdown &amp; Category Distributions
          </h2>
          <p className="text-xs text-editorialMuted max-w-xl leading-relaxed">
            All visual charts are derived strictly from deterministic pipeline outputs: lexical frequencies,
            emotion vectors, entity labels, and candidate counts.
          </p>
        </div>

        <div className="font-mono text-xs text-editorialMuted bg-warmOffWhite border border-lightGrey px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-burntOrange" />
          <span>ZERO FABRICATED METRICS</span>
        </div>
      </div>

      {/* Two Column Chart Grid: Emotion Distribution + Entity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: Emotion Distribution */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">EMOTION VECTOR SCORES (%)</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {emotion.primary_emotion} DOMINANT
            </span>
          </div>

          <p className="text-xs text-editorialMuted">
            Percentage distribution of fine-grained emotion classes across the article:
          </p>

          <div className="h-64 w-full pt-2">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #2A2A2A',
                      color: '#F7F5F0',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="score">
                    {emotionData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#E85D26' : index % 2 === 0 ? '#171717' : '#F4A261'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-warmOffWhite/60 animate-pulse border border-lightGrey" />
            )}
          </div>
        </div>

        {/* Chart 2: Entity Type Frequencies */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">ENTITY CLASS DENSITY</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {entities.length} TOTAL ENTITIES
            </span>
          </div>

          <p className="text-xs text-editorialMuted">
            Aggregated entity frequency count by named entity classification:
          </p>

          {entityTypeData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entityTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #2A2A2A',
                        color: '#F7F5F0',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#171717" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-warmOffWhite/60 animate-pulse border border-lightGrey" />
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center font-mono text-xs text-editorialMuted">
              No entities found in this article.
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Framing Findings + Cross-Language Coverage parity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 3: Framing Findings by Category */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">FRAMING SIGNALS BY AXIS</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {framing?.findings.length || 0} SIGNALS
            </span>
          </div>

          {framingData.length > 0 ? (
            <div className="space-y-3 pt-2">
              {framingData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-almostBlack uppercase font-bold">{item.name}</span>
                    <span className="text-burntOrange font-bold">{item.value} signals</span>
                  </div>
                  <div className="w-full bg-warmOffWhite h-2 border border-lightGrey">
                    <div
                      className="h-full bg-burntOrange"
                      style={{
                        width: `${Math.min(100, (item.value / (framing?.findings.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-editorialMuted">
              No framing signals detected in the active article.
            </div>
          )}
        </div>

        {/* Chart 4: Candidate Language Distribution */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">DISCOVERED COVERAGE BY LANGUAGE</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {candidates.length} CANDIDATES
            </span>
          </div>

          {candidateLangData.length > 0 ? (
            <div className="h-56 w-full pt-2">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={candidateLangData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #2A2A2A',
                        color: '#F7F5F0',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#E85D26" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-warmOffWhite/60 animate-pulse border border-lightGrey" />
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-editorialMuted space-y-2">
              <div>No cross-language candidates retrieved yet.</div>
              <Button
                onClick={() => onNavigateTab('language-insights')}
                variant="outline"
                size="xs"
                showArrow
              >
                Run Cross-Language Discovery
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
