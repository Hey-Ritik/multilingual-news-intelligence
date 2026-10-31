'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import FramingAnalysisView from '../FramingAnalysisView';
import { IngestedArticle, FramingAnalysisResult } from '../../types';
import { Button } from '../ui/Button';

interface BiasToxicityViewProps {
  article: IngestedArticle | null;
  framing: FramingAnalysisResult | null;
  onNavigateTab: (tab: any) => void;
}

export default function BiasToxicityView({
  article,
  framing,
  onNavigateTab,
}: BiasToxicityViewProps) {
  if (!article || !framing) {
    return (
      <div className="p-16 bg-pureWhite border border-lightGrey text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h3 className="font-editorial font-bold text-lg uppercase text-almostBlack tracking-tight">
            No Bias &amp; Framing Analysis Loaded
          </h3>
          <p className="text-xs text-editorialMuted max-w-md mx-auto leading-relaxed">
            Ingest an article to inspect grounded textual framing, actor agency distributions, passive voice
            prominence, and toxicity detection with exact character-offset evidence.
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
            <span className="editorial-eyebrow text-burntOrange">EXPLAINABLE FRAMING &amp; TOXICITY AUDIT</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              ({framing.findings.length} GROUNDED OBSERVATIONS)
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack mt-1">
            Actor Agency, Quotation Parity &amp; Lexical Salience
          </h2>
          <p className="text-xs text-editorialMuted max-w-xl leading-relaxed">
            Every highlighted passage corresponds to deterministic offset markers in the original news text.
            We do not assign arbitrary &quot;bias percentages&quot;.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-warmOffWhite border border-lightGrey font-bold text-almostBlack">
            DENSITY: {framing.density_per_1000_tokens.toFixed(1)}/1k
          </span>
          <span className="px-3 py-1.5 bg-burntOrange text-pureWhite font-bold">
            {framing.findings.length} SIGNALS
          </span>
        </div>
      </div>

      {/* Existing Full FramingAnalysisView Component */}
      <FramingAnalysisView originalText={article.text} framing={framing} />
    </div>
  );
}
