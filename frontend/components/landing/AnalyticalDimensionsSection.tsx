'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Smile, Sparkles, Scale, ShieldAlert, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AnalyticalDimensionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Dimension cards staggered reveal
      gsap.from('.dim-card', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Topographic visual subtle scale and parallax
      gsap.to('.topo-visual', {
        scale: 1.08,
        rotate: 4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const dimensions = [
    {
      num: '01',
      title: 'SENTIMENT',
      icon: <Smile className="w-6 h-6 stroke-[1.5]" />,
      desc: 'Understand the overall tone and stance of news content across languages.',
    },
    {
      num: '02',
      title: 'EMOTION',
      icon: <Sparkles className="w-6 h-6 stroke-[1.5]" />,
      desc: 'Detect nuanced emotions across different languages and cultural idioms.',
    },
    {
      num: '03',
      title: 'BIAS',
      icon: <Scale className="w-6 h-6 stroke-[1.5]" />,
      desc: 'Identify potential bias, actor agency, and framing differences in coverage.',
    },
    {
      num: '04',
      title: 'TOXICITY',
      icon: <ShieldAlert className="w-6 h-6 stroke-[1.5]" />,
      desc: 'Detect harmful, sensationalized, and toxic content automatically.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-almostBlack text-pureWhite border-b border-editorialDark-border py-20 lg:py-28 overflow-hidden"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 border-x border-editorialDark-border grid grid-cols-12">
          <div className="col-span-1 border-r border-editorialDark-border h-full hidden lg:block" />
          <div className="col-span-10 h-full" />
          <div className="col-span-1 border-l border-editorialDark-border h-full hidden lg:block" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header with Left Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-burntOrange">04</span>
            <span className="w-6 h-px bg-editorialDark-border" />
          </div>

          <div className="lg:col-span-8 flex flex-col gap-2">
            <span className="editorial-eyebrow text-burntOrange">ANALYTICAL DIMENSIONS</span>
            <h2 className="font-editorial font-black text-3xl sm:text-5xl uppercase tracking-tight text-pureWhite">
              Four Core Axes of Linguistic Evaluation
            </h2>
          </div>
        </div>

        {/* 4 Dimension Columns + Right Topography Art Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 9 Columns: 4 Dimension Cards */}
          <div
            ref={cardsRef}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {dimensions.map((dim) => (
              <div
                key={dim.title}
                className="dim-card relative p-6 bg-editorialDark-surface border border-editorialDark-border flex flex-col justify-between group hover:border-burntOrange transition-all duration-200"
              >
                {/* Header: Giant Burnt Orange Numeral & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-editorial font-black text-4xl text-burntOrange leading-none select-none">
                      {dim.num}
                    </span>
                    <div className="p-2 border border-editorialDark-border text-editorialDark-muted group-hover:text-burntOrange group-hover:border-burntOrange transition-colors">
                      {dim.icon}
                    </div>
                  </div>

                  <h3 className="font-editorial font-black text-lg uppercase tracking-tight text-pureWhite mb-2">
                    {dim.title}
                  </h3>

                  <p className="text-xs text-editorialDark-muted leading-relaxed">
                    {dim.desc}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 mt-6 border-t border-editorialDark-border/60 flex justify-end">
                  <Link
                    href="/workspace"
                    className="w-8 h-8 rounded-full border border-editorialDark-border flex items-center justify-center text-editorialDark-muted group-hover:border-burntOrange group-hover:bg-burntOrange group-hover:text-pureWhite transition-all"
                    aria-label={`Explore ${dim.title}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Right 4 Columns: Textured Topography Visual & Stacked Metadata */}
          <div
            ref={visualRef}
            className="lg:col-span-4 relative flex flex-col items-center lg:items-end justify-center"
          >
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-editorialDark-border overflow-hidden bg-editorialDark-surface shadow-editorial-md flex items-center justify-center">
              {/* Moon / Crater / Earth Surface Halftone Simulation */}
              <div
                className="topo-visual absolute inset-0 opacity-40 mix-blend-screen"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.7), transparent 70%), radial-gradient(circle at 70% 60%, rgba(232,93,38,0.5), transparent 60%)',
                }}
              />

              {/* Orbital curved ray in Burnt Orange */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <circle
                  cx="144"
                  cy="144"
                  r="110"
                  fill="none"
                  stroke="#E85D26"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  opacity="0.8"
                />
                <circle cx="210" cy="65" r="4" fill="#E85D26" />
              </svg>

              {/* Stacked Minimal Text */}
              <div className="relative z-10 text-center font-mono text-xs tracking-widest uppercase font-bold text-pureWhite max-w-[150px] leading-relaxed">
                <div>DEEPER</div>
                <div className="text-burntOrange">ANALYSIS.</div>
                <div>CLEARER</div>
                <div>PERSPECTIVES.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
