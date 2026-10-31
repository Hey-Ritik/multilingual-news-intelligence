'use client';

import React from 'react';
import { Smile, Activity, Quote, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { SentimentResult, EmotionResult, IngestedArticle } from '../../types';

interface SentimentEmotionViewProps {
  article: IngestedArticle | null;
  sentiment: SentimentResult | null;
  emotion: EmotionResult | null;
  onNavigateTab: (tab: any) => void;
}

export default function SentimentEmotionView({
  article,
  sentiment,
  emotion,
  onNavigateTab,
}: SentimentEmotionViewProps) {
  if (!article || !sentiment || !emotion) {
    return (
      <div className="p-16 bg-pureWhite border border-lightGrey text-center space-y-4">
        <Smile className="w-12 h-12 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="space-y-1">
          <h3 className="font-editorial font-bold text-lg uppercase text-almostBlack tracking-tight">
            No Sentiment &amp; Emotion Data Available
          </h3>
          <p className="text-xs text-editorialMuted max-w-md mx-auto leading-relaxed">
            Analyze a news article or select one from the News Feed to inspect sentiment polarity,
            fine-grained emotional vectors, and quoted speaker attributions.
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

  const getEmotionScore = (label: string): number => {
    const match = emotion.detected_emotions.find(
      (e) => e.emotion.toLowerCase() === label.toLowerCase()
    );
    return match ? match.score : 0;
  };

  const emotionList = [
    { name: 'Joy', key: 'joy', score: getEmotionScore('JOY'), color: 'bg-emerald-500' },
    { name: 'Sadness', key: 'sadness', score: getEmotionScore('SADNESS'), color: 'bg-sky-500' },
    { name: 'Anger', key: 'anger', score: getEmotionScore('ANGER'), color: 'bg-rose-500' },
    { name: 'Fear', key: 'fear', score: getEmotionScore('FEAR'), color: 'bg-amber-500' },
    { name: 'Surprise', key: 'surprise', score: getEmotionScore('SURPRISE'), color: 'bg-purple-500' },
    { name: 'Disgust', key: 'disgust', score: getEmotionScore('DISGUST'), color: 'bg-orange-500' },
    { name: 'Neutral', key: 'neutral', score: getEmotionScore('NEUTRAL'), color: 'bg-stone-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">SENTIMENT &amp; EMOTION AUDIT</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              {'//'} {article.metadata.title || 'Analyzed Article'}
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack">
            Affective Stance &amp; Speaker Emotional Attribution
          </h2>
          <p className="text-xs text-editorialMuted max-w-xl leading-relaxed">
            Measures objective emotional valence in reporting. Differentiates between quoted actor
            emotions and third-person journalistic exposition.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-warmOffWhite border border-lightGrey font-bold text-almostBlack">
            {sentiment.label}
          </span>
          <span className="px-3 py-1.5 bg-burntOrange text-pureWhite font-bold">
            {emotion.primary_emotion}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Sentiment Card + Emotion Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Sentiment Polarity & Signal Words */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="editorial-eyebrow text-burntOrange">POLARITY &amp; VALENCE</span>
              <span className="font-mono text-[10px] text-almostBlack font-bold">
                SCORE: {sentiment.score > 0 ? '+' : ''}{sentiment.score.toFixed(2)}
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="font-editorial font-black text-3xl uppercase text-almostBlack">
                  {sentiment.label}
                </span>
                <span className="font-mono text-sm font-bold text-burntOrange">
                  Valence: {sentiment.score > 0 ? '+' : ''}
                  {sentiment.score.toFixed(2)}
                </span>
              </div>

              {/* Bipolar Valence Meter (-1.0 to +1.0) */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between font-mono text-[10px] text-editorialMuted">
                  <span>-1.0 (NEGATIVE)</span>
                  <span>0.0 (NEUTRAL)</span>
                  <span>+1.0 (POSITIVE)</span>
                </div>
                <div className="relative w-full h-3 bg-warmOffWhite border border-lightGrey">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-almostBlack/40" />
                  <div
                    className="absolute top-0 bottom-0 bg-burntOrange transition-all duration-300"
                    style={{
                      left: sentiment.score < 0
                        ? `${Math.max(0, (sentiment.score + 1) * 50)}%`
                        : '50%',
                      width: `${Math.abs(sentiment.score) * 50}%`,
                    }}
                  />
                </div>
              </div>

              {/* Supporting Clauses / Evidence */}
              <div className="pt-4 space-y-2">
                <span className="font-mono text-[10px] font-bold text-almostBlack uppercase">
                  Supporting Clauses &amp; Evidence ({sentiment.supporting_clauses.length}):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {sentiment.supporting_clauses && sentiment.supporting_clauses.length > 0 ? (
                    sentiment.supporting_clauses.map((clause, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-warmOffWhite border border-lightGrey font-mono text-xs text-almostBlack flex justify-between items-center gap-2"
                      >
                        <span className="italic truncate">&quot;{clause.passage}&quot;</span>
                        <span className="font-bold text-[10px] text-burntOrange uppercase shrink-0">
                          {clause.valence}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-editorialMuted italic">
                      No polarized supporting clauses detected; standard neutral reporting stance.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-lightGrey/60 text-[11px] text-editorialMuted leading-relaxed">
            <strong>Methodology Note:</strong> Negative sentiment reflecting high-stakes civic or legal
            events (such as arrests or inquiries) is an empirical topic feature, not evidence of malicious bias.
          </div>
        </div>

        {/* Right: Fine-Grained Emotion Scores */}
        <div className="lg:col-span-6 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="editorial-eyebrow text-burntOrange">EMOTION VECTOR</span>
              <span className="font-mono text-[10px] text-almostBlack font-bold">
                PRIMARY: {emotion.primary_emotion}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              {emotionList.map((emo) => {
                const percent = Math.min(100, Math.round(emo.score * 100));
                return (
                  <div key={emo.key} className="space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="font-semibold text-almostBlack uppercase">{emo.name}</span>
                      <span className="text-editorialMuted">{percent}%</span>
                    </div>
                    <div className="w-full bg-warmOffWhite h-2 border border-lightGrey overflow-hidden">
                      <div
                        className={`h-full ${emo.color} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-lightGrey/60 text-[11px] text-editorialMuted leading-relaxed">
            <strong>Primary Classification:</strong> {emotion.primary_emotion} with{' '}
            {emotion.detected_emotions.length} expressive passages identified in text.
          </div>
        </div>
      </div>

      {/* Quoted Speaker Attributions Table */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-burntOrange" />
            <span className="editorial-eyebrow text-burntOrange">
              QUOTE-LEVEL EMOTION ATTRIBUTIONS
            </span>
          </div>
          <span className="font-mono text-[10px] text-almostBlack font-bold">
            {emotion.speaker_emotions.length} ATTR STATEMENTS
          </span>
        </div>

        {emotion.speaker_emotions && emotion.speaker_emotions.length > 0 ? (
          <div className="space-y-3">
            {emotion.speaker_emotions.map((q, i) => (
              <div key={i} className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-burntOrange uppercase">
                    Speaker: {q.speaker || 'Direct Source'}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-pureWhite border border-lightGrey font-semibold uppercase">
                    Emotion: {q.emotion} ({(q.score * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-xs text-almostBlack italic leading-relaxed">
                  &quot;{q.text_passage}&quot;
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-editorialMuted font-mono">
            No emotional statements inside direct quotes detected. Journalistic tone remains strictly observational.
          </div>
        )}
      </div>
    </div>
  );
}
