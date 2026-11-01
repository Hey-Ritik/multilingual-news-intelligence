'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Globe,
  LayoutDashboard,
  Rss,
  FileSearch,
  Bookmark,
  TrendingUp,
  Settings,
  Search,
  ArrowRight,
  Smile,
  Activity,
  Shield,
  Frown,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PlatformPreviewSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [quickInput, setQuickInput] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header and Section 06 reveal
      gsap.from('.platform-header-anim', {
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Orange hairline accent expansion
      gsap.from('.platform-accent-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Peeking Alpine Landscape Editorial Photo Tile gentle reveal
      gsap.from('.platform-peeking-img', {
        x: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: mockupRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Subtle parallax on the peeking photo tile during scroll
      gsap.to('.platform-peeking-img', {
        y: -30,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Platform mockup elevation and scale-up on scroll
      gsap.from(mockupRef.current, {
        y: 45,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: mockupRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Staggered reveal for internal mockup cards
      gsap.from('.mockup-dim-card', {
        y: 15,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: mockupRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleLaunch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push('/workspace');
  };

  return (
    <section
      id="section-platform-preview"
      ref={sectionRef}
      className="relative w-full bg-almostBlack text-pureWhite border-b border-editorialDark-border py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          {/* Left Number Rail */}
          <div className="platform-header-anim hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-burntOrange">06</span>
            <span className="platform-accent-line w-6 h-px bg-editorialDark-border origin-left" />
          </div>

          {/* Left Column: Headline and Call-to-Action */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="platform-header-anim editorial-eyebrow text-burntOrange">THE PLATFORM</span>

            <h2 className="platform-header-anim font-editorial font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-editorial-tighter leading-tight text-pureWhite">
              From global news to meaningful insights.
            </h2>

            <p className="platform-header-anim text-sm sm:text-base text-editorialDark-muted max-w-xl font-normal leading-relaxed">
              A powerful platform to explore, analyse and compare news across languages using
              advanced NLP. Deterministic semantic extraction without fabricated summaries.
            </p>

            <div className="platform-header-anim pt-2 flex items-center gap-4">
              <Button
                href="/workspace"
                variant="primary"
                pill
                size="md"
                showArrow
                className="px-6 py-3 uppercase tracking-wider text-xs"
              >
                Launch App
              </Button>
              <span className="text-xs font-mono text-editorialDark-muted">
                No registration required • Local privacy first
              </span>
            </div>
          </div>

          {/* Right Rail Annotation */}
          <div className="platform-header-anim hidden lg:flex lg:col-span-3 flex-col justify-start items-end pt-1">
            <div className="space-y-1 font-mono text-[9px] text-right text-editorialDark-muted tracking-widest uppercase leading-snug">
              <div>INTELLIGENCE</div>
              <div>BEYOND</div>
              <div className="text-burntOrange font-bold">LANGUAGES</div>
            </div>
          </div>
        </div>

        {/* Layered Editorial Composition: Dashboard Mockup + Peeking Photographic Landscape Tile */}
        <div className="relative w-full">
          {/* Peeking Alpine Landscape Editorial Photo Tile (Behind/Right) */}
          <div className="platform-peeking-img absolute -top-8 -right-4 lg:-right-8 w-64 lg:w-80 h-72 lg:h-96 border border-editorialDark-border shadow-2xl overflow-hidden z-0 hidden sm:block pointer-events-none">
            <Image
              src="/images/platform-landscape.jpg"
              alt="Dramatic alpine mountain ridge with warm dusk lighting"
              fill
              sizes="(max-width: 1024px) 256px, 320px"
              className="object-cover grayscale contrast-125 brightness-90"
            />
            {/* Warm dusk horizon glow gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-burntOrange/30 via-transparent to-almostBlack/60 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-almostBlack/40 to-almostBlack" />

            {/* Minimalist Swiss Coordinates & Label */}
            <div className="absolute top-4 right-4 bg-almostBlack/85 px-2 py-0.5 border border-pureWhite/20 backdrop-blur-xs font-mono text-[8px] text-pureWhite uppercase tracking-widest">
              ALPS 46.5° N
            </div>
          </div>

          {/* Realistic Application Interface Mockup (Honest Empty State) */}
          <div
            ref={mockupRef}
            className="relative z-10 w-full bg-editorialDark-surface border border-editorialDark-border shadow-2xl overflow-hidden rounded-xs"
          >
          {/* Window Chrome Title Bar */}
          <div className="px-4 py-3 bg-almostBlack border-b border-editorialDark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 font-mono text-[11px] text-editorialDark-muted">
                multilingual-news-intelligence // workspace v1.0
              </span>
            </div>

            <div className="font-mono text-[10px] text-burntOrange border border-burntOrange/40 px-2 py-0.5">
              5 LANGUAGES ACTIVE
            </div>
          </div>

          {/* Mockup Body: Left Sidebar + Right Main Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            {/* Sidebar */}
            <div className="hidden md:flex md:col-span-3 lg:col-span-3 bg-almostBlack-pure border-r border-editorialDark-border p-4 flex-col justify-between">
              <div className="space-y-6">
                {/* Brand in Mockup */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-editorialDark-border">
                  <div className="w-6 h-6 border border-burntOrange flex items-center justify-center text-burntOrange">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-editorial font-bold text-xs uppercase tracking-tight text-pureWhite">
                    MNI ENGINE
                  </span>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-burntOrange text-pureWhite font-semibold">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-editorialDark-muted hover:text-pureWhite transition-colors">
                    <Rss className="w-4 h-4" />
                    <span>News Feed</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-editorialDark-muted hover:text-pureWhite transition-colors">
                    <FileSearch className="w-4 h-4" />
                    <span>Analyse Article</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-editorialDark-muted hover:text-pureWhite transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span>Saved Analyses</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-editorialDark-muted hover:text-pureWhite transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    <span>Insights</span>
                  </div>
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="pt-4 border-t border-editorialDark-border font-mono text-[10px] text-editorialDark-muted flex items-center justify-between">
                <span>SYSTEM V1.0</span>
                <span className="text-emerald-500 font-bold">ONLINE</span>
              </div>
            </div>

            {/* Main Mockup Canvas (Honest Empty State) */}
            <div className="col-span-1 md:col-span-9 lg:col-span-9 bg-warmOffWhite text-almostBlack p-6 sm:p-8 flex flex-col justify-between">
              {/* Top Search Input Bar */}
              <form onSubmit={handleLaunch} className="flex gap-2 w-full mb-8">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-editorialMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Paste a news article URL or enter text here..."
                    className="w-full bg-pureWhite border border-lightGrey pl-10 pr-4 py-2.5 text-xs text-almostBlack placeholder-editorialMuted focus:border-burntOrange focus:ring-1 focus:ring-burntOrange outline-none font-sans transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-burntOrange hover:bg-burntOrange-hover text-pureWhite px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Central Honest Empty State Banner */}
              <div className="border border-dashed border-lightGrey bg-pureWhite/70 p-8 text-center my-auto flex flex-col items-center max-w-lg mx-auto">
                <div className="w-12 h-12 border border-lightGrey bg-warmOffWhite flex items-center justify-center text-burntOrange mb-3">
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="font-editorial font-bold text-base uppercase text-almostBlack tracking-tight mb-1">
                  Analyse a news article to get started
                </h4>
                <p className="text-xs text-editorialMuted leading-relaxed max-w-sm">
                  Paste a news article URL or enter text to see sentiment, emotion, bias and toxicity
                  analysis across multiple languages.
                </p>
                <div className="mt-4">
                  <Button href="/workspace" variant="primary" size="xs" showArrow>
                    Open Full Workspace
                  </Button>
                </div>
              </div>

              {/* 4 Empty State Dimension Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-lightGrey">
                <div className="mockup-dim-card p-3 bg-pureWhite border border-lightGrey text-center space-y-1">
                  <div className="font-mono text-[10px] font-bold text-almostBlack uppercase">
                    Sentiment
                  </div>
                  <Smile className="w-4 h-4 text-editorialMuted mx-auto my-1" />
                  <div className="font-mono text-[9px] text-editorialMuted">
                    Awaiting input
                  </div>
                </div>

                <div className="mockup-dim-card p-3 bg-pureWhite border border-lightGrey text-center space-y-1">
                  <div className="font-mono text-[10px] font-bold text-almostBlack uppercase">
                    Emotion
                  </div>
                  <Activity className="w-4 h-4 text-editorialMuted mx-auto my-1" />
                  <div className="font-mono text-[9px] text-editorialMuted">
                    Awaiting input
                  </div>
                </div>

                <div className="mockup-dim-card p-3 bg-pureWhite border border-lightGrey text-center space-y-1">
                  <div className="font-mono text-[10px] font-bold text-almostBlack uppercase">
                    Bias &amp; Agency
                  </div>
                  <Shield className="w-4 h-4 text-editorialMuted mx-auto my-1" />
                  <div className="font-mono text-[9px] text-editorialMuted">
                    Awaiting input
                  </div>
                </div>

                <div className="mockup-dim-card p-3 bg-pureWhite border border-lightGrey text-center space-y-1">
                  <div className="font-mono text-[10px] font-bold text-almostBlack uppercase">
                    Toxicity
                  </div>
                  <Frown className="w-4 h-4 text-editorialMuted mx-auto my-1" />
                  <div className="font-mono text-[9px] text-editorialMuted">
                    Awaiting input
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
