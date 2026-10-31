'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function GlobalPerspectiveSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Heading reveal on scroll
      gsap.from('.perspective-heading', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // Cards staggered reveal with slight tilt and translation
      gsap.from('.perspective-card', {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Subtle parallax between cards while scrolling
      gsap.to('.perspective-card-even', {
        y: -24,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to('.perspective-card-odd', {
        y: 20,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.6,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const newsCards = [
    {
      id: 'en',
      outlet: 'The Guardian',
      lang: 'EN',
      title: 'Climate talks resume as nations push for greener policies',
      category: 'GLOBAL ENVIRONMENT',
      location: 'Geneva / London',
      imageAlt: 'Mountain landscape',
      gradient: 'from-zinc-900 via-zinc-800 to-zinc-700',
    },
    {
      id: 'hi',
      outlet: 'दैनिक भास्कर',
      lang: 'हिंदी',
      title: 'जलवायु समझौते पर देशों के बीच फिर से चर्चा शुरू',
      category: 'पर्यावरण एवं नीति',
      location: 'नई दिल्ली',
      imageAlt: 'Monument archway',
      gradient: 'from-stone-900 via-stone-800 to-zinc-700',
    },
    {
      id: 'bn',
      outlet: 'প্রথম আলো',
      lang: 'বাংলা',
      title: 'জলবায়ু বৈঠকে নতুন করে আলোচনা ও ঐকমত্যের আহ্বান',
      category: 'আন্তর্জাতিক সংবাদ',
      location: 'কলকাতা / ঢাকা',
      imageAlt: 'Bridge infrastructure',
      gradient: 'from-neutral-900 via-neutral-800 to-zinc-700',
    },
    {
      id: 'ta',
      outlet: 'தினமலர்',
      lang: 'தமிழ்',
      title: 'காலநிலை ஒப்பந்தம் குறித்த நாடுகளிடையே மறுபேச்சுவார்த்தை',
      category: 'சுற்றுச்சூழல்',
      location: 'சென்னை',
      imageAlt: 'Coastal heritage temple',
      gradient: 'from-zinc-950 via-zinc-900 to-zinc-800',
    },
  ];

  return (
    <section
      id="section-global-perspective"
      ref={sectionRef}
      className="relative w-full bg-almostBlack text-pureWhite border-b border-editorialDark-border py-20 lg:py-28 overflow-hidden"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 border-x border-editorialDark-border grid grid-cols-12">
          <div className="col-span-1 border-r border-editorialDark-border h-full hidden lg:block" />
          <div className="col-span-10 h-full" />
          <div className="col-span-1 border-l border-editorialDark-border h-full hidden lg:block" />
        </div>
      </div>

      {/* SVG Connecting Network Web (Orange Dashed Lines & Glowing Dots) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E85D26" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E85D26" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Curved Arcs between global hubs */}
          <path
            d="M 200,320 Q 500,120 750,260 T 1200,200"
            fill="none"
            stroke="#E85D26"
            strokeWidth="1.25"
            strokeDasharray="4 6"
            opacity="0.6"
          />
          <path
            d="M 300,450 Q 650,280 980,380 T 1350,300"
            fill="none"
            stroke="#F4A261"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.4"
          />

          {/* Network Coordinate Nodes */}
          <circle cx="200" cy="320" r="4" fill="#E85D26" />
          <circle cx="500" cy="180" r="4" fill="#E85D26" />
          <circle cx="750" cy="260" r="5" fill="#E85D26" />
          <circle cx="980" cy="380" r="4" fill="#E85D26" />
          <circle cx="1200" cy="200" r="4" fill="#E85D26" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header Row with Swiss Gutter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Number Rail */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-2">
            <span className="font-mono text-sm font-bold text-burntOrange">02</span>
            <span className="w-6 h-px bg-editorialDark-border" />
          </div>

          {/* Main Title & Action */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="editorial-eyebrow text-burntOrange">GLOBAL PERSPECTIVE</span>
              <span className="w-8 h-px bg-burntOrange/50" />
            </div>

            <div ref={headlineRef} className="space-y-1">
              <h2 className="perspective-heading font-editorial font-black text-4xl sm:text-6xl lg:text-7xl tracking-editorial-tighter leading-[0.9] uppercase text-pureWhite">
                ONE WORLD.
              </h2>
              <h2 className="perspective-heading font-editorial font-black text-4xl sm:text-6xl lg:text-7xl tracking-editorial-tighter leading-[0.9] uppercase text-burntOrange">
                MULTIPLE NARRATIVES.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-editorialDark-muted max-w-xl font-normal leading-relaxed mt-2">
              The same events, different languages, different perspectives. A more complete truth
              unlocked through deterministic natural language understanding.
            </p>

            <div className="pt-2">
              <Button
                href="/workspace"
                variant="outline"
                size="sm"
                showArrow
                className="border-pureWhite/30 text-pureWhite hover:bg-pureWhite hover:text-almostBlack"
              >
                Explore News
              </Button>
            </div>
          </div>

          {/* Right Rail Annotation */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-start items-end pt-2">
            <div className="space-y-1 font-mono text-[9px] text-right text-editorialDark-muted tracking-widest uppercase leading-snug">
              <div>SAME</div>
              <div>EVENT</div>
              <div>DIFFERENT</div>
              <div>LANGUAGES</div>
              <div>RICHER</div>
              <div className="text-burntOrange font-bold">INSIGHTS</div>
            </div>
          </div>
        </div>

        {/* 4 Multilingual Editorial News Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {newsCards.map((card, idx) => (
            <article
              key={card.id}
              className={`perspective-card ${
                idx % 2 === 0 ? 'perspective-card-even' : 'perspective-card-odd'
              } flex flex-col justify-between bg-pureWhite text-almostBlack p-5 border border-lightGrey shadow-editorial-md transition-transform duration-300 hover:-translate-y-1.5`}
            >
              {/* Card Header: Outlet & Language Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-lightGrey/70">
                <span className="font-editorial font-extrabold text-sm text-almostBlack tracking-tight">
                  {card.outlet}
                </span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-almostBlack/20 bg-warmOffWhite text-almostBlack">
                  {card.lang}
                </span>
              </div>

              {/* Card Headline */}
              <div className="py-4 flex-1">
                <div className="font-mono text-[9px] font-bold text-burntOrange uppercase tracking-wider mb-2">
                  {card.category}
                </div>
                <h3 className="font-editorial font-bold text-sm sm:text-base leading-snug tracking-tight text-almostBlack line-clamp-3">
                  {card.title}
                </h3>
              </div>

              {/* Monochromatic Editorial Photo Representation */}
              <div className="mt-2 w-full h-32 bg-almostBlack overflow-hidden relative border border-lightGrey">
                <div
                  className={`w-full h-full bg-gradient-to-br ${card.gradient} opacity-90 flex flex-col justify-between p-2.5`}
                >
                  <div className="flex justify-between items-start font-mono text-[8px] text-pureWhite/70 uppercase">
                    <span>{card.location}</span>
                    <span className="text-burntOrange font-bold">LIVE WIRE</span>
                  </div>

                  <div className="font-mono text-[9px] text-pureWhite/90 flex items-center justify-between">
                    <span className="truncate max-w-[140px]">{card.imageAlt}</span>
                    <span className="text-[10px] text-burntOrange font-bold">↗</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
