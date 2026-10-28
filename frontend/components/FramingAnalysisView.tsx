import React, { useState } from 'react';
import { FramingAnalysisResult, FramingEvidence } from '../types';
import { ShieldCheck, Info, Sparkles, Filter, ChevronRight, AlertTriangle } from 'lucide-react';

interface FramingAnalysisViewProps {
  originalText: string;
  framing: FramingAnalysisResult;
}

export default function FramingAnalysisView({
  originalText,
  framing
}: FramingAnalysisViewProps) {
  const [selectedFinding, setSelectedFinding] = useState<FramingEvidence | null>(
    framing.findings.length > 0 ? framing.findings[0] : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFindings = selectedCategory
    ? framing.findings.filter(f => f.category === selectedCategory)
    : framing.findings;

  // Render text with interactive highlight spans based on exact character offsets
  const renderHighlightedText = () => {
    if (!originalText || framing.findings.length === 0) {
      return <p className="font-serif leading-relaxed text-slate-800 text-sm whitespace-pre-line">{originalText}</p>;
    }

    // Sort findings by start offset ascending
    const sorted = [...framing.findings].sort((a, b) => a.start_offset - b.start_offset);

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((finding, idx) => {
      // Non-highlighted text before this finding
      if (finding.start_offset > lastIndex) {
        segments.push(
          <span key={`text_${lastIndex}`}>
            {originalText.slice(lastIndex, finding.start_offset)}
          </span>
        );
      }

      // Highlighted finding text
      const isSelected = selectedFinding?.finding_id === finding.finding_id;
      segments.push(
        <mark
          key={`mark_${finding.finding_id}_${idx}`}
          onClick={() => setSelectedFinding(finding)}
          className={`cursor-pointer transition-all px-1 py-0.5 rounded text-sm font-serif ${
            isSelected
              ? 'bg-amber-300 text-slate-950 font-semibold ring-2 ring-amber-500 shadow-sm'
              : 'bg-amber-100 hover:bg-amber-200 text-slate-900 border-b-2 border-amber-400'
          }`}
          title={`Click to inspect: ${finding.label} (${finding.category})`}
        >
          {originalText.slice(finding.start_offset, finding.end_offset)}
        </mark>
      );

      lastIndex = Math.max(lastIndex, finding.end_offset);
    });

    // Remainder of text
    if (lastIndex < originalText.length) {
      segments.push(
        <span key={`text_end`}>
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return <div className="font-serif leading-relaxed text-slate-800 text-sm whitespace-pre-line">{segments}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Density Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Bias and Framing Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Substantive explainable linguistic analysis grounded in exact original text spans with documented character offsets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Evidence Density</div>
              <div className="text-lg font-bold text-sky-700">
                {framing.density_per_1000_tokens} <span className="text-xs text-slate-500 font-normal">/ 1,000 tokens</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Validated Findings</div>
              <div className="text-lg font-bold text-slate-900">{framing.findings.length}</div>
            </div>
          </div>
        </div>

        {/* Article-Level Assessment */}
        <div className="mt-4 p-4 bg-sky-50/60 border border-sky-200 rounded-lg">
          <div className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-700" /> Article-Level Assessment
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">
            {framing.article_level_assessment}
          </p>
          <div className="mt-2 text-xs text-slate-600 bg-white/80 p-2.5 rounded border border-sky-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Academic Disclaimer:</strong> {framing.unsupported_conclusions_note}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Side-by-Side Highlighted Original Text & Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Original Text Viewer */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Original Text Evidence Highlighting
            </h3>
            <span className="text-xs text-slate-500 italic">Click highlighted text to inspect</span>
          </div>

          <div className="flex-1 bg-slate-50/70 p-4 rounded-lg border border-slate-200 overflow-y-auto max-h-[500px]">
            {renderHighlightedText()}
          </div>
        </div>

        {/* Right Column: Finding Inspector Card & Findings List */}
        <div className="lg:col-span-5 space-y-4">
          {selectedFinding ? (
            <div className="bg-white rounded-xl shadow-sm border-2 border-sky-500 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                    {selectedFinding.category.replace(/_/g, ' ')}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedFinding.label}</h4>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                  selectedFinding.evidence_strength === 'high' ? 'bg-rose-100 text-rose-800' :
                  selectedFinding.evidence_strength === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Strength: {selectedFinding.evidence_strength}
                </span>
              </div>

              {/* Exact Evidence Span */}
              <div className="p-2.5 bg-amber-50 rounded-md border border-amber-200">
                <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex justify-between">
                  <span>Exact Original Text Evidence</span>
                  <span className="font-mono text-amber-700">[{selectedFinding.start_offset}:{selectedFinding.end_offset}]</span>
                </div>
                <div className="font-serif font-bold text-slate-900 text-sm mt-1">
                  "{selectedFinding.exact_text}"
                </div>
              </div>

              {/* Explanation */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Linguistic Explanation</div>
                <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{selectedFinding.explanation}</p>
              </div>

              {/* Potential Reader Effect */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Potential Effect on Reader</div>
                <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{selectedFinding.potential_effect}</p>
              </div>

              {/* Alternative Interpretation */}
              {selectedFinding.alternative_interpretation && (
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Alternative Interpretation:</span> {selectedFinding.alternative_interpretation}
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Method: {selectedFinding.method}</span>
                {selectedFinding.actor_or_speaker && (
                  <span>Actor/Speaker: <strong>{selectedFinding.actor_or_speaker}</strong></span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-400 text-xs">
              Select a highlighted span in the text to view full analytical evidence.
            </div>
          )}

          {/* Findings List Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>All Framing Findings ({framing.findings.length})</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {framing.findings.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFinding(f)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition border flex items-center justify-between gap-2 ${
                    selectedFinding?.finding_id === f.finding_id
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-semibold">"{f.exact_text}"</span>
                    <span className="text-[10px] text-slate-400 ml-1">({f.label})</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

