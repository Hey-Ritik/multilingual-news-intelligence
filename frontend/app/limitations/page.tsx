import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Globe2,
  EyeOff
} from 'lucide-react';

export default function LimitationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4 sm:px-6">
      {/* Header & Back Link */}
      <div className="border-b border-lightGrey pb-6 space-y-4">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-burntOrange hover:underline uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Analysis Workspace
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-almostBlack flex items-center justify-center bg-pureWhite text-burntOrange">
            <ShieldAlert className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="editorial-eyebrow text-burntOrange">ETHICAL BOUNDARIES</span>
            <h1 className="font-editorial font-black text-2xl sm:text-3xl uppercase tracking-tight text-almostBlack mt-0.5">
              System Limitations, Caveats &amp; Ethical Boundaries
            </h1>
            <p className="text-xs text-editorialMuted mt-1">
              Transparent documentation of algorithmic constraints, ingestion boundaries, and methodological assumptions for academic review.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Caution Card */}
      <div className="bg-pureWhite border-l-4 border-l-burntOrange border border-lightGrey p-6 shadow-editorial-sm space-y-2">
        <div className="flex items-center gap-2 font-editorial font-bold text-almostBlack text-sm uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-burntOrange" />
          Linguistic Framing Is Not Journalistic Intent or Malice
        </div>
        <p className="text-xs text-almostBlack leading-relaxed">
          This system measures observable textual characteristics: word choices, grammatical prominence, quotation
          distribution, and headline emphasis. <strong>Linguistic framing does not establish conscious political bias, editorial conspiracy, or journalistic dishonesty.</strong> Headlines are often authored by copy editors rather than reporting journalists, and brevity constraints often compel omitting secondary details.
        </p>
      </div>

      {/* Detailed Limitations Grid */}
      <div className="space-y-6">
        {/* Limitation 1 */}
        <div className="bg-pureWhite border border-lightGrey shadow-editorial-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-almostBlack font-bold text-base border-b border-lightGrey pb-3">
            <div className="w-6 h-6 bg-warmOffWhite border border-lightGrey flex items-center justify-center text-burntOrange">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-editorial uppercase text-sm tracking-wide">
              1. Paywalls, Client-Side JavaScript &amp; Anti-Scraping Protection
            </h3>
          </div>
          <p className="text-xs text-editorialMuted leading-relaxed">
            Major Indian digital publications (e.g., The Hindu, Indian Express, Eenadu, Dinamalar, Prajavani) frequently employ hard paywalls, bot-management gates, or single-page architectures that do not render article bodies to standard crawlers.
          </p>
          <div className="bg-warmOffWhite border border-lightGrey p-4 text-xs text-almostBlack space-y-1">
            <span className="font-mono font-bold uppercase text-burntOrange text-[10px]">System Safeguard: </span>
            <p className="text-editorialMuted leading-relaxed">
              Rather than halting analysis or generating mock text, the system transparently shifts to <em>snippet-level evidence</em> (derived from verified RSS description tags or search snippets). Any comparative analysis performed on snippet-level evidence is clearly labeled with an explicit evidence provenance badge.
            </p>
          </div>
        </div>

        {/* Limitation 2 */}
        <div className="bg-pureWhite border border-lightGrey shadow-editorial-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-almostBlack font-bold text-base border-b border-lightGrey pb-3">
            <div className="w-6 h-6 bg-warmOffWhite border border-lightGrey flex items-center justify-center text-burntOrange">
              <Globe2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-editorial uppercase text-sm tracking-wide">
              2. Discovery Provider Latencies &amp; Regional Indexing Variances
            </h3>
          </div>
          <p className="text-xs text-editorialMuted leading-relaxed">
            The platform queries Google News RSS and GDELT across multiple Indian regional editions:
          </p>
          <ul className="list-disc list-inside text-xs text-editorialMuted space-y-1.5 pl-2">
            <li><strong>GDELT API:</strong> Excellent for global English tracking, but possesses variable coverage and delayed ingestion latencies (up to 15-30 minutes) for vernacular Indian regional scripts (Kannada, Telugu, Tamil).</li>
            <li><strong>Google News RSS:</strong> Real-time coverage across regional script editions, but RSS snippets contain truncated text (typically 80-150 words) and occasional Google redirect URL wrapping.</li>
            <li><strong>Rate Limiting &amp; Network Timeouts:</strong> When an upstream search provider times out or throttles requests, the pipeline reports an explicit <code className="bg-warmOffWhite px-1 py-0.5 border border-lightGrey font-mono text-[10px]">FAILED</code> or <code className="bg-warmOffWhite px-1 py-0.5 border border-lightGrey font-mono text-[10px]">DEGRADED</code> provider status rather than fabricating zero results.</li>
          </ul>
        </div>

        {/* Limitation 3 */}
        <div className="bg-pureWhite border border-lightGrey shadow-editorial-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-almostBlack font-bold text-base border-b border-lightGrey pb-3">
            <div className="w-6 h-6 bg-warmOffWhite border border-lightGrey flex items-center justify-center text-burntOrange">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-editorial uppercase text-sm tracking-wide">
              3. Indic Script Orthography &amp; Transliteration Asymmetries
            </h3>
          </div>
          <p className="text-xs text-editorialMuted leading-relaxed">
            While Latin scripts benefit from standardized capitalization for Named Entity Recognition, Brahmic scripts (Devanagari, Kannada, Telugu, Tamil) do not have capital letters. Entity detection relies heavily on contextual honorifics (e.g., श्री, ಮುಖ್ಯಮಂತ್ರಿ, ముఖ్యమంత్రి, முதலமைச்சர்), postpositions, and curated alias cross-walks.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-lightGrey pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <Link href="/workspace" className="text-burntOrange hover:underline font-bold inline-flex items-center gap-1.5 uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Analysis Workspace
        </Link>
        <Link href="/methodology" className="text-almostBlack hover:text-burntOrange font-bold uppercase tracking-wider">
          Read Analytical Methodology &rarr;
        </Link>
      </div>
    </div>
  );
}
