'use client';

import React, { useEffect, useRef } from 'react';
import { FileText, BarChart3, Network, Globe } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header and Section 03 Number reveal
      gsap.from('.cap-header-anim', {
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Hairline accent line expansion
      gsap.from('.cap-accent-line', {
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

      // Reveal columns on scroll
      gsap.from('.capability-col', {
        y: 35,
        opacity: 0,
        stagger: 0.1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Category badge subtle reveal
      gsap.from('.cap-badge-anim', {
        opacity: 0,
        x: -10,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const capabilities = [
    {
      icon: <FileText className="w-8 h-8 text-almostBlack stroke-[1.5]" />,
      title: 'MULTILINGUAL PROCESSING',
      description: 'Analyse news across multiple languages with a unified framework.',
      badge: '01 / INGESTION',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-almostBlack stroke-[1.5]" />,
      title: 'DEEP ANALYSIS',
      description: 'Understand sentiment, emotion, bias and toxicity in news content.',
      badge: '02 / EXTRACTION',
    },
    {
      icon: <Network className="w-8 h-8 text-almostBlack stroke-[1.5]" />,
      title: 'CROSS-LINGUISTIC COMPARISON',
      description: 'Compare perspectives across different languages and sources.',
      badge: '03 / ALIGNMENT',
    },
    {
      icon: <Globe className="w-8 h-8 text-almostBlack stroke-[1.5]" />,
      title: 'REAL-WORLD INSIGHTS',
      description: 'Gain a more nuanced understanding of global events and narratives.',
      badge: '04 / VERIFICATION',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-warmOffWhite border-b border-lightGrey py-16 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Swiss Left Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Number */}
          <div className="cap-header-anim hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-almostBlack">03</span>
            <span className="cap-accent-line w-6 h-px bg-lightGrey origin-left" />
          </div>

          {/* Eyebrow and Headline */}
          <div className="lg:col-span-10 flex flex-col gap-2">
            <span className="cap-header-anim editorial-eyebrow text-burntOrange">OUR CAPABILITIES</span>
            <h2 className="cap-header-anim font-editorial font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-almostBlack">
              Precision NLP Architecture Built For Multi-Perspective News Analysis
            </h2>
          </div>

          {/* Right Rail Annotation */}
          <div className="cap-header-anim hidden lg:flex lg:col-span-1 flex-col items-end pt-1">
            <div className="space-y-1 font-mono text-[9px] text-right text-editorialMuted tracking-widest uppercase leading-snug">
              <div>PEOPLE</div>
              <div>CULTURE</div>
              <div>LANGUAGE</div>
              <div>MEDIA</div>
              <div className="text-burntOrange font-bold">PERSPECTIVE</div>
            </div>
          </div>
        </div>

        {/* 4-Column Clean Swiss Grid with Hairline Dividers */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-lightGrey bg-pureWhite"
        >
          {capabilities.map((item, index) => (
            <div
              key={item.title}
              className={`capability-col relative p-8 flex flex-col justify-between group hover:bg-warmOffWhite/40 transition-colors duration-200 ${
                index < capabilities.length - 1 ? 'border-b md:border-b-0 md:border-r border-lightGrey' : ''
              }`}
            >
              {/* Corner crosshair for authentic Swiss style */}
              <span className="absolute top-2 right-2 font-mono text-[9px] text-editorialMuted/40 group-hover:text-burntOrange transition-colors select-none">
                +
              </span>

              {/* Icon & Category Tag */}
              <div>
                <div className="mb-6 p-3 w-fit border border-lightGrey bg-warmOffWhite group-hover:border-almostBlack group-hover:bg-pureWhite transition-colors">
                  {item.icon}
                </div>

                <div className="cap-badge-anim font-mono text-[10px] font-semibold text-burntOrange uppercase tracking-wider mb-2">
                  {item.badge}
                </div>

                <h3 className="font-editorial font-black text-lg sm:text-xl tracking-tight text-almostBlack uppercase leading-tight mb-3">
                  {item.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-editorialMuted leading-relaxed pt-4 border-t border-lightGrey/60 mt-4">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
