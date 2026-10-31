'use client';

import React from 'react';
import ArticleSubmission from '../ArticleSubmission';
import ArticleOverview from '../ArticleOverview';
import {
  IngestedArticle,
  LanguageDetectionResult,
  SummaryResult,
  EventProfile,
  NamedEntity,
  ClaimObservation
} from '../../types';
import { FileText, Tag, Quote, Globe, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ArticleAnalysisViewProps {
  article: IngestedArticle | null;
  language: LanguageDetectionResult | null;
  summary: SummaryResult | null;
  eventProfile: EventProfile | null;
  entities: NamedEntity[];
  claims: ClaimObservation[];
  onArticleIngested: (article: IngestedArticle) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  onNavigateTab: (tab: any) => void;
}

export default function ArticleAnalysisView({
  article,
  language,
  summary,
  eventProfile,
  entities,
  claims,
  onArticleIngested,
  isLoading,
  setIsLoading,
  onNavigateTab,
}: ArticleAnalysisViewProps) {
  return (
    <div className="space-y-8">
      {/* Article Input / Ingestion Section */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">INGESTION &amp; TOKENIZATION</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              (Text • URL • PDF)
            </span>
          </div>
          {article && (
            <span className="font-mono text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> ARTICLE LOADED
            </span>
          )}
        </div>

        <ArticleSubmission
          onArticleIngested={onArticleIngested}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>

      {/* Analysis Results (Rendered only when article is loaded) */}
      {article && language && summary && eventProfile ? (
        <div className="space-y-6">
          {/* Main Article Overview & Summary Component */}
          <ArticleOverview
            article={article}
            language={language}
            summary={summary}
            eventProfile={eventProfile}
          />

          {/* Named Entities & Claim Attribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Named Entities */}
            <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-burntOrange" />
                  <span className="editorial-eyebrow text-burntOrange">NAMED ENTITIES</span>
                </div>
                <span className="font-mono text-[10px] text-almostBlack font-bold">
                  {entities.length} EXTRACTED
                </span>
              </div>

              {entities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entities.map((entity, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 bg-warmOffWhite border border-lightGrey text-xs flex items-center gap-2"
                    >
                      <span className="font-editorial font-bold text-almostBlack">
                        {entity.text}
                      </span>
                      <span className="font-mono text-[9px] px-1 bg-pureWhite border border-lightGrey text-editorialMuted uppercase">
                        {entity.label}
                      </span>
                      {entity.confidence > 0 && (
                        <span className="font-mono text-[9px] text-burntOrange font-bold">
                          {Math.round(entity.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-editorialMuted font-mono">
                  No named entities extracted from this passage.
                </div>
              )}
            </div>

            {/* Right: Claims & Quotation Attribution */}
            <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-burntOrange" />
                  <span className="editorial-eyebrow text-burntOrange">CLAIMS &amp; ATTRIBUTION</span>
                </div>
                <span className="font-mono text-[10px] text-almostBlack font-bold">
                  {claims.length} QUOTES
                </span>
              </div>

              {claims.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {claims.map((claim, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-warmOffWhite border border-lightGrey text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-burntOrange uppercase">
                          Speaker: {claim.speaker_or_source || 'Unattributed Source'}
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.2 bg-pureWhite border border-lightGrey text-almostBlack font-semibold">
                          {claim.claim_type}
                        </span>
                      </div>
                      <p className="text-editorialMuted italic leading-relaxed">
                        &quot;{claim.text}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-editorialMuted font-mono">
                  No explicit speaker quotes detected in this passage.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State for Analysis Results */
        <div className="p-12 bg-pureWhite border border-lightGrey text-center space-y-3">
          <FileText className="w-10 h-10 text-lightGrey mx-auto stroke-[1.25]" />
          <div className="space-y-1">
            <h3 className="font-editorial font-bold text-base uppercase text-almostBlack tracking-tight">
              Awaiting Article Ingestion
            </h3>
            <p className="text-xs text-editorialMuted max-w-sm mx-auto leading-relaxed">
              Paste article text, enter a news URL, or select a sample above to view extractive summaries,
              entities, and event representations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
