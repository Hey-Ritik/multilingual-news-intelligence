'use client';

import React, { useState } from 'react';
import { ArticleCandidate, ProviderStatusReport, LanguageQuery, CandidateOutcome, RetrievalStatus } from '../types';
import { stripHtmlAndEntities } from '../lib/utils';
import { Button } from './ui/Button';
import {
  Globe2,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  GitCompare,
  CheckSquare,
  HelpCircle,
  Info
} from 'lucide-react';

interface CrossLanguageDiscoveryViewProps {
  candidates: ArticleCandidate[];
  providerReports: ProviderStatusReport[];
  queries: LanguageQuery[];
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
  onRunSearch: () => void;
  isSearching: boolean;
  selectedCandidateIds: string[];
  onToggleCandidateSelect: (candidateId: string) => void;
  onSelectAllEligible: () => void;
  onClearCandidateSelection: () => void;
  onCompareSelected: () => void;
  isComparing: boolean;
}

const ALL_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' }
];

export default function CrossLanguageDiscoveryView({
  candidates,
  providerReports,
  queries,
  selectedLanguages,
  onToggleLanguage,
  onRunSearch,
  isSearching,
  selectedCandidateIds,
  onToggleCandidateSelect,
  onSelectAllEligible,
  onClearCandidateSelection,
  onCompareSelected,
  isComparing
}: CrossLanguageDiscoveryViewProps) {
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  const isEligible = (outcome: CandidateOutcome | string): boolean => {
    const norm = String(outcome).toUpperCase().replace(/_/g, ' ');
    return norm.includes('VERIFIED') || norm.includes('POSSIBLE') || norm.includes('LIKELY');
  };

  const eligibleCount = candidates.filter(c => isEligible(c.outcome)).length;

  const getOutcomeBadge = (outcome: CandidateOutcome | string) => {
    const norm = String(outcome).toUpperCase().replace(/_/g, ' ');

    if (norm.includes('VERIFIED')) {
      return (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED SAME EVENT
        </span>
      );
    }
    if (norm.includes('POSSIBLE') || norm.includes('LIKELY')) {
      return (
        <span className="px-2 py-0.5 bg-warmOrange/20 text-almostBlack border border-burntOrange font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-burntOrange" /> POSSIBLE MATCH
        </span>
      );
    }
    if (norm.includes('RELATED')) {
      return (
        <span className="px-2 py-0.5 bg-warmOffWhite text-editorialMuted border border-lightGrey font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-editorialMuted" /> RELATED TOPIC
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-warmOffWhite text-editorialMuted border border-lightGrey font-mono text-[9px] font-bold uppercase flex items-center gap-1">
        <Info className="w-3 h-3 text-editorialMuted" /> INSUFFICIENT EVIDENCE
      </span>
    );
  };

  const getRetrievalBadge = (status: RetrievalStatus | string) => {
    switch (status) {
      case 'FULL_TEXT_RETRIEVED':
        return <span className="font-mono text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 uppercase">Full Text</span>;
      case 'PARTIAL_TEXT_RETRIEVED':
        return <span className="font-mono text-[9px] px-1.5 py-0.2 bg-warmOffWhite text-burntOrange font-bold border border-burntOrange uppercase">Partial</span>;
      case 'SNIPPET_ONLY':
        return <span className="font-mono text-[9px] px-1.5 py-0.2 bg-warmOffWhite text-editorialMuted font-bold border border-lightGrey uppercase">Snippet</span>;
      default:
        return <span className="font-mono text-[9px] px-1.5 py-0.2 bg-warmOffWhite text-editorialMuted font-bold border border-lightGrey uppercase">Metadata</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Search Controls & Language Selectors */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-lightGrey pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-burntOrange" />
              <h3 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
                Cross-Language News Discovery
              </h3>
            </div>
            <p className="text-xs text-editorialMuted mt-0.5">
              Target languages for automated coverage retrieval via Google News RSS &amp; GDELT with conservative event matching.
            </p>
          </div>

          <Button
            type="button"
            onClick={onRunSearch}
            disabled={isSearching || selectedLanguages.length === 0}
            variant="primary"
            size="sm"
            showArrow={!isSearching}
            icon={isSearching ? <Search className="w-3.5 h-3.5 animate-spin" /> : undefined}
            iconPosition="left"
            className="uppercase tracking-wider font-mono text-xs px-5"
          >
            {isSearching ? 'Discovering Coverage...' : 'Search Target Languages'}
          </Button>
        </div>

        {/* Language Checkboxes */}
        <div className="flex flex-wrap gap-2">
          {ALL_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <label
                key={lang.code}
                className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-almostBlack text-pureWhite border-almostBlack font-bold'
                    : 'bg-warmOffWhite border-lightGrey text-almostBlack hover:border-burntOrange'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleLanguage(lang.code)}
                  className="accent-burntOrange focus:ring-1 focus:ring-burntOrange cursor-pointer"
                />
                <span>{lang.name}</span>
              </label>
            );
          })}
        </div>

        {/* Generated Queries Inspector */}
        {queries.length > 0 && (
          <div className="pt-4 border-t border-lightGrey space-y-2">
            <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider">
              Synthesized Cross-Language Search Queries
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {queries.map((q, idx) => (
                <div key={idx} className="p-2.5 bg-warmOffWhite border border-lightGrey text-xs space-y-1">
                  <div className="font-mono font-bold text-burntOrange text-[11px] uppercase">{q.language_name}</div>
                  <ul className="space-y-0.5">
                    {q.queries.map((subQ, sIdx) => (
                      <li key={sIdx} className="font-mono text-editorialMuted truncate text-[10px]" title={subQ}>
                        • {subQ}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Reports */}
        {providerReports.length > 0 && (
          <div className="pt-4 border-t border-lightGrey flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="font-bold text-editorialMuted uppercase mr-1">
              Provider States:
            </span>
            {providerReports.map((pr, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 border border-lightGrey bg-warmOffWhite text-almostBlack"
              >
                {pr.provider_name} ({pr.language.toUpperCase()}): {pr.result_count} items
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Article Selection & Comparison Action Bar */}
      {candidates.length > 0 && (
        <div className="bg-pureWhite border border-lightGrey p-4 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-40 shadow-editorial-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-warmOffWhite border border-lightGrey text-burntOrange">
                <CheckSquare className="w-4 h-4" />
              </span>
              <div>
                <div className="font-editorial font-bold text-xs uppercase text-almostBlack">
                  {selectedCandidateIds.length} of {candidates.length} Articles Selected
                </div>
                <div className="font-mono text-[10px] text-editorialMuted">
                  {eligibleCount} verified matches available for comparison
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-lightGrey hidden sm:block" />

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={onSelectAllEligible}
                className="px-2 py-1 text-almostBlack bg-warmOffWhite hover:bg-pureWhite border border-lightGrey font-bold uppercase transition"
              >
                Select All Eligible
              </button>
              <button
                type="button"
                onClick={onClearCandidateSelection}
                className="px-2 py-1 text-editorialMuted hover:text-almostBlack border border-transparent font-medium uppercase transition"
              >
                Clear
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={onCompareSelected}
            disabled={isComparing || selectedCandidateIds.length === 0}
            variant="primary"
            size="sm"
            showArrow
            icon={<GitCompare className="w-3.5 h-3.5" />}
            iconPosition="left"
            className="uppercase tracking-wider font-mono text-xs px-5"
          >
            {isComparing ? 'Comparing Selected...' : `Compare Selected (${selectedCandidateIds.length})`}
          </Button>
        </div>
      )}

      {/* 3. Discovered Candidates Table */}
      <div className="bg-pureWhite border border-lightGrey shadow-editorial-sm overflow-hidden">
        <div className="p-5 border-b border-lightGrey flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
              Discovered Reporting Candidates ({candidates.length})
            </h4>
            <p className="text-xs text-editorialMuted mt-0.5">
              Select eligible same-event articles to generate side-by-side linguistic framing comparisons.
            </p>
          </div>
          <span className="font-mono text-[10px] text-almostBlack bg-warmOffWhite px-2.5 py-1 border border-lightGrey font-bold uppercase">
            Multi-Signal Verification Active
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 text-center text-editorialMuted text-xs font-mono space-y-2">
            <Globe2 className="w-10 h-10 text-lightGrey mx-auto stroke-[1.25]" />
            <div className="font-bold text-almostBlack">No coverage candidates discovered yet</div>
            <p className="text-xs text-editorialMuted max-w-sm mx-auto">
              Select target languages above and click &quot;Search Target Languages&quot; to begin automated event discovery.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-lightGrey">
            {candidates.map((cand) => {
              const isExpanded = expandedCandidateId === cand.candidate_id;
              const isSelected = selectedCandidateIds.includes(cand.candidate_id);
              const eligible = isEligible(cand.outcome);
              const cleanTitle = stripHtmlAndEntities(cand.title);
              const cleanSnippet = stripHtmlAndEntities(cand.snippet);
              const cleanPublisher = stripHtmlAndEntities(cand.publisher);

              return (
                <div
                  key={cand.candidate_id}
                  className={`p-5 transition flex items-start gap-4 ${
                    isSelected ? 'bg-warmOffWhite border-l-4 border-l-burntOrange' : 'hover:bg-warmOffWhite/50'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCandidateSelect(cand.candidate_id)}
                      className="w-4 h-4 accent-burntOrange focus:ring-1 focus:ring-burntOrange cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 bg-almostBlack text-pureWhite font-bold uppercase">
                          {cand.language.toUpperCase()}
                        </span>
                        <span className="font-bold text-almostBlack">{cleanPublisher || 'News Source'}</span>
                        {cand.publish_date && (
                          <span className="text-editorialMuted">• {cand.publish_date}</span>
                        )}
                        <span className="text-editorialMuted">via {cand.discovery_provider}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(cand.outcome)}
                        {getRetrievalBadge(cand.retrieval_status)}
                      </div>
                    </div>

                    <h5 className="font-editorial font-bold text-almostBlack text-base leading-snug">
                      {cleanTitle}
                    </h5>

                    {cleanSnippet && (
                      <p className="text-xs text-almostBlack font-serif leading-relaxed">
                        {cleanSnippet}
                      </p>
                    )}

                    {/* Verification Reasoning */}
                    <div className="p-2.5 bg-warmOffWhite border border-lightGrey text-xs flex items-start gap-2">
                      <ShieldCheck className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${eligible ? 'text-burntOrange' : 'text-editorialMuted'}`} />
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-almostBlack uppercase text-[10px]">Verification Evidence: </span>
                        <span className="text-editorialMuted">{cand.outcome_reasoning}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-4 text-xs font-mono">
                      {cand.url && (
                        <a
                          href={cand.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-burntOrange hover:underline font-bold flex items-center gap-1"
                        >
                          Original Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {cand.retrieved_text && (
                        <button
                          type="button"
                          onClick={() => setExpandedCandidateId(isExpanded ? null : cand.candidate_id)}
                          className="text-editorialMuted hover:text-almostBlack font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          {isExpanded ? 'Hide Extracted Body' : 'View Extracted Body Text'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Expanded Extracted Full Text */}
                    {isExpanded && cand.retrieved_text && (
                      <div className="p-3.5 bg-warmOffWhite border border-lightGrey text-xs font-serif text-almostBlack whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                        <div className="font-mono font-bold text-editorialMuted text-[10px] uppercase tracking-wider mb-1">
                          Extracted Body Content:
                        </div>
                        {cand.retrieved_text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
