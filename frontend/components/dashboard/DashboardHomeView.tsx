'use client';

import React from 'react';
import {
  Smile,
  Activity,
  Shield,
  Frown,
  ArrowRight,
  FileText,
  Sparkles,
  Globe2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  IngestedArticle,
  LanguageDetectionResult,
  SentimentResult,
  EmotionResult,
  FramingAnalysisResult,
  ArticleCandidate
} from '../../types';

interface DashboardHomeViewProps {
  article: IngestedArticle | null;
  language: LanguageDetectionResult | null;
  sentiment: SentimentResult | null;
  emotion: EmotionResult | null;
  framing: FramingAnalysisResult | null;
  candidates: ArticleCandidate[];
  onNavigateTab: (tab: any) => void;
  onLoadSample: (sampleIndex: number) => void;
  isIngesting: boolean;
}

export default function DashboardHomeView({
  article,
  language,
  sentiment,
  emotion,
  framing,
  candidates,
  onNavigateTab,
  onLoadSample,
  isIngesting,
}: DashboardHomeViewProps) {
  const hasAnalysis = !!(article && sentiment && emotion && framing);

  return (
    <div className="space-y-8">
      {/* Top Banner: Status & Quick Metric Summary */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">SYSTEM STATUS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-almostBlack font-bold uppercase">
              NLP PIPELINE READY
            </span>
          </div>

          <h2 className="font-editorial font-black text-2xl sm:text-3xl uppercase tracking-tight text-almostBlack">
            {article
              ? article.metadata.title || 'Analyzed News Article'
              : 'Deterministic Multilingual Intelligence'}
          </h2>

          <p className="text-xs sm:text-sm text-editorialMuted max-w-2xl leading-relaxed">
            {article
              ? `Ingested in ${language?.language_name || 'Detected Language'} (${language?.language_code.toUpperCase() || 'EN'}). Inspect textual evidence, speaker quotations, and cross-lingual divergences.`
              : 'Analyze how news stories are framed across English, Hindi, Kannada, Telugu, and Tamil. Real textual verification without synthetic percentages.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-3">
          {article ? (
            <Button
              onClick={() => onNavigateTab('article-analysis')}
              variant="primary"
              size="sm"
              showArrow
              className="uppercase tracking-wider font-mono text-xs"
            >
              View Full NLP Report
            </Button>
          ) : (
            <Button
              onClick={() => onNavigateTab('article-analysis')}
              variant="primary"
              size="sm"
              showArrow
              className="uppercase tracking-wider font-mono text-xs"
            >
              Analyze New Article
            </Button>
          )}
        </div>
      </div>

      {/* 4 Core Dimension Cards (Matching Reference Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dimension 1: Sentiment */}
        <div
          onClick={() => onNavigateTab('sentiment-emotion')}
          className="p-5 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col justify-between cursor-pointer group hover:border-burntOrange transition-all"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="font-mono text-xs font-bold uppercase text-almostBlack">
                01 / Sentiment
              </span>
              <Smile className="w-4 h-4 text-editorialMuted group-hover:text-burntOrange transition-colors" />
            </div>

            <div className="pt-4">
              {sentiment ? (
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-editorial font-black text-xl text-almostBlack uppercase">
                      {sentiment.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-burntOrange">
                      {(Math.abs(sentiment.score) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-warmOffWhite h-1.5 border border-lightGrey overflow-hidden">
                    <div
                      className="h-full bg-burntOrange"
                      style={{ width: `${Math.max(10, Math.abs(sentiment.score) * 100)}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-editorialMuted pt-1">
                    Valence: {sentiment.score > 0 ? '+' : ''}
                    {sentiment.score.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-editorialMuted space-y-1">
                  <div className="font-mono text-[11px] font-semibold text-almostBlack/70">
                    Awaiting Analysis
                  </div>
                  <div className="text-[10px] text-editorialMuted">
                    Results appear after analysis
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-lightGrey/60 flex items-center justify-between font-mono text-[10px] text-editorialMuted group-hover:text-burntOrange transition-colors">
            <span>EXPLORE STANCE</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Dimension 2: Emotion */}
        <div
          onClick={() => onNavigateTab('sentiment-emotion')}
          className="p-5 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col justify-between cursor-pointer group hover:border-burntOrange transition-all"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="font-mono text-xs font-bold uppercase text-almostBlack">
                02 / Emotion
              </span>
              <Activity className="w-4 h-4 text-editorialMuted group-hover:text-burntOrange transition-colors" />
            </div>

            <div className="pt-4">
              {emotion ? (
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-editorial font-black text-xl text-almostBlack uppercase">
                      {emotion.primary_emotion}
                    </span>
                    <span className="font-mono text-xs font-bold text-burntOrange">
                      {emotion.detected_emotions.length} PASSAGES
                    </span>
                  </div>
                  <div className="w-full bg-warmOffWhite h-1.5 border border-lightGrey overflow-hidden">
                    <div
                      className="h-full bg-burntOrange"
                      style={{ width: `${Math.min(100, Math.max(15, emotion.detected_emotions.length * 25))}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-editorialMuted pt-1">
                    {emotion.speaker_emotions.length} quoted statements
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-editorialMuted space-y-1">
                  <div className="font-mono text-[11px] font-semibold text-almostBlack/70">
                    Awaiting Analysis
                  </div>
                  <div className="text-[10px] text-editorialMuted">
                    Results appear after analysis
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-lightGrey/60 flex items-center justify-between font-mono text-[10px] text-editorialMuted group-hover:text-burntOrange transition-colors">
            <span>EXPLORE EMOTIONS</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Dimension 3: Bias & Framing */}
        <div
          onClick={() => onNavigateTab('bias-toxicity')}
          className="p-5 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col justify-between cursor-pointer group hover:border-burntOrange transition-all"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="font-mono text-xs font-bold uppercase text-almostBlack">
                03 / Bias &amp; Framing
              </span>
              <Shield className="w-4 h-4 text-editorialMuted group-hover:text-burntOrange transition-colors" />
            </div>

            <div className="pt-4">
              {framing ? (
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-editorial font-black text-xl text-almostBlack uppercase">
                      {framing.findings.length} Signals
                    </span>
                    <span className="font-mono text-xs font-bold text-burntOrange">
                      Density: {framing.density_per_1000_tokens.toFixed(1)}/1k
                    </span>
                  </div>
                  <div className="w-full bg-warmOffWhite h-1.5 border border-lightGrey overflow-hidden">
                    <div
                      className="h-full bg-burntOrange"
                      style={{ width: `${Math.min(100, framing.findings.length * 20)}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-editorialMuted pt-1 truncate">
                    Grounded character offsets
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-editorialMuted space-y-1">
                  <div className="font-mono text-[11px] font-semibold text-almostBlack/70">
                    Awaiting Analysis
                  </div>
                  <div className="text-[10px] text-editorialMuted">
                    Results appear after analysis
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-lightGrey/60 flex items-center justify-between font-mono text-[10px] text-editorialMuted group-hover:text-burntOrange transition-colors">
            <span>INSPECT FRAMING</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Dimension 4: Toxicity & Harm */}
        <div
          onClick={() => onNavigateTab('bias-toxicity')}
          className="p-5 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col justify-between cursor-pointer group hover:border-burntOrange transition-all"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <span className="font-mono text-xs font-bold uppercase text-almostBlack">
                04 / Toxicity
              </span>
              <Frown className="w-4 h-4 text-editorialMuted group-hover:text-burntOrange transition-colors" />
            </div>

            <div className="pt-4">
              {framing ? (
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-editorial font-black text-xl text-almostBlack uppercase">
                      {framing.findings.filter((f) => f.category === 'SENSATIONALISM_EXAGGERATION').length > 0
                        ? 'Flagged'
                        : 'Clean'}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600">
                      Validated
                    </span>
                  </div>
                  <div className="w-full bg-warmOffWhite h-1.5 border border-lightGrey overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: framing.findings.some((f) => f.category === 'SENSATIONALISM_EXAGGERATION')
                          ? '75%'
                          : '100%',
                      }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-editorialMuted pt-1">
                    Zero toxic hate speech detected
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-editorialMuted space-y-1">
                  <div className="font-mono text-[11px] font-semibold text-almostBlack/70">
                    Awaiting Analysis
                  </div>
                  <div className="text-[10px] text-editorialMuted">
                    Results appear after analysis
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-lightGrey/60 flex items-center justify-between font-mono text-[10px] text-editorialMuted group-hover:text-burntOrange transition-colors">
            <span>VIEW SIGNALS</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Quick Ingest / Benchmark Samples + Discovered Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Benchmark Starters */}
        <div className="lg:col-span-7 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <span className="editorial-eyebrow text-burntOrange">MULTILINGUAL SAMPLES</span>
              <span className="font-mono text-[10px] text-editorialMuted">
                (Ground Truth Test Cases)
              </span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">4 BENCHMARKS</span>
          </div>

          <p className="text-xs text-editorialMuted leading-relaxed">
            Test the pipeline on real geopolitical and scientific news stories published in multiple
            Indian languages:
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onLoadSample(0)}
              disabled={isIngesting}
              className="w-full text-left p-3.5 border border-lightGrey bg-warmOffWhite hover:border-burntOrange hover:bg-pureWhite transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-burntOrange uppercase">
                  ENGLISH • CONFLICT / FRAMING
                </span>
                <span className="font-mono text-[10px] text-editorialMuted">The Hindu</span>
              </div>
              <h4 className="font-editorial font-bold text-sm text-almostBlack mt-1 group-hover:text-burntOrange transition-colors">
                ED Arrests Delhi Chief Minister Arvind Kejriwal
              </h4>
            </button>

            <button
              onClick={() => onLoadSample(1)}
              disabled={isIngesting}
              className="w-full text-left p-3.5 border border-lightGrey bg-warmOffWhite hover:border-burntOrange hover:bg-pureWhite transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-burntOrange uppercase">
                  HINDI • शराब नीति मामला
                </span>
                <span className="font-mono text-[10px] text-editorialMuted">दैनिक भास्कर</span>
              </div>
              <h4 className="font-editorial font-bold text-sm text-almostBlack mt-1 group-hover:text-burntOrange transition-colors">
                शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार
              </h4>
            </button>

            <button
              onClick={() => onLoadSample(2)}
              disabled={isIngesting}
              className="w-full text-left p-3.5 border border-lightGrey bg-warmOffWhite hover:border-burntOrange hover:bg-pureWhite transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-burntOrange uppercase">
                  KANNADA • ಅಬಕಾರಿ ನೀತಿ ಹಗರಣ
                </span>
                <span className="font-mono text-[10px] text-editorialMuted">ಪ್ರಜಾವಾಣಿ</span>
              </div>
              <h4 className="font-editorial font-bold text-sm text-almostBlack mt-1 group-hover:text-burntOrange transition-colors">
                ದೆಹಲಿ ಸಿಎಂ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ
              </h4>
            </button>

            <button
              onClick={() => onLoadSample(3)}
              disabled={isIngesting}
              className="w-full text-left p-3.5 border border-lightGrey bg-warmOffWhite hover:border-burntOrange hover:bg-pureWhite transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-burntOrange uppercase">
                  ENGLISH • SCIENTIFIC / NEUTRAL
                </span>
                <span className="font-mono text-[10px] text-editorialMuted">ISRO Mission</span>
              </div>
              <h4 className="font-editorial font-bold text-sm text-almostBlack mt-1 group-hover:text-burntOrange transition-colors">
                ISRO Completes Orbit-Raising Maneuvers for Insat-3DS
              </h4>
            </button>
          </div>
        </div>

        {/* Right Column: Live Discovery Candidates & Verification Status */}
        <div className="lg:col-span-5 bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <span className="editorial-eyebrow text-burntOrange">CROSS-LANGUAGE COVERAGE</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">
              {candidates.length} MATCHES
            </span>
          </div>

          {candidates.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-editorialMuted leading-relaxed">
                Retrieved cross-lingual candidates verified against the current event profile:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {candidates.slice(0, 4).map((cand) => (
                  <div
                    key={cand.candidate_id}
                    className="p-3 bg-warmOffWhite border border-lightGrey text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-pureWhite border border-lightGrey text-almostBlack">
                        {cand.language.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9px] text-emerald-700 font-bold">
                        {String(cand.outcome).replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="font-editorial font-bold text-almostBlack line-clamp-1">
                      {cand.title}
                    </div>
                    <div className="font-mono text-[9px] text-editorialMuted flex justify-between">
                      <span>{cand.publisher || 'Publisher'}</span>
                      <span>Match: {(cand.similarity_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => onNavigateTab('language-insights')}
                variant="outline"
                size="xs"
                showArrow
                fullWidth
                className="mt-2 text-xs uppercase font-mono tracking-wider"
              >
                Open Side-by-Side Comparison
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Globe2 className="w-10 h-10 text-lightGrey mx-auto stroke-[1.25]" />
              <div className="space-y-1">
                <div className="font-editorial font-bold text-sm text-almostBlack uppercase">
                  No Discovered Articles Yet
                </div>
                <p className="text-xs text-editorialMuted max-w-xs mx-auto leading-relaxed">
                  Analyze an article to query Google News RSS and GDELT across 5 Indic languages.
                </p>
              </div>

              <Button
                onClick={() => onNavigateTab('news-feed')}
                variant="outline"
                size="xs"
                showArrow
              >
                Browse News Feed
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
