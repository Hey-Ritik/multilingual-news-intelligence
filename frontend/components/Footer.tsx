import React from 'react';
import Link from 'next/link';
import { Globe, ArrowUpRight } from 'lucide-react';
import { Divider } from './ui/Divider';

export default function Footer() {
  return (
    <footer className="w-full bg-warmOffWhite border-t border-lightGrey pt-12 pb-8 text-almostBlack mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
          {/* Brand & Manifesto Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 border border-almostBlack flex items-center justify-center bg-pureWhite text-almostBlack">
                  <Globe className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-editorial font-extrabold text-sm uppercase tracking-editorial-tight">
                  Multilingual News Intelligence
                </span>
              </div>
              <p className="text-xs sm:text-sm text-editorialMuted max-w-sm leading-relaxed">
                Explainable news framing analysis and cross-language event coverage verification across
                English, Hindi, Kannada, Telugu, and Tamil.
              </p>
            </div>

            <div className="pt-6 font-mono text-[11px] text-editorialMuted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FRAMEWORK STATUS: OPERATIONAL</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="editorial-eyebrow text-burntOrange">
              System Architecture
            </div>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider">
              <li>
                <Link
                  href="/workspace"
                  className="text-almostBlack hover:text-burntOrange transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Analysis Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-almostBlack hover:text-burntOrange transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Methodology</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/limitations"
                  className="text-almostBlack hover:text-burntOrange transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Limitations &amp; Ethics</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Language Coverage & Academic Attribution */}
          <div className="md:col-span-4 space-y-3">
            <div className="editorial-eyebrow text-burntOrange">
              Multilingual Pipeline
            </div>
            <div className="p-3.5 border border-lightGrey bg-pureWhite space-y-2 text-xs">
              <div className="flex justify-between font-mono text-[11px] text-editorialMuted">
                <span>INDIC LANGUAGES</span>
                <span className="font-bold text-almostBlack">5 ACTIVE</span>
              </div>
              <div className="font-mono text-xs font-semibold text-almostBlack tracking-wider">
                English • हिन्दी • ಕನ್ನಡ • తెలుగు • தமிழ்
              </div>
              <div className="pt-2 border-t border-lightGrey/60 text-[11px] text-editorialMuted">
                Developed by <span className="font-semibold text-almostBlack">Ritik Singh</span>
                <br />
                RV University, Bengaluru
              </div>
            </div>
          </div>
        </div>

        {/* Hairline Divider with Swiss Crossmarks */}
        <Divider orientation="horizontal" theme="light" crossmark crossmarkPosition="start" />

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-editorialMuted">
          <div>
            © 2026 Multilingual News Intelligence System. All rights reserved.
          </div>
          <div className="flex items-center gap-4 uppercase tracking-wider">
            <span>Swiss Typographic Grid</span>
            <span>•</span>
            <span>Editorial Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
