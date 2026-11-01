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
  FullAnalysisReport,
} from '../../types';
import EmotionAnalysisChart from '../charts/EmotionAnalysisChart';
import EntityAnalysisChart from '../charts/EntityAnalysisChart';
import FramingAnalysisChart from '../charts/FramingAnalysisChart';
import LanguageDistributionChart from '../charts/LanguageDistributionChart';

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
          <span className="font-bold text-almostBlack">ZERO FABRICATED METRICS</span>
        </div>
      </div>

      {/* Row 1: Emotion Analysis Chart + Entity Analysis Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: Emotion Vector Distribution */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between">
          <EmotionAnalysisChart emotion={emotion} />
        </div>

        {/* Chart 2: Entity Class Density */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between">
          <EntityAnalysisChart entities={entities} />
        </div>
      </div>

      {/* Row 2: Framing Signals by Axis + Cross-Language Coverage Parity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 3: Framing Findings by Category */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between">
          <FramingAnalysisChart framing={framing} />
        </div>

        {/* Chart 4: Candidate Language Distribution */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between">
          <LanguageDistributionChart candidates={candidates} />
        </div>
      </div>
    </div>
  );
}
