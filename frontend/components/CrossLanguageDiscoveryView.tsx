import React, { useState } from 'react';
import { ArticleCandidate, ProviderStatusReport, LanguageQuery, CandidateOutcome, RetrievalStatus } from '../types';
import { stripHtmlAndEntities } from '../lib/utils';
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
  Layers,
  Sparkles,
  GitCompare,
  CheckSquare,
  Square,
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
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-[11px] uppercase tracking-wide flex items-center gap-1 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> VERIFIED SAME EVENT
        </span>
      );
    }
    if (norm.includes('POSSIBLE') || norm.includes('LIKELY')) {
      return (
        <span className="px-2.5 py-1 bg-sky-100 text-sky-900 border border-sky-300 rounded-md font-bold text-[11px] uppercase tracking-wide flex items-center gap-1 shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-sky-700" /> POSSIBLE MATCH — REVIEW
        </span>
      );
    }
    if (norm.includes('RELATED')) {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[11px] uppercase tracking-wide flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> RELATED TOPIC ONLY
        </span>
      );
    }
    if (norm.includes('DIFFERENT') || norm.includes('REJECTED')) {
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-md font-bold text-[11px] uppercase tracking-wide flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-rose-700" /> DIFFERENT EVENT
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-bold text-[11px] uppercase flex items-center gap-1">
        <Info className="w-3.5 h-3.5 text-slate-500" /> INSUFFICIENT EVIDENCE
      </span>
    );
  };

  const getRetrievalBadge = (status: RetrievalStatus | string) => {
    switch (status) {
      case 'FULL_TEXT_RETRIEVED':
        return <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded border border-emerald-200">Full Text Available</span>;
      case 'PARTIAL_TEXT_RETRIEVED':
        return <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded border border-amber-200">Partial Text</span>;
      case 'SNIPPET_ONLY':
        return <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded border border-purple-200">Snippet Evidence</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded border border-slate-200">Headline/Metadata</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Search Controls & Language Selectors */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-sky-600" />
              Cross-Language News Discovery
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target languages for automated coverage retrieval via Google News RSS &amp; GDELT 2.0 with conservative event matching.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunSearch}
            disabled={isSearching || selectedLanguages.length === 0}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Discovering Coverage...' : 'Search Selected Languages'}
          </button>
        </div>

        {/* Language Checkboxes */}
        <div className="mt-4 flex flex-wrap gap-3">
          {ALL_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <label
                key={lang.code}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleLanguage(lang.code)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>{lang.name}</span>
              </label>
            );
          })}
        </div>

        {/* Generated Queries Inspector */}
        {queries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Synthesized Cross-Language Search Queries
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {queries.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 text-[11px] mb-1">{q.language_name}</div>
                  <ul className="space-y-1">
                    {q.queries.map((subQ, sIdx) => (
                      <li key={sIdx} className="font-mono text-slate-600 truncate text-[11px]" title={subQ}>
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
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Provider Feed States:
            </span>
            {providerReports.map((pr, idx) => (
              <span
                key={idx}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                  pr.state === 'SUCCESS_WITH_RESULTS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  pr.state === 'TIMEOUT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  pr.state === 'PROVIDER_ERROR' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {pr.provider_name} ({pr.language.toUpperCase()}): {pr.state} ({pr.result_count} items)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Article Selection & Comparison Action Bar */}
      {candidates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                <CheckSquare className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {selectedCandidateIds.length} of {candidates.length} Articles Selected
                </div>
                <div className="text-[11px] text-slate-500">
                  {eligibleCount} verified/possible coverage matches available
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onSelectAllEligible}
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition"
              >
                Select All Eligible
              </button>
              <button
                type="button"
                onClick={onClearCandidateSelection}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-md font-medium transition"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onCompareSelected}
            disabled={isComparing || selectedCandidateIds.length === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition"
          >
            <GitCompare className="w-4 h-4" />
            {isComparing ? 'Comparing Selected Coverage...' : `Compare Selected Articles (${selectedCandidateIds.length})`}
          </button>
        </div>
      )}

      {/* 3. Discovered Candidates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Discovered Articles &amp; Multi-Signal Verification ({candidates.length})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select eligible same-event articles to generate side-by-side linguistic framing comparisons.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            Strict Multi-Signal Verification Active
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Globe2 className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-600">No coverage candidates discovered yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select target languages above and click "Search Selected Languages" to begin automated event discovery.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
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
                    isSelected ? 'bg-sky-50/40 border-l-4 border-l-sky-500' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCandidateSelect(cand.candidate_id)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                          {cand.language.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{cleanPublisher || "Online Publisher"}</span>
                        {cand.publish_date && (
                          <span className="text-xs text-slate-400">• {cand.publish_date}</span>
                        )}
                        <span className="text-[10px] text-slate-400">via {cand.discovery_provider}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(cand.outcome)}
                        {getRetrievalBadge(cand.retrieval_status)}
                      </div>
                    </div>

                    <h5 className="font-bold text-slate-900 text-base leading-snug">
                      {cleanTitle}
                    </h5>

                    {cleanSnippet && (
                      <p className="text-xs text-slate-600 font-serif mt-1.5 leading-relaxed">
                        {cleanSnippet}
                      </p>
                    )}

                    {/* Verification Reasoning */}
                    <div className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      eligible
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-rose-50/60 border-rose-200 text-rose-900'
                    }`}>
                      <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${eligible ? 'text-sky-600' : 'text-rose-500'}`} />
                      <div>
                        <strong>Verification Justification:</strong> {cand.outcome_reasoning}
                        {!eligible && (
                          <span className="block mt-0.5 text-[11px] text-rose-700 font-semibold">
                            ⚠️ Not recommended for same-event framing comparison because it covers a different or unrelated incident.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      {cand.url && (
                        <a
                          href={cand.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                        >
                          View Original Article <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {cand.retrieved_text && (
                        <button
                          type="button"
                          onClick={() => setExpandedCandidateId(isExpanded ? null : cand.candidate_id)}
                          className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {isExpanded ? 'Hide Extracted Body' : 'View Extracted Body Text'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Expanded Extracted Full Text */}
                    {isExpanded && cand.retrieved_text && (
                      <div className="mt-3 p-3.5 bg-slate-100 rounded-lg text-xs font-serif text-slate-800 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto border border-slate-300">
                        <div className="font-sans font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-1">
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
