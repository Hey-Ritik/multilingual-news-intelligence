import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  AlertTriangle,
  Scale,
  Lock,
  Globe2,
  FileQuestion,
  HelpCircle,
  EyeOff
} from 'lucide-react';

export default function LimitationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header & Back Link */}
      <div className="border-b border-slate-200 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Intelligence Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              System Limitations, Caveats &amp; Ethical Boundaries
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transparent documentation of algorithmic constraints, ingestion boundaries, and methodological assumptions for academic review.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Caution Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-950 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Linguistic Framing Is Not Journalistic Intent or Malice
        </div>
        <p>
          This system measures observable textual characteristics: word choices, grammatical prominence, quotation
          distribution, and headline emphasis. <strong>Linguistic framing does not establish conscious political bias, editorial conspiracy, or journalistic dishonesty.</strong> Headlines are often authored by copy editors rather than reporting journalists, and brevity constraints often compel omitting secondary details.
        </p>
      </div>

      {/* Detailed Limitations Grid */}
      <div className="space-y-6">
        {/* Limitation 1: Inaccessible Article Text & Anti-Scraping Paywalls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
            <h3>1. Paywalls, Client-Side JavaScript &amp; Anti-Scraping Protection</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Major Indian digital publications (e.g., The Hindu, Indian Express, Eenadu, Dinamalar, Prajavani) frequently employ hard paywalls, Cloudflare bot-management gates, or single-page React/Angular architectures that do not render article bodies to standard HTTP GET crawlers.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
            <strong>System Safeguard:</strong> Rather than halting analysis or generating empty mock text, the system transparently shifts to <em>snippet-level evidence</em> (derived from verified RSS description tags or search snippets). Any comparative analysis performed on snippet-level evidence is clearly labeled with a warning badge indicating that full paragraph de-nesting was unavailable.
          </div>
        </div>

        {/* Limitation 2: Search Provider Latency & Indexing Variances */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3>2. Discovery Provider Latencies &amp; Regional Indexing Variances</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform queries Google News RSS and the GDELT Project API across multiple Indian regional editions:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-2">
            <li><strong>GDELT Project API:</strong> Excellent for global English tracking, but possesses variable coverage and delayed ingestion latencies (up to 15-30 minutes) for vernacular Indian regional scripts (Kannada, Telugu, Tamil).</li>
            <li><strong>Google News RSS:</strong> Real-time coverage across regional script editions, but RSS snippets contain truncated text (typically 80-150 words) and occasional Google redirect URL wrapping.</li>
            <li><strong>Rate Limiting &amp; Network Timeouts:</strong> When an upstream search provider times out or throttles requests, the pipeline reports an explicit <code className="bg-slate-100 px-1 py-0.5 rounded">FAILED</code> or <code className="bg-slate-100 px-1 py-0.5 rounded">DEGRADED</code> provider status rather than fabricating zero results.</li>
          </ul>
        </div>

        {/* Limitation 3: Indic Script Processing & Dialectal Variations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3>3. Indic Script Orthography &amp; Transliteration Asymmetries</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            While Latin scripts benefit from standardized capitalization for Named Entity Recognition, Brahmic scripts (Devanagari, Kannada, Telugu, Tamil) do not have capital letters. Entity detection relies heavily on contextual honorifics (e.g., श्री, ಮುಖ್ಯಮಂತ್ರಿ, ముఖ్యమంత్రి, முதலமைச்சர்), postpositions, and curated alias cross-walks.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Transliterated names can also have multiple valid spellings (e.g., &quot;Kejriwal&quot; vs &quot;Khejriwal&quot; or &quot;Arvind&quot; vs &quot;Aravind&quot;). Unrecognized spelling variants of minor actors may fall into lower confidence thresholds.
          </p>
        </div>

        {/* Limitation 4: Handling of Missing, Neutral, or Inconclusive Evidence */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <FileQuestion className="w-4 h-4" />
            </div>
            <h3>4. Strict Separation of Missing, Neutral, and Inconclusive Data</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A common failure mode in automated intelligence systems is converting missing data into &quot;neutral&quot; or &quot;unbiased&quot; scores. Our system maintains strict non-negotiable boundaries:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <strong className="text-slate-800 block mb-0.5">Neutral</strong>
              An article that presents balanced claims from multiple parties with low emotional valence.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <strong className="text-slate-800 block mb-0.5">Inconclusive</strong>
              An article whose text is too brief or ambiguous to reliably classify its event association.
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <strong className="text-slate-800 block mb-0.5">Missing / Failed</strong>
              An article whose web host refused connection or returned HTTP 403 Forbidden.
            </div>
          </div>
        </div>

        {/* Limitation 5: External Examination Scope & Academic Disclaimer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            <h3>5. Scope of External Examination Demonstration</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This project has been developed as an engineering prototype for academic evaluation at RV University, Bengaluru. It demonstrates the technical feasibility of deterministic cross-lingual event matching, verifiable attribution de-nesting, and explainable framing detection without relying on closed-source generative hallucination.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-xs">
        <Link href="/" className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <Link href="/methodology" className="text-slate-600 hover:text-slate-900 font-semibold">
          &larr; View Analytical Methodology
        </Link>
      </div>
    </div>
  );
}

