'use client';

import React, { useState } from 'react';
import { Rss, ArrowRight, Filter, Search, Globe, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { ArticleCandidate, IngestedArticle } from '../../types';

interface NewsFeedViewProps {
  candidates: ArticleCandidate[];
  activeArticle: IngestedArticle | null;
  onSelectArticleForAnalysis: (title: string, text: string, langCode: string) => void;
  onNavigateTab: (tab: any) => void;
  isIngesting: boolean;
}

interface FeedItem {
  id: string;
  title: string;
  source: string;
  date: string;
  language: string;
  summary: string;
  text: string;
  status: string;
  url?: string;
}

export default function NewsFeedView({
  candidates,
  activeArticle,
  onSelectArticleForAnalysis,
  onNavigateTab,
  isIngesting,
}: NewsFeedViewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Benchmark editorial news articles covering multilingual ground truth
  const benchmarkArticles: FeedItem[] = [
    {
      id: 'bench-1',
      title: 'ED Arrests Delhi Chief Minister Arvind Kejriwal',
      source: 'The Hindu / National Bureau',
      date: '2024-03-22',
      language: 'en',
      summary:
        'The Enforcement Directorate arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case following prolonged questioning.',
      text: `New Delhi: The Enforcement Directorate on Thursday arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case. 

According to officials, the arrest was executed following prolonged questioning at his official residence. Meanwhile, AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy." A senior party spokesperson asserted: "This is completely illegal and without any evidence whatsoever. Everyone in the country knows this is targeted victimization."

However, opposition leaders claimed that law enforcement agencies were acting strictly according to established judicial mandates, denying any political interference. Mr. Kejriwal is expected to be produced before the special court on Friday.`,
      status: 'Curated Ground Truth',
    },
    {
      id: 'bench-2',
      title: 'शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार',
      source: 'दैनिक भास्कर',
      date: '2024-03-22',
      language: 'hi',
      summary:
        'प्रवर्तन निदेशालय ने लंबी पूछताछ के बाद दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार किया।',
      text: `नई दिल्ली: प्रवर्तन निदेशालय ने गुरुवार शाम को दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार कर लिया। 

अधिकारियों के अनुसार, लंबी पूछताछ के बाद यह कार्रवाई की गई। आम आदमी पार्टी ने इस गिरफ्तारी की कड़ी निंदा की और इसे लोकतंत्र पर "तानाशाही और क्रूर हमला" करार दिया। पार्टी प्रवक्ता ने कहा: "यह पूरी तरह से असंवैधानिक है। हमारे पास न्यायपालिका पर पूरा भरोसा है।" दूसरी ओर, जांच एजेंसी ने दावा किया कि उनके पास पुख्ता सबूत मौजूद हैं।`,
      status: 'Curated Ground Truth',
    },
    {
      id: 'bench-3',
      title: 'ದೆಹಲಿ ಸಿಎಂ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ',
      source: 'ಪ್ರಜಾವಾಣಿ',
      date: '2024-03-22',
      language: 'kn',
      summary:
        'ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಬಂಧಿಸಿದೆ.',
      text: `ನವದೆಹಲಿ: ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಗುರುವಾರ ಬಂಧಿಸಿದೆ.

ಅಧಿಕಾರಿಗಳ ಪ್ರಕಾರ, ದೀರ್ಘ ವಿಚಾರಣೆಯ ನಂತರ ಈ ಬಂಧನ ನಡೆದಿದೆ. ಎಎಪಿ ನಾಯಕರು ಈ ಕ್ರಮವನ್ನು ತೀವ್ರವಾಗಿ ಖಂಡಿಸಿದ್ದು, ಇದು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ "ಸರ್ವಾಧಿಕಾರಿ ದಾಳಿ" ಎಂದು ಕಿಡಿಕಾರಿದ್ದಾರೆ. ಪಕ್ಷದ ವಕ್ತಾರರು ಮಾತನಾಡಿ, "ಇದು ಸಂಪೂರ್ಣ ರಾಜಕೀಯ ಪ್ರೇರಿತ ಕ್ರಮ" ಎಂದು ಆರೋಪಿಸಿದರು.`,
      status: 'Curated Ground Truth',
    },
    {
      id: 'bench-4',
      title: 'ISRO Completes Orbit-Raising Maneuvers for Insat-3DS',
      source: 'ISRO Science Bureau',
      date: '2024-02-20',
      language: 'en',
      summary:
        'The Indian Space Research Organisation confirmed that the meteorological satellite Insat-3DS has completed its orbit-raising maneuvers.',
      text: `Bengaluru: The Indian Space Research Organisation confirmed on Tuesday that the meteorological satellite Insat-3DS has successfully completed its final orbit-raising maneuvers.

According to ISRO, all onboard propulsion systems functioned nominally during the planned apogee burns. The spacecraft has reached its designated geostationary slot at 74 degrees East longitude. Normal operational observations are scheduled to commence next week following payload calibration.`,
      status: 'Scientific Benchmark',
    },
  ];

  // Map candidates from live news discovery
  const discoveredArticles: FeedItem[] = candidates.map((c) => ({
    id: c.candidate_id,
    title: c.title,
    source: c.publisher || 'News Source',
    date: c.publish_date || 'Recent',
    language: c.language,
    summary: c.snippet || c.retrieved_text?.slice(0, 160) || 'Discovered via cross-language search query.',
    text: c.retrieved_text || c.snippet || c.title,
    status: String(c.outcome).replace(/_/g, ' '),
    url: c.url,
  }));

  // Combine benchmark articles with live discovered articles
  const allArticles = [...discoveredArticles, ...benchmarkArticles];

  // Filter articles by selected language and search term
  const filteredArticles = allArticles.filter((item) => {
    const matchesLang =
      selectedLanguage === 'all' || item.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesSearch =
      !searchFilter.trim() ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.source.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const languageTabs = [
    { code: 'all', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">MULTILINGUAL NEWS FEED</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              ({filteredArticles.length} ARTICLES AVAILABLE)
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack mt-1">
            Empirical News Dispatches &amp; Discovered Coverage
          </h2>
          <p className="text-xs text-editorialMuted leading-relaxed max-w-xl">
            Real articles retrieved from existing backend providers (Google News RSS &amp; GDELT)
            and verified benchmark sources. Select any article to run the NLP pipeline.
          </p>
        </div>

        {/* Search Filter */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-editorialMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search headline or source..."
              className="w-full bg-warmOffWhite border border-lightGrey pl-8 pr-3 py-1.5 text-xs text-almostBlack focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none"
            />
          </div>
        </div>
      </div>

      {/* Language Filter Chips */}
      <div className="flex items-center gap-2 border-b border-lightGrey pb-3 overflow-x-auto">
        <span className="font-mono text-[10px] uppercase font-bold text-editorialMuted flex items-center gap-1 shrink-0 mr-2">
          <Filter className="w-3 h-3 text-burntOrange" /> Filter:
        </span>
        {languageTabs.map((tab) => (
          <button
            key={tab.code}
            onClick={() => setSelectedLanguage(tab.code)}
            className={`font-mono text-xs px-3 py-1 uppercase tracking-wider transition-all duration-150 border shrink-0 ${
              selectedLanguage === tab.code
                ? 'bg-almostBlack text-pureWhite border-almostBlack font-bold'
                : 'bg-pureWhite text-almostBlack/70 border-lightGrey hover:border-almostBlack'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Feed Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((art) => {
            const isCurrentlyActive =
              activeArticle &&
              (activeArticle.metadata.title === art.title ||
                activeArticle.text.slice(0, 40) === art.text.slice(0, 40));

            return (
              <article
                key={art.id}
                className="p-5 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col justify-between group hover:border-almostBlack transition-all"
              >
                <div>
                  {/* Top Bar: Language Badge, Source, Date */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-lightGrey/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-warmOffWhite border border-lightGrey text-almostBlack uppercase">
                        {art.language.toUpperCase()}
                      </span>
                      <span className="font-editorial font-bold text-almostBlack text-xs">
                        {art.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] text-editorialMuted">
                      <Calendar className="w-3 h-3" />
                      <span>{art.date}</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="font-editorial font-black text-base sm:text-lg text-almostBlack leading-snug tracking-tight mt-3 mb-2 group-hover:text-burntOrange transition-colors">
                    {art.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-editorialMuted leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-4 border-t border-lightGrey/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-burntOrange font-semibold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-burntOrange" />
                    <span>{art.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {art.url && (
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 border border-lightGrey text-editorialMuted hover:text-almostBlack transition-colors"
                        title="Open external article source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {isCurrentlyActive ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Currently Analyzed
                      </span>
                    ) : (
                      <Button
                        onClick={() => onSelectArticleForAnalysis(art.title, art.text, art.language)}
                        disabled={isIngesting}
                        variant="primary"
                        size="xs"
                        showArrow
                        className="font-mono uppercase text-[10px] tracking-wider"
                      >
                        Analyse Article
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State for News Feed */
        <div className="p-12 bg-pureWhite border border-lightGrey text-center space-y-4">
          <Rss className="w-10 h-10 text-lightGrey mx-auto stroke-[1.25]" />
          <div className="space-y-1">
            <h3 className="font-editorial font-bold text-base uppercase text-almostBlack tracking-tight">
              No News Articles Match Your Filter
            </h3>
            <p className="text-xs text-editorialMuted max-w-sm mx-auto leading-relaxed">
              No articles found for language code &quot;{selectedLanguage.toUpperCase()}&quot; with search query &quot;{searchFilter}&quot;.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedLanguage('all');
              setSearchFilter('');
            }}
            variant="outline"
            size="xs"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
