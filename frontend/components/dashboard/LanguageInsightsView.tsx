'use client';

import React, { useState } from 'react';
import { Globe2, GitCompare, Search, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import CrossLanguageDiscoveryView from '../CrossLanguageDiscoveryView';
import CrossLanguageComparisonView from '../CrossLanguageComparisonView';
import {
  IngestedArticle,
  EventProfile,
  LanguageQuery,
  ArticleCandidate,
  ProviderStatusReport,
  CrossLanguageComparisonResult
} from '../../types';
import { Button } from '../ui/Button';

interface LanguageInsightsViewProps {
  article: IngestedArticle | null;
  eventProfile: EventProfile | null;
  queries: LanguageQuery[];
  candidates: ArticleCandidate[];
  providerReports: ProviderStatusReport[];
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
  onRunSearch: () => void;
  isSearching: boolean;
  selectedCandidateIds: string[];
  onToggleCandidateSelect: (id: string) => void;
  onSelectAllEligible: () => void;
  onClearCandidateSelection: () => void;
  onCompareSelected: () => void;
  isComparing: boolean;
  comparison?: CrossLanguageComparisonResult;
  onNavigateTab: (tab: any) => void;
}

export default function LanguageInsightsView({
  article,
  eventProfile,
  queries,
  candidates,
  providerReports,
  selectedLanguages,
  onToggleLanguage,
  onRunSearch,
  isSearching,
  selectedCandidateIds,
  onToggleCandidateSelect,
  onSelectAllEligible,
  onClearCandidateSelection,
  onCompareSelected,
  isComparing,
  comparison,
  onNavigateTab,
}: LanguageInsightsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'discovery' | 'comparison'>('discovery');

  if (!article || !eventProfile) {
    return (
      <div className="p-16 bg-pureWhite border border-lightGrey text-center space-y-4">
        <Globe2 className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h3 className="font-editorial font-bold text-lg uppercase text-almostBlack tracking-tight">
            No Event Profile Available
          </h3>
          <p className="text-xs text-editorialMuted max-w-md mx-auto leading-relaxed">
            Ingest an article to extract its core event representation, generate multilingual search queries,
            and discover same-event reporting across English, Hindi, Kannada, Telugu, and Tamil.
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
            <span className="editorial-eyebrow text-burntOrange">CROSS-LINGUISTIC VERIFICATION</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              {'//'} SAME-EVENT MATCHING &amp; DISCOVERY
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack mt-1">
            Multilingual News Discovery &amp; Divergence Analysis
          </h2>
          <p className="text-xs text-editorialMuted max-w-xl leading-relaxed">
            Evaluates candidate reporting retrieved from Google News RSS &amp; GDELT using cross-lingual
            semantic vectors, entity overlap, and action concordance.
          </p>
        </div>

        {/* Sub-tab Switcher: Discovery vs Comparison */}
        <div className="flex border border-lightGrey bg-warmOffWhite p-1">
          <button
            onClick={() => setActiveSubTab('discovery')}
            className={`px-4 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
              activeSubTab === 'discovery'
                ? 'bg-almostBlack text-pureWhite shadow-xs'
                : 'text-editorialMuted hover:text-almostBlack'
            }`}
          >
            Discovery &amp; Matches ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`px-4 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
              activeSubTab === 'comparison'
                ? 'bg-almostBlack text-pureWhite shadow-xs'
                : 'text-editorialMuted hover:text-almostBlack'
            }`}
          >
            Framing Comparison {comparison ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'discovery' ? (
        <CrossLanguageDiscoveryView
          candidates={candidates}
          providerReports={providerReports}
          queries={queries}
          selectedLanguages={selectedLanguages}
          onToggleLanguage={onToggleLanguage}
          onRunSearch={onRunSearch}
          isSearching={isSearching}
          selectedCandidateIds={selectedCandidateIds}
          onToggleCandidateSelect={onToggleCandidateSelect}
          onSelectAllEligible={onSelectAllEligible}
          onClearCandidateSelection={onClearCandidateSelection}
          onCompareSelected={() => {
            onCompareSelected();
            setActiveSubTab('comparison');
          }}
          isComparing={isComparing}
        />
      ) : (
        <CrossLanguageComparisonView
          comparison={comparison}
          baseArticleTitle={article.metadata.title || 'Submitted Article'}
          onGoToDiscovery={() => setActiveSubTab('discovery')}
        />
      )}
    </div>
  );
}
