import React, { useState } from 'react';
import {
  FramingAnalysisResult,
  FramingEvidence,
  BiasVerdict,
  AttributionType,
  PortrayalDirection,
  EntityPortrayalImpact,
  PsychologicalMechanism,
  NeutralityCheck
} from '../types';
import {
  ShieldCheck,
  Info,
  Sparkles,
  Filter,
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
  Target
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

  // Color mapper for categories in highlighted text
  const getCategoryHighlightClass = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-amber-300 text-slate-950 font-semibold ring-2 ring-amber-500 shadow-md';
    }
    switch (category) {
      case 'LOADED_LANGUAGE':
      case 'GOVERNMENT_CRITICAL':
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-b-2 border-rose-400';
      case 'SENSATIONALISM_EXAGGERATION':
        return 'bg-orange-100 hover:bg-orange-200 text-orange-950 border-b-2 border-orange-400';
      case 'THREAT_FRAMING':
      case 'FEAR_APPEAL':
        return 'bg-red-100 hover:bg-red-200 text-red-950 border-b-2 border-red-400';
      case 'IN_GROUP_OUT_GROUP':
        return 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-b-2 border-purple-400';
      case 'SYMPATHY_APPEAL':
        return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-b-2 border-emerald-400';
      case 'GENERALIZATION':
        return 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border-b-2 border-indigo-400';
      case 'HEDGING_QUALIFYING':
        return 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-b-2 border-slate-400';
      default:
        return 'bg-amber-100 hover:bg-amber-200 text-slate-900 border-b-2 border-amber-400';
    }
  };

  // Render text with interactive highlight spans based on exact character offsets
  const renderHighlightedText = () => {
    if (!originalText || framing.findings.length === 0) {
      return <p className="font-serif leading-relaxed text-slate-800 text-sm whitespace-pre-line">{originalText}</p>;
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
          className={`cursor-pointer transition-all px-1 py-0.5 rounded text-sm font-serif ${highlightClass}`}
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

    return <div className="font-serif leading-relaxed text-slate-800 text-sm whitespace-pre-line">{segments}</div>;
  };

  // Verdict style configurations
  const verdictConfig = {
    'POTENTIAL BIAS DETECTED': {
      bg: 'bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border-amber-300',
      badgeBg: 'bg-amber-500 text-white',
      borderAccent: 'border-l-4 border-l-amber-500',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      textColor: 'text-amber-950',
      statusText: 'Potential Bias & Framing Indicators Detected'
    },
    'NO CLEAR BIAS DETECTED': {
      bg: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300',
      badgeBg: 'bg-emerald-600 text-white',
      borderAccent: 'border-l-4 border-l-emerald-600',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      textColor: 'text-emerald-950',
      statusText: 'No Clear Bias Detected Under Current Indicators'
    },
    'INSUFFICIENT EVIDENCE': {
      bg: 'bg-gradient-to-r from-slate-400/10 via-slate-300/5 to-transparent border-slate-300',
      badgeBg: 'bg-slate-600 text-white',
      borderAccent: 'border-l-4 border-l-slate-500',
      icon: <HelpCircle className="w-6 h-6 text-slate-600" />,
      textColor: 'text-slate-900',
      statusText: 'Insufficient Evidence for Linguistic Verification'
    }
  }[verdict] || {
    bg: 'bg-slate-50 border-slate-200',
    badgeBg: 'bg-slate-600 text-white',
    borderAccent: 'border-l-4 border-l-slate-400',
    icon: <Info className="w-6 h-6 text-slate-600" />,
    textColor: 'text-slate-900',
    statusText: verdict
  };

  const confidencePct = Math.round((framing.verdict_confidence ?? 0.80) * 100);

  return (
    <div className="space-y-8">
      {/* =========================================================================
          SECTION A: PROMINENT BIAS VERDICT BANNER
          ========================================================================= */}
      <div className={`bg-white rounded-2xl shadow-sm border ${verdictConfig.borderAccent} border-slate-200 overflow-hidden`}>
        <div className={`p-6 ${verdictConfig.bg}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                {verdictConfig.icon}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${verdictConfig.badgeBg}`}>
                    {verdict}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {verdictConfig.statusText}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  {framing.verdict_summary || framing.article_level_assessment}
                </h2>
                {framing.verdict_confidence_reasoning && (
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    {framing.verdict_confidence_reasoning}
                  </p>
                )}
              </div>
            </div>

            {/* Scientific Confidence Badge */}
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shrink-0 min-w-[200px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>{framing.verdict_confidence_label || 'System confidence score (uncalibrated)'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{confidencePct}%</span>
                <span className="text-xs text-slate-500">heuristic match</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    confidencePct >= 80 ? 'bg-emerald-500' : confidencePct >= 65 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border-t border-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Validated Findings</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{framing.findings.length}</div>
            <div className="text-[10px] text-slate-400">grounded text spans</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evidence Density</div>
            <div className="text-xl font-bold text-sky-700 mt-0.5">{framing.density_per_1000_tokens}</div>
            <div className="text-[10px] text-slate-400">indicators / 1k tokens</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evidence Coverage</div>
            <div className="text-xl font-bold text-indigo-700 mt-0.5">{framing.evidence_coverage_percentage ?? 0}%</div>
            <div className="text-[10px] text-slate-400">of article sentences</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Framing Direction</div>
            <div className="text-sm font-bold text-slate-800 mt-1 capitalize">
              {(framing.overall_direction || 'neutral_factual').replace(/_/g, ' ')}
            </div>
            <div className="text-[10px] text-slate-400">editorial stance</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION B: INTERACTIVE GROUNDED TEXT & FINDINGS INSPECTOR
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Original Text Viewer */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600" /> Grounded Original Text Highlighting
              </h3>
              <p className="text-xs text-slate-500">
                Click any colored span to inspect zero-based character offsets and linguistic evidence.
              </p>
            </div>
            {framing.findings.length > 0 && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {framing.findings.length} highlighted cue{framing.findings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-50/80 p-5 rounded-xl border border-slate-200 overflow-y-auto max-h-[560px]">
            {renderHighlightedText()}
          </div>

          {/* Category Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-500 mr-1">Legend:</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">Loaded Language</span>
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300">Sensationalism</span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">Threat Framing</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">In-Group / Out-Group</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">Sympathy / Victimhood</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">Generalization</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">Hedging</span>
          </div>
        </div>

        {/* Right Column: Finding Inspector Card & Findings List */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {selectedFinding ? (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-sky-500 p-5 space-y-3.5">
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                      {selectedFinding.category.replace(/_/g, ' ')}
                    </span>
                    {selectedFinding.sentence_index !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                        Sentence #{selectedFinding.sentence_index + 1}
                      </span>
                    )}
                    {selectedFinding.paragraph_index !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                        Para #{selectedFinding.paragraph_index + 1}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedFinding.label}</h4>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedFinding.evidence_strength === 'high' ? 'bg-rose-100 text-rose-800' :
                    selectedFinding.evidence_strength === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedFinding.evidence_strength} intensity
                  </span>
                  {selectedFinding.direction && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      selectedFinding.direction === 'NEGATIVE' ? 'bg-red-50 text-red-700 border border-red-200' :
                      selectedFinding.direction === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {selectedFinding.direction}
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Evidence Span */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex justify-between">
                  <span>Exact Original Text Evidence</span>
                  <span className="font-mono text-amber-700 font-bold">[{selectedFinding.start_offset}:{selectedFinding.end_offset}]</span>
                </div>
                <div className="font-serif font-bold text-slate-900 text-base mt-1">
                  "{selectedFinding.exact_text}"
                </div>
                {selectedFinding.sentence_text && (
                  <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-amber-200/60 font-serif italic">
                    Host Sentence: "{selectedFinding.sentence_text}"
                  </div>
                )}
              </div>

              {/* Attribution Provenance */}
              {selectedFinding.attribution && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase text-[10px] mb-1">
                    <Quote className="w-3.5 h-3.5 text-indigo-600" /> Attribution Provenance
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedFinding.attribution === 'QUOTED_SPEAKER' ? 'bg-purple-100 text-purple-800' :
                      selectedFinding.attribution === 'JOURNALIST_NARRATION' ? 'bg-amber-100 text-amber-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {selectedFinding.attribution.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedFinding.attribution_details || 'Verified text source boundary.'}
                  </p>
                </div>
              )}

              {/* Linguistic Explanation */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Linguistic Explanation</div>
                <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{selectedFinding.explanation}</p>
              </div>

              {/* Potential Reader Effect */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Potential Effect on Reader</div>
                <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{selectedFinding.potential_effect}</p>
              </div>

              {/* Target Entity & Affected Group */}
              {selectedFinding.target_entity && (
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Portrayed Entity</span>
                    <strong className="text-slate-900">{selectedFinding.target_entity}</strong>
                  </div>
                  {selectedFinding.affected_group && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {selectedFinding.affected_group}
                    </span>
                  )}
                </div>
              )}

              {/* Psychological Mechanism */}
              {selectedFinding.psychological_mechanism && (
                <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs">
                  <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-600" /> Cognitive / Psychological Mechanism
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">{selectedFinding.psychological_mechanism}</p>
                </div>
              )}

              {/* Alternative Interpretation */}
              {selectedFinding.alternative_interpretation && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Alternative Interpretation:</span> {selectedFinding.alternative_interpretation}
                </div>
              )}

              {/* Uncalibrated Finding Confidence */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex justify-between items-center mb-1">
                  <span>{selectedFinding.confidence_label || 'Finding confidence score (uncalibrated)'}</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((selectedFinding.confidence_score ?? 0.70) * 100)}%
                  </span>
                </div>
                {selectedFinding.confidence_factors && selectedFinding.confidence_factors.length > 0 && (
                  <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-0.5">
                    {selectedFinding.confidence_factors.map((f, fi) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a highlighted span in the original text or choose from the list below to inspect verified evidence.
            </div>
          )}

          {/* Category Filter Pills & Findings List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <span>All Findings ({filteredFindings.length})</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] text-sky-600 hover:underline capitalize"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition ${
                  selectedCategory === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({framing.findings.length})
              </button>
              {Object.entries(framing.category_counts || {}).map(([cat, cnt]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition ${
                    selectedCategory === cat ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-center justify-between gap-2 ${
                    selectedFinding?.finding_id === f.finding_id
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-medium shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-900">"{f.exact_text}"</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">[{f.label}]</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" /> Bias Direction & Entity Impact Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates how individual actors and institutions are portrayed through selective modifiers and critical framing.
              </p>
            </div>
            {framing.framing_symmetry_assessment && (
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                {framing.framing_symmetry_assessment}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {framing.entity_impacts.map((entity, eIdx) => (
              <div key={eIdx} className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{entity.entity_name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{entity.entity_type}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      entity.direction === 'NEGATIVE' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      entity.direction === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      entity.direction === 'MIXED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {entity.direction.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-2">
                    {entity.portrayal_summary}
                  </p>

                  {/* Quoted Evidence */}
                  {entity.evidence_quotes && entity.evidence_quotes.length > 0 && (
                    <div className="space-y-1 mb-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Textual Evidence:</div>
                      {entity.evidence_quotes.map((q, qi) => (
                        <div key={qi} className="text-[11px] font-serif bg-white p-2 rounded border border-slate-200 text-slate-800 italic">
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favored Interest Analysis */}
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white/60 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Favored Interest Analysis:</span>
                  <p className="mt-0.5 italic">{entity.favored_interest_analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION D: PSYCHOLOGICAL FRAMING & COGNITIVE MECHANISMS
          ========================================================================= */}
      {framing.psychological_framings && framing.psychological_framings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" /> Psychological Framing & Cognitive Appeal Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies rhetorical and psychological mechanisms (e.g. loss aversion, threat appeals, social identity boundaries) present in the text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {framing.psychological_framings.map((mech, mIdx) => (
              <div key={mIdx} className="bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-indigo-950 text-sm">{mech.framework_name}</h4>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-indigo-800 uppercase">Theoretical Framework</div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{mech.concept_description}</p>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-indigo-800 uppercase">Relevance to Analyzed Article</div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed mt-0.5">{mech.relevance_to_text}</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs font-serif text-slate-800 italic">
                  "{mech.evidence_text}"
                </div>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-indigo-100/60 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{mech.analytical_caveat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION E: NEUTRALITY DIMENSIONS & METHODOLOGY
          ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" /> Neutrality Assessment & Evaluated Dimensions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicit documentation of linguistic dimensions tested to distinguish neutral expository reporting from systematic framing.
          </p>
        </div>

        {/* Neutrality Checks Grid */}
        {framing.neutrality_checks && framing.neutrality_checks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {framing.neutrality_checks.map((check, cIdx) => (
              <div key={cIdx} className="p-3.5 rounded-xl border bg-slate-50/60 border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{check.check_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                    check.status === 'NO_BIAS_INDICATORS_FOUND' ? 'bg-emerald-100 text-emerald-800' :
                    check.status === 'INDICATORS_PRESENT' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {check.status === 'NO_BIAS_INDICATORS_FOUND' ? 'PASSED / NEUTRAL' : check.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{check.description}</p>
                <div className="text-[11px] font-medium text-slate-800 pt-1 border-t border-slate-200/60">
                  {check.result_details}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Methodology & Limitations Callout */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-600" /> Methodology & Scientific Transparency
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {framing.methodology}
          </p>
          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
            <strong className="text-slate-800 block text-[11px] uppercase">Academic Limitations:</strong>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              {(framing.system_limitations || [
                "Linguistic framing does not prove conscious journalistic intent, editorial conspiracies, or malicious bias.",
                "The absence of detected indicators does not guarantee absolute neutrality; bias may exist through omitted context, topic selection, or photographic presentation.",
                "Lexical pattern analysis cannot substitute for deep qualitative domain expertise or independent legal fact-checking.",
                "Confidence scores represent transparent heuristic evidence strength, not calibrated frequentist probabilities."
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
