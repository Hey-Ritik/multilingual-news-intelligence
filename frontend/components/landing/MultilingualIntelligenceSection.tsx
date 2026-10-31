'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function MultilingualIntelligenceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const triptychRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Staggered scripts reveal
      gsap.from('.script-line', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: typographyRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Triptych image parallax
      gsap.to('.triptych-item', {
        y: -20,
        stagger: 0.1,
        scrollTrigger: {
          trigger: triptychRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-warmOffWhite border-b border-lightGrey py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Number Rail */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-almostBlack">05</span>
            <span className="w-6 h-px bg-lightGrey" />
          </div>

          {/* Left Column: Heading, Subtitle & Action */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <span className="editorial-eyebrow text-burntOrange">MULTILINGUAL INTELLIGENCE</span>

              <div className="space-y-1">
                <h2 className="font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-almostBlack">
                  MANY
                </h2>
                <h2 className="font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-almostBlack">
                  LANGUAGES.
                </h2>
                <h2 className="font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-burntOrange">
                  ONE BIGGER
                </h2>
                <h2 className="font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-burntOrange">
                  PICTURE.
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-editorialMuted max-w-sm leading-relaxed pt-2">
                Breaking language barriers to reveal a more complete understanding of global events.
                Native scripts analyzed with semantic consistency and cultural nuance.
              </p>
            </div>

            <div className="pt-8">
              <Button
                href="/methodology"
                variant="outline"
                size="sm"
                showArrow
                className="border-almostBlack text-almostBlack hover:bg-almostBlack hover:text-pureWhite"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Center Column: Signature Multi-Script Typography Composition */}
          <div
            ref={typographyRef}
            className="lg:col-span-4 flex flex-col justify-center items-start py-6 lg:py-0 px-2"
          >
            <div className="space-y-2 select-none">
              <div className="script-line font-editorial font-black text-6xl sm:text-7xl lg:text-8xl tracking-editorial-tighter text-almostBlack leading-none">
                English
              </div>
              <div className="script-line flex items-baseline gap-4">
                <span className="font-serif font-black text-6xl sm:text-7xl lg:text-8xl text-burntOrange leading-none">
                  हिन्दी
                </span>
                <span className="font-sans font-bold text-5xl sm:text-6xl lg:text-7xl text-almostBlack leading-none">
                  বাংলা
                </span>
              </div>
              <div className="script-line flex items-baseline gap-4 pt-1">
                <span className="font-sans font-black text-6xl sm:text-7xl lg:text-8xl text-almostBlack leading-none">
                  தமிழ்
                </span>
                <span className="font-editorial italic text-base sm:text-xl text-editorialMuted font-medium">
                  and more...
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Triptych of Editorial Photos & Metadata */}
          <div
            ref={triptychRef}
            className="lg:col-span-3 flex flex-col items-center lg:items-end justify-between h-full pt-4"
          >
            {/* Triptych Photo Strips */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
              {/* Photo 1: Urban Walkers with Orange Accent */}
              <div className="triptych-item h-40 bg-almostBlack overflow-hidden border border-lightGrey relative">
                <div className="w-full h-full bg-gradient-to-b from-burntOrange/80 to-almostBlack flex items-end p-1.5">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold">COMMUNITY</span>
                </div>
              </div>

              {/* Photo 2: Civic Classical Building */}
              <div className="triptych-item h-44 -mt-2 bg-almostBlack overflow-hidden border border-lightGrey relative">
                <div className="w-full h-full bg-gradient-to-b from-editorialMuted to-almostBlack flex items-end p-1.5">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold">INSTITUTION</span>
                </div>
              </div>

              {/* Photo 3: Archway / Perspective */}
              <div className="triptych-item h-40 bg-almostBlack overflow-hidden border border-lightGrey relative">
                <div className="w-full h-full bg-gradient-to-b from-stone-600 to-almostBlack flex items-end p-1.5">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold">HERITAGE</span>
                </div>
              </div>
            </div>

            {/* Bottom Stacked Annotation & Globe Mark */}
            <div className="mt-8 flex items-center justify-between w-full max-w-[280px] pt-4 border-t border-lightGrey">
              <div className="font-mono text-[9px] text-editorialMuted tracking-widest uppercase leading-tight">
                <div>LOCAL VOICES.</div>
                <div className="text-almostBlack font-bold">GLOBAL INSIGHTS.</div>
              </div>
              <div className="p-1.5 border border-lightGrey bg-pureWhite text-almostBlack">
                <Globe className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
