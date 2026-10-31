'use client';

import React, { useState } from 'react';
import {
  FramingAnalysisResult,
  FramingEvidence,
  BiasVerdict,
} from '../types';
import {
  Info,
  ChevronRight,
  AlertTriangle,
  Brain,
  Scale,
  CheckCircle2,
  AlertCircle,
  Eye,
  HelpCircle,
  Quote,
  Users,
} from 'lucide-react';

interface FramingAnalysisViewProps {
  originalText: string;
  framing: FramingAnalysisResult;
}

export default function FramingAnalysisView({
  originalText,
  framing
}: FramingAnalysisViewProps) {
  const [selectedFinding, setSelectedFinding] = useState<FramingEvidence | null>(
    framing.findings && framing.findings.length > 0 ? framing.findings[0] : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const verdict: BiasVerdict = framing.verdict || (
    framing.findings.length > 0 ? 'POTENTIAL BIAS DETECTED' : 'NO CLEAR BIAS DETECTED'
  );

  const filteredFindings = selectedCategory
    ? framing.findings.filter(f => f.category === selectedCategory)
    : framing.findings;

  // Category highlight styling for exact grounded spans
  const getCategoryHighlightClass = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-burntOrange text-pureWhite font-bold ring-2 ring-almostBlack shadow-xs';
    }
    switch (category) {
      case 'LOADED_LANGUAGE':
      case 'GOVERNMENT_CRITICAL':
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-b-2 border-rose-500';
      case 'SENSATIONALISM_EXAGGERATION':
        return 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-b-2 border-burntOrange';
      case 'THREAT_FRAMING':
      case 'FEAR_APPEAL':
        return 'bg-red-100 hover:bg-red-200 text-red-950 border-b-2 border-red-600';
      case 'IN_GROUP_OUT_GROUP':
        return 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-b-2 border-purple-500';
      case 'SYMPATHY_APPEAL':
        return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-b-2 border-emerald-500';
      case 'GENERALIZATION':
        return 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border-b-2 border-indigo-500';
      case 'HEDGING_QUALIFYING':
        return 'bg-lightGrey hover:bg-lightGrey/80 text-almostBlack border-b-2 border-almostBlack/40';
      default:
        return 'bg-warmOrange/20 hover:bg-warmOrange/30 text-almostBlack border-b-2 border-burntOrange';
    }
  };

  // Render text with interactive highlight spans based on exact character offsets
  const renderHighlightedText = () => {
    if (!originalText || framing.findings.length === 0) {
      return <p className="font-serif leading-relaxed text-almostBlack text-xs whitespace-pre-line">{originalText}</p>;
    }

    const sorted = [...framing.findings].sort((a, b) => a.start_offset - b.start_offset);
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((finding, idx) => {
      if (finding.start_offset > lastIndex) {
        segments.push(
          <span key={`text_${lastIndex}`}>
            {originalText.slice(lastIndex, finding.start_offset)}
          </span>
        );
      }

      const isSelected = selectedFinding?.finding_id === finding.finding_id;
      const highlightClass = getCategoryHighlightClass(finding.category, isSelected);

      segments.push(
        <mark
          key={`mark_${finding.finding_id}_${idx}`}
          onClick={() => setSelectedFinding(finding)}
          className={`cursor-pointer transition-all px-1 py-0.5 text-xs font-serif ${highlightClass}`}
          title={`[${finding.start_offset}:${finding.end_offset}] Click to inspect: ${finding.label}`}
        >
          {originalText.slice(finding.start_offset, finding.end_offset)}
        </mark>
      );

      lastIndex = Math.max(lastIndex, finding.end_offset);
    });

    if (lastIndex < originalText.length) {
      segments.push(
        <span key="text_end">
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return <div className="font-serif leading-relaxed text-almostBlack text-xs whitespace-pre-line">{segments}</div>;
  };

  // Swiss Editorial Verdict Configuration
  const verdictConfig = {
    'POTENTIAL BIAS DETECTED': {
      borderAccent: 'border-l-4 border-l-burntOrange',
      badgeBg: 'bg-burntOrange text-pureWhite',
      icon: <AlertTriangle className="w-5 h-5 text-burntOrange" />,
      statusText: 'Potential Framing / Bias Signals Detected'
    },
    'NO CLEAR BIAS DETECTED': {
      borderAccent: 'border-l-4 border-l-emerald-600',
      badgeBg: 'bg-emerald-600 text-pureWhite',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      statusText: 'Neutral Factual Tone - No Clear Bias'
    },
    'INSUFFICIENT EVIDENCE': {
      borderAccent: 'border-l-4 border-l-almostBlack/40',
      badgeBg: 'bg-almostBlack text-pureWhite',
      icon: <HelpCircle className="w-5 h-5 text-editorialMuted" />,
      statusText: 'Insufficient Evidence for Grounded Verification'
    }
  }[verdict] || {
    borderAccent: 'border-l-4 border-l-lightGrey',
    badgeBg: 'bg-almostBlack text-pureWhite',
    icon: <Info className="w-5 h-5 text-almostBlack" />,
    statusText: verdict
  };

  const confidencePct = Math.round((framing.verdict_confidence ?? 0.80) * 100);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION A: SWISS BIAS VERDICT BANNER
          ========================================================================= */}
      <div className={`bg-pureWhite border border-lightGrey ${verdictConfig.borderAccent} shadow-editorial-sm`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-warmOffWhite border border-lightGrey shrink-0">
                {verdictConfig.icon}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 ${verdictConfig.badgeBg}`}>
                    {verdict}
                  </span>
                  <span className="font-mono text-xs text-editorialMuted">
                    {verdictConfig.statusText}
                  </span>
                </div>
                <h2 className="font-editorial font-black text-xl uppercase tracking-tight text-almostBlack">
                  {framing.verdict_summary || framing.article_level_assessment}
                </h2>
                {framing.verdict_confidence_reasoning && (
                  <p className="text-xs text-editorialMuted max-w-3xl leading-relaxed">
                    {framing.verdict_confidence_reasoning}
                  </p>
                )}
              </div>
            </div>

            {/* Scientific Heuristic Confidence */}
            <div className="bg-warmOffWhite p-4 border border-lightGrey shrink-0 min-w-[200px]">
              <div className="text-[10px] font-mono font-bold text-editorialMuted uppercase tracking-wider mb-1">
                {framing.verdict_confidence_label || 'Deterministic Heuristic Score'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-almostBlack">{confidencePct}%</span>
                <span className="font-mono text-[10px] text-editorialMuted uppercase">Heuristic Match</span>
              </div>
              <div className="w-full bg-lightGrey h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full bg-burntOrange transition-all duration-300"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-lightGrey border-t border-lightGrey bg-warmOffWhite/60">
          <div className="p-4 text-center">
            <div className="text-[10px] font-mono font-bold text-editorialMuted uppercase tracking-wider">Validated Findings</div>
            <div className="font-editorial font-black text-xl text-almostBlack mt-0.5">{framing.findings.length}</div>
            <div className="font-mono text-[9px] text-editorialMuted">grounded text spans</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[10px] font-mono font-bold text-editorialMuted uppercase tracking-wider">Evidence Density</div>
            <div className="font-editorial font-black text-xl text-burntOrange mt-0.5">{framing.density_per_1000_tokens}</div>
            <div className="font-mono text-[9px] text-editorialMuted">indicators / 1k tokens</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[10px] font-mono font-bold text-editorialMuted uppercase tracking-wider">Evidence Coverage</div>
            <div className="font-editorial font-black text-xl text-almostBlack mt-0.5">{framing.evidence_coverage_percentage ?? 0}%</div>
            <div className="font-mono text-[9px] text-editorialMuted">of article sentences</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[10px] font-mono font-bold text-editorialMuted uppercase tracking-wider">Framing Direction</div>
            <div className="font-mono text-xs font-bold text-almostBlack mt-1 uppercase">
              {(framing.overall_direction || 'neutral_factual').replace(/_/g, ' ')}
            </div>
            <div className="font-mono text-[9px] text-editorialMuted">editorial stance</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION B: INTERACTIVE GROUNDED TEXT & FINDINGS INSPECTOR
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Original Text Viewer */}
        <div className="lg:col-span-7 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-lightGrey pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-burntOrange" />
                <h3 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
                  Grounded Original Text Highlighting
                </h3>
              </div>
              <p className="text-xs text-editorialMuted mt-0.5">
                Click any colored span to inspect zero-based character offsets and linguistic evidence.
              </p>
            </div>
            {framing.findings.length > 0 && (
              <span className="font-mono text-[10px] text-almostBlack bg-warmOffWhite border border-lightGrey px-2.5 py-1 font-bold">
                {framing.findings.length} CUES
              </span>
            )}
          </div>

          <div className="flex-1 bg-warmOffWhite/70 p-5 border border-lightGrey overflow-y-auto max-h-[560px]">
            {renderHighlightedText()}
          </div>

          {/* Category Legend */}
          <div className="pt-3 border-t border-lightGrey flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="font-bold text-almostBlack uppercase mr-1">Legend:</span>
            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-300">Loaded Language</span>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">Sensationalism</span>
            <span className="px-1.5 py-0.5 bg-red-100 text-red-900 border border-red-300">Threat Framing</span>
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300">In-Group / Out-Group</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300">Sympathy Appeal</span>
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300">Generalization</span>
            <span className="px-1.5 py-0.5 bg-lightGrey text-almostBlack border border-lightGrey">Hedging</span>
          </div>
        </div>

        {/* Right Column: Finding Inspector Card & Findings List */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {selectedFinding ? (
            <div className="bg-pureWhite border-2 border-burntOrange p-5 shadow-editorial-sm space-y-3.5">
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2 border-b border-lightGrey pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider bg-almostBlack text-pureWhite">
                      {selectedFinding.category.replace(/_/g, ' ')}
                    </span>
                    {selectedFinding.sentence_index !== undefined && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-warmOffWhite border border-lightGrey text-editorialMuted">
                        Sent #{selectedFinding.sentence_index + 1}
                      </span>
                    )}
                    {selectedFinding.paragraph_index !== undefined && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-warmOffWhite border border-lightGrey text-editorialMuted">
                        Para #{selectedFinding.paragraph_index + 1}
                      </span>
                    )}
                  </div>
                  <h4 className="font-editorial font-bold text-sm uppercase text-almostBlack">{selectedFinding.label}</h4>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[9px]">
                  <span className={`px-2 py-0.5 font-bold uppercase ${
                    selectedFinding.evidence_strength === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    selectedFinding.evidence_strength === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-warmOffWhite text-almostBlack border border-lightGrey'
                  }`}>
                    {selectedFinding.evidence_strength} intensity
                  </span>
                  {selectedFinding.direction && (
                    <span className="px-2 py-0.5 font-bold uppercase bg-warmOffWhite border border-lightGrey text-almostBlack">
                      {selectedFinding.direction}
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Evidence Span */}
              <div className="p-3 bg-warmOffWhite border border-lightGrey space-y-1">
                <div className="font-mono text-[9px] font-bold text-burntOrange uppercase tracking-wider flex justify-between">
                  <span>Exact Textual Offset Evidence</span>
                  <span className="font-mono text-almostBlack">[{selectedFinding.start_offset}:{selectedFinding.end_offset}]</span>
                </div>
                <div className="font-serif font-bold text-almostBlack text-sm">
                  &quot;{selectedFinding.exact_text}&quot;
                </div>
                {selectedFinding.sentence_text && (
                  <div className="text-[11px] text-editorialMuted pt-1.5 border-t border-lightGrey/60 font-serif italic">
                    Sentence context: &quot;{selectedFinding.sentence_text}&quot;
                  </div>
                )}
              </div>

              {/* Attribution Provenance */}
              {selectedFinding.attribution && (
                <div className="p-2.5 bg-warmOffWhite border border-lightGrey text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-almostBlack uppercase text-[9px]">
                    <Quote className="w-3 h-3 text-burntOrange" /> Attribution Provenance
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] px-1.5 py-0.2 bg-pureWhite border border-lightGrey font-bold uppercase text-almostBlack">
                      {selectedFinding.attribution.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-editorialMuted leading-relaxed">
                    {selectedFinding.attribution_details || 'Verified text source boundary.'}
                  </p>
                </div>
              )}

              {/* Linguistic Explanation */}
              <div className="space-y-0.5">
                <div className="font-mono text-[9px] font-bold text-editorialMuted uppercase tracking-wider">Linguistic Explanation</div>
                <p className="text-xs text-almostBlack leading-relaxed">{selectedFinding.explanation}</p>
              </div>

              {/* Potential Reader Effect */}
              <div className="space-y-0.5">
                <div className="font-mono text-[9px] font-bold text-editorialMuted uppercase tracking-wider">Potential Effect on Reader</div>
                <p className="text-xs text-almostBlack leading-relaxed">{selectedFinding.potential_effect}</p>
              </div>

              {/* Target Entity */}
              {selectedFinding.target_entity && (
                <div className="p-2 bg-warmOffWhite border border-lightGrey text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-editorialMuted uppercase block">Portrayed Entity</span>
                    <strong className="font-editorial uppercase text-almostBlack">{selectedFinding.target_entity}</strong>
                  </div>
                  {selectedFinding.affected_group && (
                    <span className="font-mono text-[9px] px-2 py-0.5 bg-pureWhite border border-lightGrey text-almostBlack">
                      {selectedFinding.affected_group}
                    </span>
                  )}
                </div>
              )}

              {/* Cognitive / Psychological Mechanism */}
              {selectedFinding.psychological_mechanism && (
                <div className="p-2.5 bg-warmOffWhite border border-lightGrey text-xs space-y-1">
                  <div className="font-mono text-[9px] font-bold text-burntOrange uppercase tracking-wider flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Cognitive Mechanism
                  </div>
                  <p className="text-editorialMuted text-xs leading-relaxed">{selectedFinding.psychological_mechanism}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-pureWhite border border-lightGrey p-8 text-center text-editorialMuted text-xs font-mono">
              Select a highlighted span in the original text or choose from the list below to inspect evidence.
            </div>
          )}

          {/* Category Filter Pills & Findings List */}
          <div className="bg-pureWhite border border-lightGrey p-4 flex-1 space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-almostBlack uppercase tracking-wider">
              <span>All Findings ({filteredFindings.length})</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-burntOrange hover:underline capitalize"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`font-mono text-[9px] px-2 py-1 font-bold uppercase transition ${
                  selectedCategory === null
                    ? 'bg-almostBlack text-pureWhite'
                    : 'bg-warmOffWhite text-almostBlack border border-lightGrey hover:border-burntOrange'
                }`}
              >
                All ({framing.findings.length})
              </button>
              {Object.entries(framing.category_counts || {}).map(([cat, cnt]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`font-mono text-[9px] px-2 py-1 font-bold uppercase transition ${
                    selectedCategory === cat
                      ? 'bg-burntOrange text-pureWhite'
                      : 'bg-warmOffWhite text-almostBlack border border-lightGrey hover:border-burntOrange'
                  }`}
                >
                  {cat.replace(/_/g, ' ').toLowerCase()} ({cnt})
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredFindings.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFinding(f)}
                  className={`w-full text-left p-2.5 text-xs transition border flex items-center justify-between gap-2 ${
                    selectedFinding?.finding_id === f.finding_id
                      ? 'bg-warmOffWhite border-burntOrange text-almostBlack font-bold'
                      : 'bg-pureWhite hover:bg-warmOffWhite border-lightGrey text-almostBlack'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-editorial">&quot;{f.exact_text}&quot;</span>
                    <span className="font-mono text-[10px] text-editorialMuted ml-1.5">[{f.label}]</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-editorialMuted shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION C: BIAS DIRECTION & ENTITY IMPACT
          ========================================================================= */}
      {framing.entity_impacts && framing.entity_impacts.length > 0 && (
        <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-lightGrey pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-burntOrange" />
                <h3 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
                  Actor Agency, Portrayal &amp; Entity Impact
                </h3>
              </div>
              <p className="text-xs text-editorialMuted mt-0.5">
                Evaluates how individual actors and institutions are portrayed through selective modifiers and critical framing.
              </p>
            </div>
            {framing.framing_symmetry_assessment && (
              <span className="font-mono text-[10px] bg-warmOffWhite border border-lightGrey text-almostBlack px-3 py-1 font-bold uppercase">
                {framing.framing_symmetry_assessment}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {framing.entity_impacts.map((entity, eIdx) => (
              <div key={eIdx} className="bg-warmOffWhite border border-lightGrey p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-editorial font-bold text-sm uppercase text-almostBlack">{entity.entity_name}</h4>
                      <span className="font-mono text-[9px] text-editorialMuted uppercase">{entity.entity_type}</span>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5 border border-lightGrey bg-pureWhite font-bold uppercase text-almostBlack">
                      {entity.direction.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-almostBlack leading-relaxed">
                    {entity.portrayal_summary}
                  </p>

                  {/* Quoted Evidence */}
                  {entity.evidence_quotes && entity.evidence_quotes.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-mono text-[9px] font-bold text-editorialMuted uppercase">Textual Evidence:</div>
                      {entity.evidence_quotes.map((q, qi) => (
                        <div key={qi} className="text-xs font-serif bg-pureWhite p-2 border border-lightGrey text-almostBlack italic">
                          &quot;{q}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favored Interest Analysis */}
                <div className="pt-2 border-t border-lightGrey/60 text-xs bg-pureWhite/70 p-2.5 border border-lightGrey space-y-0.5">
                  <span className="font-mono font-bold text-burntOrange block text-[9px] uppercase">Favored Interest Analysis:</span>
                  <p className="text-[11px] text-editorialMuted italic">{entity.favored_interest_analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION D: NEUTRALITY DIMENSIONS & METHODOLOGY
          ========================================================================= */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
        <div className="border-b border-lightGrey pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-burntOrange" />
            <h3 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
              Neutrality Assessment &amp; Evaluated Dimensions
            </h3>
          </div>
          <p className="text-xs text-editorialMuted mt-0.5">
            Explicit documentation of linguistic dimensions tested to distinguish neutral expository reporting from systematic framing.
          </p>
        </div>

        {/* Neutrality Checks Grid */}
        {framing.neutrality_checks && framing.neutrality_checks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {framing.neutrality_checks.map((check, cIdx) => (
              <div key={cIdx} className="p-3.5 border border-lightGrey bg-warmOffWhite space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-editorial font-bold text-almostBlack text-xs uppercase">{check.check_name}</span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 font-bold uppercase shrink-0 border ${
                    check.status === 'NO_BIAS_INDICATORS_FOUND'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-warmOffWhite text-almostBlack border-lightGrey'
                  }`}>
                    {check.status === 'NO_BIAS_INDICATORS_FOUND' ? 'PASSED' : check.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-editorialMuted leading-snug">{check.description}</p>
                <div className="text-[11px] font-mono text-almostBlack pt-1 border-t border-lightGrey/60">
                  {check.result_details}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Methodology & Limitations Callout */}
        <div className="p-4 bg-warmOffWhite border border-lightGrey space-y-2">
          <div className="font-mono text-xs font-bold text-almostBlack uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-burntOrange" /> Methodology &amp; Scientific Transparency
          </div>
          <p className="text-xs text-editorialMuted leading-relaxed">
            {framing.methodology}
          </p>
          <div className="pt-2 border-t border-lightGrey/60 text-xs space-y-1">
            <strong className="font-mono text-[10px] text-almostBlack uppercase block">System Limitations:</strong>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-editorialMuted">
              {(framing.system_limitations || [
                'Linguistic framing does not prove conscious journalistic intent or editorial conspiracy.',
                'The absence of detected indicators does not guarantee absolute neutrality; bias may exist through omitted context.',
                'Lexical pattern analysis cannot substitute for deep qualitative domain expertise or independent fact-checking.',
                'Confidence scores represent transparent heuristic evidence strength, not calibrated probabilities.'
              ]).map((lim, li) => (
                <li key={li}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
