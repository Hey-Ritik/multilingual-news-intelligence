'use client';

import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Upload, Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';
import { ingestText, ingestUrl, ingestPdf } from '../lib/api';
import { IngestedArticle } from '../types';
import { Button } from './ui/Button';

interface ArticleSubmissionProps {
  onArticleIngested: (article: IngestedArticle) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const SAMPLE_ARTICLES = [
  {
    label: 'English: Enforcement Directorate (Conflict/Framing)',
    title: 'ED Arrests Delhi Chief Minister Arvind Kejriwal',
    lang: 'EN',
    text: `New Delhi: The Enforcement Directorate on Thursday arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case. 

According to officials, the arrest was executed following prolonged questioning at his official residence. Meanwhile, AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy." A senior party spokesperson asserted: "This is completely illegal and without any evidence whatsoever. Everyone in the country knows this is targeted victimization."

However, opposition leaders claimed that law enforcement agencies were acting strictly according to established judicial mandates, denying any political interference. Mr. Kejriwal is expected to be produced before the special court on Friday.`
  },
  {
    label: 'Hindi: शराब नीति मामले में केजरीवाल गिरफ्तार (Devanagari)',
    title: 'शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार',
    lang: 'HI',
    text: `नई दिल्ली: प्रवर्तन निदेशालय ने गुरुवार शाम को दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार कर लिया। 

अधिकारियों के अनुसार, लंबी पूछताछ के बाद यह कार्रवाई की गई। आम आदमी पार्टी ने इस गिरफ्तारी की कड़ी निंदा की और इसे लोकतंत्र पर "तानाशाही और क्रूर हमला" करार दिया। पार्टी प्रवक्ता ने कहा: "यह पूरी तरह से असंवैधानिक है। हमारे पास न्यायपालिका पर पूरा भरोसा है।" दूसरी ओर, जांच एजेंसी ने दावा किया कि उनके पास पुख्ता सबूत मौजूद हैं।`
  },
  {
    label: 'Kannada: ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ (Kannada Script)',
    title: 'ದೆಹಲಿ ಸಿಎಂ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ',
    lang: 'KN',
    text: `ನವದೆಹಲಿ: ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಗುರುವಾರ ಬಂಧಿಸಿದೆ.

ಅಧಿಕಾರಿಗಳ ಪ್ರಕಾರ, ದೀರ್ಘ ವಿಚಾರಣೆಯ ನಂತರ ಈ ಬಂಧನ ನಡೆದಿದೆ. ಎಎಪಿ ನಾಯಕರು ಈ ಕ್ರಮವನ್ನು ತೀವ್ರವಾಗಿ ಖಂಡಿಸಿದ್ದು, ಇದು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ "ಸರ್ವಾಧಿಕಾರಿ ದಾಳಿ" ಎಂದು ಕಿಡಿಕಾರಿದ್ದಾರೆ. ಪಕ್ಷದ ವಕ್ತಾರರು ಮಾತನಾಡಿ, "ಇದು ಸಂಪೂರ್ಣ ರಾಜಕೀಯ ಪ್ರೇರಿತ ಕ್ರಮ" ಎಂದು ಆರೋಪಿಸಿದರು.`
  },
  {
    label: 'English: Neutral Space Research Mission (Scientific)',
    title: 'ISRO Completes Orbit-Raising Maneuvers for Insat-3DS',
    lang: 'EN',
    text: `Bengaluru: The Indian Space Research Organisation confirmed on Tuesday that the meteorological satellite Insat-3DS has successfully completed its final orbit-raising maneuvers.

According to ISRO, all onboard propulsion systems functioned nominally during the planned apogee burns. The spacecraft has reached its designated geostationary slot at 74 degrees East longitude. Normal operational observations are scheduled to commence next week following payload calibration.`
  }
];

export default function ArticleSubmission({
  onArticleIngested,
  isLoading,
  setIsLoading
}: ArticleSubmissionProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'pdf'>('text');
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMessage('Please enter article text.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestText(pastedText, pastedTitle || undefined);
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to ingest article text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an article URL.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestUrl(urlInput.trim());
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to ingest URL article.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a PDF document.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestPdf(selectedFile);
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_ARTICLES[0]) => {
    setActiveTab('text');
    setPastedTitle(sample.title);
    setPastedText(sample.text);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Sample Loaders Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-editorialMuted uppercase">
          <Sparkles className="w-3.5 h-3.5 text-burntOrange" />
          <span>Curated Empirical Test Cases</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_ARTICLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="px-2.5 py-1.5 text-xs font-mono bg-warmOffWhite hover:bg-pureWhite text-almostBlack border border-lightGrey hover:border-burntOrange transition-all flex items-center gap-2 group text-left"
            >
              <span className="font-bold text-[10px] text-burntOrange border-r border-lightGrey pr-1.5">
                {sample.lang}
              </span>
              <span className="truncate max-w-[220px] sm:max-w-none">{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Swiss Ingestion Tabs */}
      <div className="border border-lightGrey bg-warmOffWhite">
        <div className="flex border-b border-lightGrey">
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all border-r border-lightGrey ${
              activeTab === 'text'
                ? 'bg-pureWhite text-burntOrange border-b-2 border-b-burntOrange'
                : 'text-editorialMuted hover:text-almostBlack hover:bg-pureWhite/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 01 / Paste Text
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all border-r border-lightGrey ${
              activeTab === 'url'
                ? 'bg-pureWhite text-burntOrange border-b-2 border-b-burntOrange'
                : 'text-editorialMuted hover:text-almostBlack hover:bg-pureWhite/50'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> 02 / Enter URL
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('pdf'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pdf'
                ? 'bg-pureWhite text-burntOrange border-b-2 border-b-burntOrange'
                : 'text-editorialMuted hover:text-almostBlack hover:bg-pureWhite/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> 03 / Upload PDF
          </button>
        </div>

        <div className="p-6 bg-pureWhite">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-mono font-bold uppercase tracking-wider">Ingestion Notice</div>
                <div className="mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Tab 1: Paste Text */}
          {activeTab === 'text' && (
            <form onSubmit={handleSubmitText} className="space-y-4">
              <div>
                <label
                  htmlFor="article-title"
                  className="block font-mono text-[11px] font-bold text-almostBlack uppercase tracking-wider mb-1.5"
                >
                  Headline / Title (Optional)
                </label>
                <input
                  id="article-title"
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="e.g. Government Announces Major Healthcare Reform"
                  className="w-full px-3.5 py-2.5 bg-warmOffWhite border border-lightGrey text-xs text-almostBlack placeholder-editorialMuted focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none font-sans transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="article-body"
                  className="block font-mono text-[11px] font-bold text-almostBlack uppercase tracking-wider mb-1.5"
                >
                  Article Body (English, Hindi, Kannada, Telugu, or Tamil)
                </label>
                <textarea
                  id="article-body"
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the full news article text here. Native scripts and Unicode code points are strictly preserved without transliteration distortion..."
                  className="w-full px-3.5 py-2.5 bg-warmOffWhite border border-lightGrey text-xs text-almostBlack placeholder-editorialMuted focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none font-serif leading-relaxed transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <span className="font-mono text-[10px] text-editorialMuted">
                  Characters: {pastedText.length} • Words: {pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0}
                </span>

                <Button
                  type="submit"
                  disabled={isLoading || !pastedText.trim()}
                  variant="primary"
                  size="sm"
                  showArrow={!isLoading}
                  icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  iconPosition="left"
                  className="uppercase tracking-wider font-mono text-xs px-6"
                >
                  {isLoading ? 'Tokenizing & Analyzing...' : 'Analyze Article'}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleSubmitUrl} className="space-y-4">
              <div>
                <label
                  htmlFor="article-url"
                  className="block font-mono text-[11px] font-bold text-almostBlack uppercase tracking-wider mb-1.5"
                >
                  Article Web Address (HTTP/HTTPS)
                </label>
                <input
                  id="article-url"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.thehindu.com/news/national/article12345.ece"
                  className="w-full px-3.5 py-2.5 bg-warmOffWhite border border-lightGrey text-xs text-almostBlack placeholder-editorialMuted focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none font-mono transition-all"
                />
                <p className="font-mono text-[10px] text-editorialMuted mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>SSRF Protected: Validates destination IPs and blocks RFC1918 / loopback ranges.</span>
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  variant="primary"
                  size="sm"
                  showArrow={!isLoading}
                  icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  iconPosition="left"
                  className="uppercase tracking-wider font-mono text-xs px-6"
                >
                  {isLoading ? 'Fetching & Parsing...' : 'Ingest & Extract'}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 3: PDF */}
          {activeTab === 'pdf' && (
            <form onSubmit={handleSubmitPdf} className="space-y-4">
              <div className="border border-dashed border-lightGrey hover:border-burntOrange p-8 text-center bg-warmOffWhite/50 transition-colors">
                <Upload className="w-8 h-8 text-editorialMuted mx-auto mb-2" />
                <label htmlFor="article-pdf" className="cursor-pointer block">
                  <span className="font-mono text-xs font-bold text-burntOrange hover:underline uppercase tracking-wider">
                    Select a PDF news document
                  </span>
                  <input
                    id="article-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="sr-only"
                  />
                </label>
                <p className="font-mono text-[10px] text-editorialMuted mt-1.5">
                  Direct text layer extraction via PyMuPDF. Preserves paragraph bounds.
                </p>
                {selectedFile && (
                  <div className="mt-3 text-xs font-mono font-bold text-almostBlack bg-pureWhite inline-flex items-center gap-1.5 px-3 py-1 border border-lightGrey">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !selectedFile}
                  variant="primary"
                  size="sm"
                  showArrow={!isLoading}
                  icon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  iconPosition="left"
                  className="uppercase tracking-wider font-mono text-xs px-6"
                >
                  {isLoading ? 'Extracting Text...' : 'Ingest PDF'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
