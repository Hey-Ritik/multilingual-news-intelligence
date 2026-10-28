'use client';

import React, { useState } from 'react';
import ArticleSubmission from '../components/ArticleSubmission';
import ArticleOverview from '../components/ArticleOverview';
import NlpPipelineView from '../components/NlpPipelineView';
import FramingAnalysisView from '../components/FramingAnalysisView';
import CrossLanguageDiscoveryView from '../components/CrossLanguageDiscoveryView';
import CrossLanguageComparisonView from '../components/CrossLanguageComparisonView';
import StatisticalReportView from '../components/StatisticalReportView';

import {
  IngestedArticle,
  LanguageDetectionResult,
  SentimentResult,
  EmotionResult,
  NamedEntity,
  ClaimObservation,
  FramingAnalysisResult,
  SummaryResult,
  EventProfile,
  LanguageQuery,
  ArticleCandidate,
  ProviderStatusReport,
  CrossLanguageComparisonResult,
  FullAnalysisReport
} from '../types';

import {
  analyzeArticle,
  compareCoverage,
  compareSelectedCoverage,
  generateFullReport
} from '../lib/api';

import {
  FileText,
  Activity,
  ShieldCheck,
  Globe2,
  GitCompare,
  BarChart3,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [ingestedArticle, setIngestedArticle] = useState<IngestedArticle | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<
    'overview' | 'nlp' | 'framing' | 'discovery' | 'comparison' | 'report'
  >('overview');

  // Analysis States
  const [language, setLanguage] = useState<LanguageDetectionResult | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [entities, setEntities] = useState<NamedEntity[]>([]);
  const [claims, setClaims] = useState<ClaimObservation[]>([]);
  const [framing, setFraming] = useState<FramingAnalysisResult | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [eventProfile, setEventProfile] = useState<EventProfile | null>(null);
  const [generatedQueries, setGeneratedQueries] = useState<LanguageQuery[]>([]);

  // Discovery & Comparison States
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<string[]>([
    'en', 'hi', 'kn', 'te', 'ta'
  ]);
  const [candidates, setCandidates] = useState<ArticleCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [providerReports, setProviderReports] = useState<ProviderStatusReport[]>([]);
  const [comparison, setComparison] = useState<CrossLanguageComparisonResult | undefined>(undefined);

  // Full Report State
  const [fullReport, setFullReport] = useState<FullAnalysisReport | undefined>(undefined);

  // Loading States
  const [isIngesting, setIsIngesting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleArticleIngested = async (article: IngestedArticle) => {
    setIngestedArticle(article);
    setGlobalError(null);
    setIsIngesting(true);

    try {
      // Execute the NLP Pipeline
      const res = await analyzeArticle(article);
      setLanguage(res.language);
      setSentiment(res.sentiment);
      setEmotion(res.emotion);
      setEntities(res.entities);
      setClaims(res.claims);
      setFraming(res.framing);
      setSummary(res.summary);
      setEventProfile(res.event_profile);
      setGeneratedQueries(res.generated_queries);
      setActiveViewTab('overview');
    } catch (err: any) {
      setGlobalError(err.message || 'Error executing NLP pipeline on ingested article.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleToggleLanguage = (code: string) => {
    setSelectedTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleRunDiscovery = async () => {
    if (!ingestedArticle || !eventProfile) return;
    setIsSearching(true);
    setGlobalError(null);
    try {
      const res = await compareCoverage(ingestedArticle, eventProfile, selectedTargetLanguages);
      setCandidates(res.candidates);
      setProviderReports(res.provider_reports);
      setComparison(res.comparison);

      // Auto-select eligible candidates
      const eligibleIds = res.candidates
        .filter((c: ArticleCandidate) => {
          const norm = String(c.outcome).toUpperCase().replace(/_/g, ' ');
          return norm.includes('VERIFIED') || norm.includes('POSSIBLE') || norm.includes('LIKELY');
        })
        .map((c: ArticleCandidate) => c.candidate_id);
      setSelectedCandidateIds(eligibleIds);

      setActiveViewTab('discovery');
    } catch (err: any) {
      setGlobalError(err.message || 'Error querying cross-language coverage providers.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleCandidateSelect = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = candidates
      .filter((c) => {
        const norm = String(c.outcome).toUpperCase().replace(/_/g, ' ');
        return norm.includes('VERIFIED') || norm.includes('POSSIBLE') || norm.includes('LIKELY');
      })
      .map((c) => c.candidate_id);
    setSelectedCandidateIds(eligibleIds);
  };

  const handleClearCandidateSelection = () => {
    setSelectedCandidateIds([]);
  };

  const handleCompareSelected = async () => {
    if (!ingestedArticle) return;
    if (selectedCandidateIds.length === 0) {
      setGlobalError('Please select at least one candidate article to compare against the source article.');
      return;
    }

    const selectedArticles = candidates.filter((c) =>
      selectedCandidateIds.includes(c.candidate_id)
    );

    // Validate languages: ensure at least one article has a different language or two articles are selected
    const languagesPresent = new Set([
      language?.language_code || 'en',
      ...selectedArticles.map((c) => c.language)
    ]);
    if (languagesPresent.size < 2 && selectedArticles.length < 2) {
      setGlobalError('Cross-language comparison requires articles from at least two languages or two distinct publications.');
      return;
    }

    setIsComparing(true);
    setGlobalError(null);
    try {
      const res = await compareSelectedCoverage(
        ingestedArticle,
        selectedArticles,
        language?.language_code
      );
      setComparison(res.comparison);
      // Update candidates with any newly retrieved body texts
      if (res.candidates && res.candidates.length > 0) {
        setCandidates((prev) =>
          prev.map((c) => {
            const updated = res.candidates.find((uc) => uc.candidate_id === c.candidate_id);
            return updated || c;
          })
        );
      }
      setActiveViewTab('comparison');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to generate cross-language framing comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleGenerateFullReport = async () => {
    if (!ingestedArticle) return;
    setIsGeneratingReport(true);
    setGlobalError(null);
    try {
      const report = await generateFullReport(ingestedArticle, selectedTargetLanguages);
      setFullReport(report);
      setCandidates(report.candidates);
      setProviderReports(report.provider_statuses);
      setComparison(report.comparison);
      setActiveViewTab('report');
    } catch (err: any) {
      setGlobalError(err.message || 'Error compiling statistical report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleReset = () => {
    setIngestedArticle(null);
    setLanguage(null);
    setSentiment(null);
    setEmotion(null);
    setEntities([]);
    setClaims([]);
    setFraming(null);
    setSummary(null);
    setEventProfile(null);
    setGeneratedQueries([]);
    setCandidates([]);
    setProviderReports([]);
    setComparison(undefined);
    setFullReport(undefined);
    setGlobalError(null);
  };

  return (
    <div className="space-y-8">
      {/* Intro Hero if no article is ingested */}
      {!ingestedArticle && (
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Explainable Cross-Language Linguistic Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explainable News Framing &amp; Bias Detection
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Analyze how news articles published in <strong>English, Hindi, Kannada, Telugu, and Tamil</strong> describe
            and frame the same event. Inspect exact textual evidence, actor agency, emotion attribution, and cross-language divergences.
          </p>
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex justify-between items-center">
          <span>{globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Article Submission Component */}
      {!ingestedArticle ? (
        <ArticleSubmission
          onArticleIngested={handleArticleIngested}
          isLoading={isIngesting}
          setIsLoading={setIsIngesting}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Article Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs text-slate-400 font-medium">Currently Analyzing</div>
                <div className="font-bold text-slate-900 text-sm truncate max-w-md">
                  {ingestedArticle.metadata.title || 'Submitted Article'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Submit New Article
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 shadow-2xs gap-1">
            <button
              type="button"
              onClick={() => setActiveViewTab('overview')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'overview'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Overview &amp; Summary
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('nlp')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'nlp'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> NLP Pipeline
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('framing')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'framing'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Bias &amp; Framing Analysis
              {framing && framing.findings.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                  {framing.findings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('discovery')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'discovery'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> Cross-Language Discovery
              {candidates.length > 0 && (
                <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded-full text-[10px]">
                  {candidates.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('comparison')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'comparison'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" /> Framing Comparison
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('report')}
              className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition ${
                activeViewTab === 'report'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Statistical Report &amp; PDF
            </button>
          </div>

          {/* Active Tab Content Views */}
          {activeViewTab === 'overview' && language && summary && eventProfile && (
            <ArticleOverview
              article={ingestedArticle}
              language={language}
              summary={summary}
              eventProfile={eventProfile}
            />
          )}

          {activeViewTab === 'nlp' && sentiment && emotion && (
            <NlpPipelineView
              sentiment={sentiment}
              emotion={emotion}
              entities={entities}
              claims={claims}
            />
          )}

          {activeViewTab === 'framing' && framing && (
            <FramingAnalysisView
              originalText={ingestedArticle.text}
              framing={framing}
            />
          )}

          {activeViewTab === 'discovery' && (
            <CrossLanguageDiscoveryView
              candidates={candidates}
              providerReports={providerReports}
              queries={generatedQueries}
              selectedLanguages={selectedTargetLanguages}
              onToggleLanguage={handleToggleLanguage}
              onRunSearch={handleRunDiscovery}
              isSearching={isSearching}
              selectedCandidateIds={selectedCandidateIds}
              onToggleCandidateSelect={handleToggleCandidateSelect}
              onSelectAllEligible={handleSelectAllEligible}
              onClearCandidateSelection={handleClearCandidateSelection}
              onCompareSelected={handleCompareSelected}
              isComparing={isComparing}
            />
          )}

          {activeViewTab === 'comparison' && (
            <CrossLanguageComparisonView
              comparison={comparison}
              baseArticleTitle={ingestedArticle.metadata.title || 'Submitted Article'}
              onGoToDiscovery={() => setActiveViewTab('discovery')}
            />
          )}

          {activeViewTab === 'report' && (
            <StatisticalReportView
              report={fullReport}
              onGenerateReport={handleGenerateFullReport}
              isGenerating={isGeneratingReport}
            />
          )}
        </div>
      )}
    </div>
  );
}

