'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, Menu, RotateCcw, FileText, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { IngestedArticle } from '../../types';

interface DashboardTopBarProps {
  activeTabTitle: string;
  onOpenMobileMenu: () => void;
  onQuickIngest: (textOrUrl: string) => void;
  isIngesting?: boolean;
  activeArticle: IngestedArticle | null;
  onResetArticle?: () => void;
  onExportPdf?: () => void;
  hasReport?: boolean;
}

export default function DashboardTopBar({
  activeTabTitle,
  onOpenMobileMenu,
  onQuickIngest,
  isIngesting = false,
  activeArticle,
  onResetArticle,
  onExportPdf,
  hasReport = false,
}: DashboardTopBarProps) {
  const [queryInput, setQueryInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    onQuickIngest(queryInput);
    setQueryInput('');
  };

  return (
    <div className="w-full bg-pureWhite border-b border-lightGrey px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30 shadow-xs">
      {/* Left: Mobile menu button & Active Section Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 border border-lightGrey bg-warmOffWhite text-almostBlack hover:border-almostBlack transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-editorialMuted hidden sm:inline">
            WORKSPACE //
          </span>
          <h1 className="font-editorial font-black text-sm uppercase tracking-tight text-almostBlack">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Center: Quick Ingest Search Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-2 min-w-[220px]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-editorialMuted absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={isIngesting}
            placeholder="Paste article URL or raw text..."
            className="w-full bg-warmOffWhite border border-lightGrey pl-8 pr-9 py-1.5 text-xs text-almostBlack placeholder-editorialMuted focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none font-sans transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isIngesting || !queryInput.trim()}
            className="absolute right-1 top-1 bottom-1 px-2 bg-almostBlack hover:bg-burntOrange text-pureWhite text-[10px] flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="Submit article for analysis"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Right: Active Article status, Reset, and Report Actions */}
      <div className="flex items-center gap-2.5">
        {activeArticle ? (
          <div className="flex items-center gap-2 bg-warmOffWhite border border-lightGrey px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-almostBlack font-bold truncate max-w-[140px] sm:max-w-[200px]">
              {activeArticle.metadata.title || 'Active Article'}
            </span>
            {onResetArticle && (
              <button
                onClick={onResetArticle}
                className="ml-1 text-editorialMuted hover:text-burntOrange transition-colors p-0.5"
                title="Clear current article"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="font-mono text-[10px] text-editorialMuted border border-lightGrey bg-warmOffWhite px-2.5 py-1 hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>NO ARTICLE LOADED</span>
          </div>
        )}

        {hasReport && onExportPdf && (
          <Button
            onClick={onExportPdf}
            variant="primary"
            size="xs"
            icon={<Download className="w-3 h-3" />}
            iconPosition="left"
            className="uppercase tracking-wider font-mono text-[10px]"
          >
            PDF Report
          </Button>
        )}
      </div>
    </div>
  );
}
