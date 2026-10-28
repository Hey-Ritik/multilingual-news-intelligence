import React from 'react';
import { CrossLanguageComparisonResult } from '../types';
import { stripHtmlAndEntities } from '../lib/utils';
import { GitCompare, AlertCircle, Layers, ArrowRight, ShieldCheck, Info } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 space-y-4">
        <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h4 className="font-bold text-slate-800 text-base">No Cross-Language Framing Comparisons Generated Yet</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Framing comparisons analyze side-by-side linguistic differences between your submitted article and verified
            same-event coverage in other languages. Head to the <strong>Cross-Language Discovery</strong> tab to discover and select articles.
          </p>
        </div>
        {onGoToDiscovery && (
          <button
            type="button"
            onClick={onGoToDiscovery}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-2 transition"
          >
            Go to Cross-Language Discovery <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-600" />
              Side-by-Side Cross-Language Framing Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-based textual analysis examining headline syntax, actor agency, emotional tone, and omissions.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {comparison.compared_candidates_count} Cross-Language Article Pair(s)
          </span>
        </div>

        {/* Methodology & Limitations Note */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong>Comparative Methodology:</strong> {comparison.methodology} {comparison.limitations_note}
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="space-y-6">
          {comparison.comparisons.map((diff, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" /> Dimension: {diff.dimension}
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Article A */}
                <div className="p-3.5 bg-slate-50/50 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-white font-bold rounded uppercase">
                        {diff.article_a_language} (Original Source)
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{stripHtmlAndEntities(diff.article_a_publisher)}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-2 truncate" title={diff.article_a_title}>
                      {stripHtmlAndEntities(diff.article_a_title)}
                    </div>
                    <blockquote className="font-serif italic text-xs text-slate-800 border-l-2 border-sky-500 pl-2.5 my-2 leading-relaxed">
                      "{stripHtmlAndEntities(diff.article_a_passage)}"
                    </blockquote>
                  </div>
                  {diff.article_a_translation && (
                    <div className="text-[11px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200">
                      Translation note: {diff.article_a_translation}
                    </div>
                  )}
                </div>

                {/* Article B */}
                <div className="p-3.5 bg-slate-50/50 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded uppercase">
                        {diff.article_b_language} (Cross-Language Match)
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{stripHtmlAndEntities(diff.article_b_publisher)}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-2 truncate" title={diff.article_b_title}>
                      {stripHtmlAndEntities(diff.article_b_title)}
                    </div>
                    <blockquote className="font-serif italic text-xs text-slate-800 border-l-2 border-emerald-500 pl-2.5 my-2 leading-relaxed">
                      "{stripHtmlAndEntities(diff.article_b_passage)}"
                    </blockquote>
                  </div>
                  {diff.article_b_translation && (
                    <div className="text-[11px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200">
                      Translation note: {diff.article_b_translation}
                    </div>
                  )}
                </div>
              </div>

              {/* Analytical Breakdown */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">What Differs:</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{diff.what_differs}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Why It Matters:</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{diff.why_it_matters}</p>
                </div>
                {diff.uncertainty_and_alternatives && (
                  <div className="text-slate-500 italic pt-1">
                    <strong>Alternative Interpretations:</strong> {diff.uncertainty_and_alternatives}
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
