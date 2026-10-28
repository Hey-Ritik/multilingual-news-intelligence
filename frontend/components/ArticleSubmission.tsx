import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Upload, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ingestText, ingestUrl, ingestPdf } from '../lib/api';
import { IngestedArticle } from '../types';

interface ArticleSubmissionProps {
  onArticleIngested: (article: IngestedArticle) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const SAMPLE_ARTICLES = [
  {
    label: "English: Enforcement Directorate Arrest (Conflict/Framing)",
    title: "ED Arrests Delhi Chief Minister Arvind Kejriwal",
    text: `New Delhi: The Enforcement Directorate on Thursday arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case. 

According to officials, the arrest was executed following prolonged questioning at his official residence. Meanwhile, AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy." A senior party spokesperson asserted: "This is completely illegal and without any evidence whatsoever. Everyone in the country knows this is targeted victimization."

However, opposition leaders claimed that law enforcement agencies were acting strictly according to established judicial mandates, denying any political interference. Mr. Kejriwal is expected to be produced before the special court on Friday.`
  },
  {
    label: "Hindi: शराब नीति मामले में केजरीवाल गिरफ्तार (Devanagari)",
    title: "शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार",
    text: `नई दिल्ली: प्रवर्तन निदेशालय ने गुरुवार शाम को दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार कर लिया। 

अधिकारियों के अनुसार, लंबी पूछताछ के बाद यह कार्रवाई की गई। आम आदमी पार्टी ने इस गिरफ्तारी की कड़ी निंदा की और इसे लोकतंत्र पर "तानाशाही और क्रूर हमला" करार दिया। पार्टी प्रवक्ता ने कहा: "यह पूरी तरह से असंवैधानिक है। हमारे पास न्यायपालिका पर पूरा भरोसा है।" दूसरी ओर, जांच एजेंसी ने दावा किया कि उनके पास पुख्ता सबूत मौजूद हैं।`
  },
  {
    label: "Kannada: ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ (Kannada Script)",
    title: "ದೆಹಲಿ ಸಿಎಂ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ",
    text: `ನವದೆಹಲಿ: ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಗುರುವಾರ ಬಂಧಿಸಿದೆ.

ಅಧಿಕಾರಿಗಳ ಪ್ರಕಾರ, ದೀರ್ಘ ವಿಚಾರಣೆಯ ನಂತರ ಈ ಬಂಧನ ನಡೆದಿದೆ. ಎಎಪಿ ನಾಯಕರು ಈ ಕ್ರಮವನ್ನು ತೀವ್ರವಾಗಿ ಖಂಡಿಸಿದ್ದು, ಇದು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ "ಸರ್ವಾಧಿಕಾರಿ ದಾಳಿ" ಎಂದು ಕಿಡಿಕಾರಿದ್ದಾರೆ. ಪಕ್ಷದ ವಕ್ತಾರರು ಮಾತನಾಡಿ, "ಇದು ಸಂಪೂರ್ಣ ರಾಜಕೀಯ ಪ್ರೇರಿತ ಕ್ರಮ" ಎಂದು ಆರೋಪಿಸಿದರು.`
  },
  {
    label: "English: Neutral Space Research Mission (Scientific)",
    title: "ISRO Completes Orbit-Raising Maneuvers for Insat-3DS",
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
      setErrorMessage("Please enter article text.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestText(pastedText, pastedTitle || undefined);
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to ingest article text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage("Please enter an article URL.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestUrl(urlInput.trim());
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to ingest URL article.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a PDF document.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const article = await ingestPdf(selectedFile);
      onArticleIngested(article);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse PDF document.");
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Submit News Article for Analysis
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ingest a single news story via pasted text, HTTP/HTTPS URL, or PDF document to evaluate
          linguistic framing, sentiment, and cross-language coverage.
        </p>

        {/* Sample Loaders */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Samples:
          </span>
          {SAMPLE_ARTICLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 rounded-md transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab('text'); setErrorMessage(null); }}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'text'
              ? 'border-sky-600 text-sky-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Paste Text
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'url'
              ? 'border-sky-600 text-sky-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" /> Enter URL
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('pdf'); setErrorMessage(null); }}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'pdf'
              ? 'border-sky-600 text-sky-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload PDF
        </button>
      </div>

      <div className="p-6">
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Ingestion Notice</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Tab 1: Text */}
        {activeTab === 'text' && (
          <form onSubmit={handleSubmitText} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="e.g. Government Announces Major Healthcare Reform"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Article Body (English, Hindi, Kannada, Telugu, or Tamil)
              </label>
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full article text here. Native scripts and Unicode code points are strictly preserved..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-serif leading-relaxed transition"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !pastedText.trim()}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze Article
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleSubmitUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Article Web Address (HTTP/HTTPS)
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.thehindu.com/news/national/article12345.ece"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <span className="font-medium text-emerald-600">SSRF Protected:</span> Hostname DNS is checked to block private RFC1918, link-local, and loopback destinations.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Ingest &amp; Extract
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: PDF */}
        {activeTab === 'pdf' && (
          <form onSubmit={handleSubmitPdf} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl p-8 text-center transition-colors bg-slate-50/50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer block">
                <span className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                  Choose a PDF news document
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-1">
                PyMuPDF selectable text extractor (scanned image documents will explain that OCR is required).
              </p>
              {selectedFile && (
                <div className="mt-3 text-xs font-semibold text-slate-700 bg-white inline-block px-3 py-1 rounded-full border border-slate-200">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Ingest PDF
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

