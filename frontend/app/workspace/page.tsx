'use client';

import React, { useState } from 'react';
import DashboardSidebar, { WorkspaceTab } from '../../components/dashboard/DashboardSidebar';
import DashboardTopBar from '../../components/dashboard/DashboardTopBar';
import DashboardHomeView from '../../components/dashboard/DashboardHomeView';
import NewsFeedView from '../../components/dashboard/NewsFeedView';
import ArticleAnalysisView from '../../components/dashboard/ArticleAnalysisView';
import SentimentEmotionView from '../../components/dashboard/SentimentEmotionView';
import BiasToxicityView from '../../components/dashboard/BiasToxicityView';
import TrendsAnalyticsView from '../../components/dashboard/TrendsAnalyticsView';
import LanguageInsightsView from '../../components/dashboard/LanguageInsightsView';
import SettingsView from '../../components/dashboard/SettingsView';

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
} from '../../types';

import {
  ingestText,
  ingestUrl,
  analyzeArticle,
  compareCoverage,
  compareSelectedCoverage,
  generateFullReport,
  downloadPdfReport
} from '../../lib/api';

const BENCHMARK_SAMPLES = [
  {
    title: 'ED Arrests Delhi Chief Minister Arvind Kejriwal',
    lang: 'en',
    text: `New Delhi: The Enforcement Directorate on Thursday arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case. 

According to officials, the arrest was executed following prolonged questioning at his official residence. Meanwhile, AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy." A senior party spokesperson asserted: "This is completely illegal and without any evidence whatsoever. Everyone in the country knows this is targeted victimization."

However, opposition leaders claimed that law enforcement agencies were acting strictly according to established judicial mandates, denying any political interference. Mr. Kejriwal is expected to be produced before the special court on Friday.`
  },
  {
    title: 'शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार',
    lang: 'hi',
    text: `नई दिल्ली: प्रवर्तन निदेशालय ने गुरुवार शाम को दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार कर लिया। 

अधिकारियों के अनुसार, लंबी पूछताछ के बाद यह कार्रवाई की गई। आम आदमी पार्टी ने इस गिरफ्तारी की कड़ी निंदा की और इसे लोकतंत्र पर "तानाशाही और क्रूर हमला" करार दिया। पार्टी प्रवक्ता ने कहा: "यह पूरी तरह से असंवैधानिक है। हमारे पास न्यायपालिका पर पूरा भरोसा है।" दूसरी ओर, जांच एजेंसी ने दावा किया कि उनके पास पुख्ता सबूत मौजूद हैं।`
  },
  {
    title: 'ದೆಹಲಿ ಸಿಎಂ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ',
    lang: 'kn',
    text: `ನವದೆಹಲಿ: ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಗುರುವಾರ ಬಂಧಿಸಿದೆ.

ಅಧಿಕಾರಿಗಳ ಪ್ರಕಾರ, ದೀರ್ಘ ವಿಚಾರಣೆಯ ನಂತರ ಈ ಬಂಧನ ನಡೆದಿದೆ. ಎಎಪಿ ನಾಯಕರು ಈ ಕ್ರಮವನ್ನು ತೀವ್ರವಾಗಿ ಖಂಡಿಸಿದ್ದು, ಇದು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ "ಸರ್ವಾಧಿಕಾರಿ ದಾಳಿ" ಎಂದು ಕಿಡಿಕಾರಿದ್ದಾರೆ. ಪಕ್ಷದ ವಕ್ತಾರರು ಮಾತನಾಡಿ, "ಇದು ಸಂಪೂರ್ಣ ರಾಜಕೀಯ ಪ್ರೇರಿತ ಕ್ರಮ" ಎಂದು ಆರೋಪಿಸಿದರು.`
  },
  {
    title: 'ISRO Completes Orbit-Raising Maneuvers for Insat-3DS',
    lang: 'en',
    text: `Bengaluru: The Indian Space Research Organisation confirmed on Tuesday that the meteorological satellite Insat-3DS has successfully completed its final orbit-raising maneuvers.

According to ISRO, all onboard propulsion systems functioned nominally during the planned apogee burns. The spacecraft has reached its designated geostationary slot at 74 degrees East longitude. Normal operational observations are scheduled to commence next week following payload calibration.`
  }
];

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Article Pipeline State
  const [ingestedArticle, setIngestedArticle] = useState<IngestedArticle | null>(null);
  const [language, setLanguage] = useState<LanguageDetectionResult | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [entities, setEntities] = useState<NamedEntity[]>([]);
  const [claims, setClaims] = useState<ClaimObservation[]>([]);
  const [framing, setFraming] = useState<FramingAnalysisResult | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [eventProfile, setEventProfile] = useState<EventProfile | null>(null);
  const [generatedQueries, setGeneratedQueries] = useState<LanguageQuery[]>([]);

  // Discovery & Cross-lingual State
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<string[]>([
    'en', 'hi', 'kn', 'te', 'ta'
  ]);
  const [candidates, setCandidates] = useState<ArticleCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [providerReports, setProviderReports] = useState<ProviderStatusReport[]>([]);
  const [comparison, setComparison] = useState<CrossLanguageComparisonResult | undefined>(undefined);

  // Full Report State
  const [fullReport, setFullReport] = useState<FullAnalysisReport | undefined>(undefined);

  // Loading & Error States
  const [isIngesting, setIsIngesting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Executes Full NLP Analysis on an Ingested Article
  const handleArticleIngested = async (article: IngestedArticle) => {
    setIngestedArticle(article);
    setGlobalError(null);
    setIsIngesting(true);

    try {
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

      // Auto-trigger full report compilation in the background for PDF generation
      try {
        const rep = await generateFullReport(article, selectedTargetLanguages);
        setFullReport(rep);
        if (rep.candidates && rep.candidates.length > 0) {
          setCandidates(rep.candidates);
        }
        if (rep.comparison) {
          setComparison(rep.comparison);
        }
      } catch {
        // Non-blocking report generation
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Error executing NLP pipeline on ingested article.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Quick Ingestion from Top Search Bar (detects URL vs raw text)
  const handleQuickIngest = async (textOrUrl: string) => {
    setIsIngesting(true);
    setGlobalError(null);
    try {
      const isUrl = /^https?:\/\//i.test(textOrUrl.trim());
      let article: IngestedArticle;
      if (isUrl) {
        article = await ingestUrl(textOrUrl.trim());
      } else {
        article = await ingestText(textOrUrl.trim());
      }
      await handleArticleIngested(article);
      setActiveTab('article-analysis');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to ingest input.');
      setIsIngesting(false);
    }
  };

  // Ingest from News Feed
  const handleSelectArticleFromFeed = async (title: string, text: string, langCode: string) => {
    setIsIngesting(true);
    setGlobalError(null);
    try {
      const article = await ingestText(text, title);
      await handleArticleIngested(article);
      setActiveTab('article-analysis');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to ingest feed article.');
      setIsIngesting(false);
    }
  };

  // Load a Benchmark Sample
  const handleLoadSample = async (sampleIndex: number) => {
    const s = BENCHMARK_SAMPLES[sampleIndex];
    if (!s) return;
    await handleSelectArticleFromFeed(s.title, s.text, s.lang);
  };

  // Toggle Language Checkboxes
  const handleToggleLanguage = (code: string) => {
    setSelectedTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Trigger Cross-Language News Discovery
  const handleRunDiscovery = async () => {
    if (!ingestedArticle || !eventProfile) return;
    setIsSearching(true);
    setGlobalError(null);
    try {
      const res = await compareCoverage(ingestedArticle, eventProfile, selectedTargetLanguages);
      setCandidates(res.candidates);
      setProviderReports(res.provider_reports);
      setComparison(res.comparison);

      // Auto-select verified candidates
      const eligibleIds = res.candidates
        .filter((c: ArticleCandidate) => {
          const norm = String(c.outcome).toUpperCase().replace(/_/g, ' ');
          return norm.includes('VERIFIED') || norm.includes('POSSIBLE') || norm.includes('LIKELY');
        })
        .map((c: ArticleCandidate) => c.candidate_id);
      setSelectedCandidateIds(eligibleIds);
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

  // Compare Selected Articles
  const handleCompareSelected = async () => {
    if (!ingestedArticle || selectedCandidateIds.length === 0) return;
    const selectedArticles = candidates.filter((c) =>
      selectedCandidateIds.includes(c.candidate_id)
    );

    setIsComparing(true);
    setGlobalError(null);
    try {
      const res = await compareSelectedCoverage(
        ingestedArticle,
        selectedArticles,
        language?.language_code
      );
      setComparison(res.comparison);
      if (res.candidates && res.candidates.length > 0) {
        setCandidates((prev) =>
          prev.map((c) => {
            const updated = res.candidates.find((uc) => uc.candidate_id === c.candidate_id);
            return updated || c;
          })
        );
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to compare selected candidates.');
    } finally {
      setIsComparing(false);
    }
  };

  // Download PDF Report
  const handleExportPdf = async () => {
    if (!fullReport) return;
    try {
      const blob = await downloadPdfReport(fullReport);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `framing_report_${fullReport.article.article_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setGlobalError(`PDF download failed: ${err.message}`);
    }
  };

  // Reset Session State
  const handleResetAllState = () => {
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

  const tabTitles: Record<WorkspaceTab, string> = {
    dashboard: 'Dashboard',
    'news-feed': 'News Feed',
    'article-analysis': 'Article Analysis',
    'sentiment-emotion': 'Sentiment & Emotion',
    'bias-toxicity': 'Bias & Toxicity',
    'trends-analytics': 'Trends & Analytics',
    'language-insights': 'Language Insights',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-warmOffWhite flex flex-col md:flex-row text-almostBlack">
      {/* 1. Left Minimal Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasArticle={!!ingestedArticle}
        framingCount={framing?.findings.length || 0}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation & Quick Ingest Bar */}
        <DashboardTopBar
          activeTabTitle={tabTitles[activeTab]}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickIngest={handleQuickIngest}
          isIngesting={isIngesting}
          activeArticle={ingestedArticle}
          onResetArticle={handleResetAllState}
          onExportPdf={handleExportPdf}
          hasReport={!!fullReport}
        />

        {/* Global Error Banner */}
        {globalError && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center justify-between">
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold ml-4 uppercase tracking-wider text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active View Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardHomeView
              article={ingestedArticle}
              language={language}
              sentiment={sentiment}
              emotion={emotion}
              framing={framing}
              candidates={candidates}
              onNavigateTab={setActiveTab}
              onLoadSample={handleLoadSample}
              isIngesting={isIngesting}
            />
          )}

          {activeTab === 'news-feed' && (
            <NewsFeedView
              candidates={candidates}
              activeArticle={ingestedArticle}
              onSelectArticleForAnalysis={handleSelectArticleFromFeed}
              onNavigateTab={setActiveTab}
              isIngesting={isIngesting}
            />
          )}

          {activeTab === 'article-analysis' && (
            <ArticleAnalysisView
              article={ingestedArticle}
              language={language}
              summary={summary}
              eventProfile={eventProfile}
              entities={entities}
              claims={claims}
              onArticleIngested={handleArticleIngested}
              isLoading={isIngesting}
              setIsLoading={setIsIngesting}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'sentiment-emotion' && (
            <SentimentEmotionView
              article={ingestedArticle}
              sentiment={sentiment}
              emotion={emotion}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'bias-toxicity' && (
            <BiasToxicityView
              article={ingestedArticle}
              framing={framing}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'trends-analytics' && (
            <TrendsAnalyticsView
              article={ingestedArticle}
              sentiment={sentiment}
              emotion={emotion}
              framing={framing}
              entities={entities}
              candidates={candidates}
              fullReport={fullReport}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'language-insights' && (
            <LanguageInsightsView
              article={ingestedArticle}
              eventProfile={eventProfile}
              queries={generatedQueries}
              candidates={candidates}
              providerReports={providerReports}
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
              comparison={comparison}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onResetAllState={handleResetAllState}
              selectedLanguages={selectedTargetLanguages}
              onToggleLanguage={handleToggleLanguage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
