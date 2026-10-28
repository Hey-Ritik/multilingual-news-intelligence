import React from 'react';
import { SentimentResult, EmotionResult, NamedEntity, ClaimObservation } from '../types';
import { Smile, Frown, Meh, AlertCircle, Quote, Tag, CheckCircle2, HelpCircle } from 'lucide-react';

interface NlpPipelineViewProps {
  sentiment: SentimentResult;
  emotion: EmotionResult;
  entities: NamedEntity[];
  claims: ClaimObservation[];
}

export default function NlpPipelineView({
  sentiment,
  emotion,
  entities,
  claims
}: NlpPipelineViewProps) {
  // Color mapping for sentiment
  const getSentimentBadge = (label: string) => {
    switch (label) {
      case 'POSITIVE':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> Positive</span>;
      case 'NEGATIVE':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md text-xs font-bold flex items-center gap-1"><Frown className="w-3.5 h-3.5" /> Negative</span>;
      case 'MIXED':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold flex items-center gap-1"><Meh className="w-3.5 h-3.5" /> Mixed</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-bold flex items-center gap-1"><Meh className="w-3.5 h-3.5" /> Neutral</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sentiment & Emotion Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Sentiment &amp; Valence Analysis
              </h3>
              {getSentimentBadge(sentiment.label)}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Valence Score</span>
                  <span className="font-bold text-slate-900">{sentiment.score > 0 ? `+${sentiment.score}` : sentiment.score}</span>
                </div>
                {/* 3-way progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${sentiment.positive_score * 100}%` }} className="bg-emerald-500" title="Positive"></div>
                  <div style={{ width: `${sentiment.neutral_score * 100}%` }} className="bg-slate-300" title="Neutral"></div>
                  <div style={{ width: `${sentiment.negative_score * 100}%` }} className="bg-rose-500" title="Negative"></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span className="text-emerald-700">Pos: {Math.round(sentiment.positive_score * 100)}%</span>
                  <span className="text-slate-600">Neu: {Math.round(sentiment.neutral_score * 100)}%</span>
                  <span className="text-rose-700">Neg: {Math.round(sentiment.negative_score * 100)}%</span>
                </div>
              </div>

              {sentiment.supporting_clauses.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Key Valence Clauses
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {sentiment.supporting_clauses.map((sc, idx) => (
                      <div key={idx} className="text-xs p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-start gap-2">
                        <span className="text-slate-700 font-serif">"{sc.passage}..."</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 ${
                          sc.valence === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                          sc.valence === 'negative' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sc.valence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Methodology Note:</strong> {sentiment.limitations}
            </div>
          </div>
        </div>

        {/* Emotion Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Emotion Profile (Speaker vs Narration)
              </h3>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-md text-xs font-bold border border-sky-200">
                Primary: {emotion.primary_emotion}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Journalist Narration</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {emotion.journalist_emotions.length}
                  </div>
                  <div className="text-[10px] text-slate-400">Direct expository tone</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Quoted Source Statements</div>
                  <div className="text-lg font-bold text-sky-700 mt-1">
                    {emotion.speaker_emotions.length}
                  </div>
                  <div className="text-[10px] text-slate-400">Attributed to speakers</div>
                </div>
              </div>

              {emotion.detected_emotions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Evidence Passages
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {emotion.detected_emotions.map((f, idx) => (
                      <div key={idx} className="text-xs p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 text-[11px]">{f.emotion}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            f.is_speaker_quote ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {f.is_speaker_quote ? 'Quoted Source' : 'Narration'}
                          </span>
                        </div>
                        <p className="text-slate-600 font-serif italic">"{f.text_passage}..."</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <Quote className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>Rigorous Attribution:</strong> Quoted emotions are strictly attributed to the quoted individual and not treated as the journalist's emotional stance.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Named Entities & Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Named Entities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-sky-600" /> Named Entities ({entities.length})
            </h3>
            <span className="text-xs text-slate-500">Native script preserved</span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
            {entities.map((ent, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 bg-slate-50 border-slate-200"
              >
                <span className={`text-[10px] px-1 rounded uppercase font-bold ${
                  ent.label === 'PERSON' ? 'bg-blue-100 text-blue-800' :
                  ent.label === 'ORGANIZATION' ? 'bg-amber-100 text-amber-800' :
                  ent.label === 'LOCATION' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {ent.label}
                </span>
                <span className="text-slate-800 font-semibold">{ent.text}</span>
                {ent.transliteration && ent.transliteration !== ent.text && (
                  <span className="text-slate-400 text-[10px]">({ent.transliteration})</span>
                )}
              </div>
            ))}
            {entities.length === 0 && (
              <div className="text-xs text-slate-400 italic">No named entities detected.</div>
            )}
          </div>
        </div>

        {/* Claim and Attribution Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Claims &amp; Attribution ({claims.length})
            </h3>
            <span className="text-xs text-slate-500">Epistemic Status</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {claims.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    c.claim_type === 'ATTRIBUTED_CLAIM' ? 'bg-sky-100 text-sky-800' :
                    c.claim_type === 'ALLEGATION' ? 'bg-amber-100 text-amber-800' :
                    c.claim_type === 'DENIAL_DISPUTE' ? 'bg-rose-100 text-rose-800' :
                    c.claim_type === 'HEDGE_UNCERTAINTY' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {c.claim_type.replace('_', ' ')}
                  </span>
                  {c.attribution_verb && (
                    <span className="text-[10px] text-slate-500 font-mono">marker: "{c.attribution_verb}"</span>
                  )}
                </div>
                <p className="text-slate-700 font-serif">"{c.text}"</p>
                {c.notes && <p className="text-[11px] text-slate-500 mt-1 italic">{c.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

