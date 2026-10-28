import React from 'react';
import Link from 'next/link';
import { Globe, BookOpen, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-sky-600 rounded-lg text-white group-hover:bg-sky-700 transition">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-sky-600 transition">
                Multilingual News Intelligence
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Explainable Framing, Bias Detection &amp; Cross-Language Verification
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              EN • HI • KN • TE • TA
            </span>
            <Link href="/methodology" className="hover:text-sky-600 transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Methodology
            </Link>
            <Link href="/limitations" className="hover:text-sky-600 transition-colors flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Limitations
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

