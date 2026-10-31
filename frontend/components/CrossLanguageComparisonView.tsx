'use client';

import React from 'react';
import { CrossLanguageComparisonResult } from '../types';
import { stripHtmlAndEntities } from '../lib/utils';
import { Button } from './ui/Button';
import { GitCompare, AlertCircle, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

interface CrossLanguageComparisonViewProps {
  comparison?: CrossLanguageComparisonResult;
  baseArticleTitle: string;
  onGoToDiscovery?: () => void;
}

export default function CrossLanguageComparisonView({
  comparison,
  baseArticleTitle,
  onGoToDiscovery
}: CrossLanguageComparisonViewProps) {
  if (!comparison || comparison.comparisons.length === 0) {
    return (
      <div className="bg-pureWhite border border-lightGrey p-16 text-center space-y-4 shadow-editorial-sm">
        <GitCompare className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h4 className="font-editorial font-bold text-lg uppercase text-almostBlack tracking-tight">
            No Cross-Language Comparisons Generated Yet
          </h4>
          <p className="text-xs text-editorialMuted max-w-lg mx-auto leading-relaxed">
            Framing comparisons analyze side-by-side linguistic differences between your submitted article and verified
            same-event coverage in other languages. Head to the <strong>Discovery &amp; Matches</strong> tab to select articles.
          </p>
        </div>
        {onGoToDiscovery && (
          <Button
            type="button"
            onClick={onGoToDiscovery}
            variant="primary"
            size="sm"
            showArrow
            className="uppercase tracking-wider font-mono text-xs px-5"
          >
            Go to Discovery &amp; Matches
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lightGrey pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-burntOrange" />
              <h3 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
                Side-by-Side Cross-Language Framing Comparison
              </h3>
            </div>
            <p className="text-xs text-editorialMuted mt-0.5">
              Evidence-based textual analysis examining headline syntax, actor agency, emotional tone, and omissions.
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold px-3 py-1 bg-warmOffWhite border border-lightGrey text-almostBlack flex items-center gap-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-burntOrange" />
            {comparison.compared_candidates_count} Cross-Language Article Pair(s)
          </span>
        </div>

        {/* Methodology & Limitations Note */}
        <div className="p-3.5 bg-warmOffWhite border border-lightGrey text-xs text-editorialMuted flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-burntOrange shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono font-bold uppercase text-almostBlack text-[10px]">Comparative Methodology: </span>
            <span>{comparison.methodology} {comparison.limitations_note}</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="space-y-6 pt-2">
          {comparison.comparisons.map((diff, idx) => (
            <div key={idx} className="border border-lightGrey bg-pureWhite shadow-editorial-sm">
              <div className="bg-warmOffWhite px-4 py-2.5 border-b border-lightGrey flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-almostBlack uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-burntOrange" /> Dimension: {diff.dimension}
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Article A */}
                <div className="p-4 bg-warmOffWhite border border-lightGrey flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] px-1.5 py-0.2 bg-almostBlack text-pureWhite font-bold uppercase">
                        {diff.article_a_language} (Primary Input)
                      </span>
                      <span className="font-mono text-[10px] font-bold text-almostBlack">
                        {stripHtmlAndEntities(diff.article_a_publisher)}
                      </span>
                    </div>

                    <div className="font-editorial font-bold text-xs uppercase text-almostBlack truncate" title={diff.article_a_title}>
                      {stripHtmlAndEntities(diff.article_a_title)}
                    </div>

                    <blockquote className="font-serif italic text-xs text-almostBlack border-l-2 border-burntOrange pl-3 my-2 leading-relaxed">
                      &quot;{stripHtmlAndEntities(diff.article_a_passage)}&quot;
                    </blockquote>
                  </div>

                  {diff.article_a_translation && (
                    <div className="text-[10px] font-mono text-editorialMuted italic border-t border-lightGrey/60 pt-1.5">
                      Translation note: {diff.article_a_translation}
                    </div>
                  )}
                </div>

                {/* Article B */}
                <div className="p-4 bg-warmOffWhite border border-lightGrey flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] px-1.5 py-0.2 bg-burntOrange text-pureWhite font-bold uppercase">
                        {diff.article_b_language} (Discovered Coverage)
                      </span>
                      <span className="font-mono text-[10px] font-bold text-almostBlack">
                        {stripHtmlAndEntities(diff.article_b_publisher)}
                      </span>
                    </div>

                    <div className="font-editorial font-bold text-xs uppercase text-almostBlack truncate" title={diff.article_b_title}>
                      {stripHtmlAndEntities(diff.article_b_title)}
                    </div>

                    <blockquote className="font-serif italic text-xs text-almostBlack border-l-2 border-almostBlack pl-3 my-2 leading-relaxed">
                      &quot;{stripHtmlAndEntities(diff.article_b_passage)}&quot;
                    </blockquote>
                  </div>

                  {diff.article_b_translation && (
                    <div className="text-[10px] font-mono text-editorialMuted italic border-t border-lightGrey/60 pt-1.5">
                      Translation note: {diff.article_b_translation}
                    </div>
                  )}
                </div>
              </div>

              {/* Analytical Findings Callout */}
              <div className="px-5 py-4 bg-pureWhite border-t border-lightGrey space-y-2 text-xs">
                <div>
                  <span className="font-mono font-bold text-burntOrange uppercase text-[10px]">What Differs: </span>
                  <span className="text-almostBlack">{diff.what_differs}</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-almostBlack uppercase text-[10px]">Why It Matters: </span>
                  <span className="text-editorialMuted">{diff.why_it_matters}</span>
                </div>
                {diff.uncertainty_and_alternatives && (
                  <div className="text-[10px] font-mono text-editorialMuted border-t border-lightGrey/60 pt-1.5">
                    <strong>Caveat:</strong> {diff.uncertainty_and_alternatives}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
