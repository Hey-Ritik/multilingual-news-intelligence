'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  LayoutDashboard,
  Rss,
  FileText,
  Smile,
  ShieldAlert,
  BarChart3,
  Globe2,
  Settings,
  ArrowLeft,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

export type WorkspaceTab =
  | 'dashboard'
  | 'news-feed'
  | 'article-analysis'
  | 'sentiment-emotion'
  | 'bias-toxicity'
  | 'trends-analytics'
  | 'language-insights'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  hasArticle: boolean;
  framingCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({
  activeTab,
  onSelectTab,
  hasArticle,
  framingCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as WorkspaceTab,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: hasArticle ? 'Active' : undefined,
    },
    {
      id: 'news-feed' as WorkspaceTab,
      label: 'News Feed',
      icon: <Rss className="w-4 h-4 shrink-0" />,
      badge: 'Feed',
    },
    {
      id: 'article-analysis' as WorkspaceTab,
      label: 'Article Analysis',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      badge: hasArticle ? 'Ready' : undefined,
    },
    {
      id: 'sentiment-emotion' as WorkspaceTab,
      label: 'Sentiment & Emotion',
      icon: <Smile className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'bias-toxicity' as WorkspaceTab,
      label: 'Bias & Toxicity',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      badge: framingCount > 0 ? String(framingCount) : undefined,
      badgeColor: 'bg-burntOrange text-pureWhite',
    },
    {
      id: 'trends-analytics' as WorkspaceTab,
      label: 'Trends & Analytics',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'language-insights' as WorkspaceTab,
      label: 'Language Insights',
      icon: <Globe2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'settings' as WorkspaceTab,
      label: 'Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-almostBlack text-pureWhite p-4 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-editorialDark-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 border border-burntOrange flex items-center justify-center bg-almostBlack-pure text-burntOrange group-hover:bg-burntOrange group-hover:text-pureWhite transition-colors">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial font-extrabold text-xs uppercase tracking-tight text-pureWhite group-hover:text-burntOrange transition-colors">
                MULTILINGUAL
              </span>
              <span className="font-editorial font-bold text-[10px] tracking-widest uppercase text-editorialDark-muted">
                INTELLIGENCE
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-editorialDark-muted hover:text-pureWhite"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items (Swiss Editorial List) */}
        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider uppercase transition-all duration-150 text-left border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burntOrange',
                  isActive
                    ? 'bg-burntOrange text-pureWhite font-bold border-burntOrange shadow-editorial-sm'
                    : 'bg-transparent text-editorialDark-muted hover:text-pureWhite hover:bg-editorialDark-surface border-transparent'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={clsx(isActive ? 'text-pureWhite' : 'text-editorialDark-muted')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      'font-mono text-[9px] px-1.5 py-0.5 font-bold leading-none',
                      item.badgeColor ||
                        (isActive
                          ? 'bg-almostBlack text-pureWhite'
                          : 'bg-editorialDark-border text-editorialDark-muted')
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="pt-6 border-t border-editorialDark-border space-y-4">
        {/* Model Status Pill */}
        <div className="p-2.5 bg-editorialDark-surface border border-editorialDark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-editorialDark-muted uppercase font-bold">
              NLP Engine
            </span>
          </div>
          <span className="font-mono text-[9px] font-bold text-burntOrange">
            ONLINE
          </span>
        </div>

        {/* Supported Indic Languages */}
        <div className="font-mono text-[9px] text-editorialDark-muted flex items-center justify-between px-1">
          <span>LANGUAGES</span>
          <span className="font-semibold text-pureWhite">EN • HI • KN • TE • TA</span>
        </div>

        {/* Return to Landing Page */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-editorialDark-muted hover:text-burntOrange transition-colors pt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Landing Overview</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-editorialDark-border sticky top-20 h-[calc(100vh-5rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-almostBlack/80 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs h-full bg-almostBlack">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
