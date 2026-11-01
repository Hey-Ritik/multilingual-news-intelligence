'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      // Header and Section 05 reveal
      gsap.from('.multi-header-anim', {
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

      // Hairline accent line expansion
      gsap.from('.multi-accent-line', {
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

      // Staggered multilingual scripts reveal
      gsap.from('.script-line', {
        y: 40,
        opacity: 0,
        stagger: 0.14,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: typographyRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Triptych image collage staggered slide-in reveal
      gsap.from('.triptych-item', {
        y: 45,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: triptychRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Editorial image unmask / scale reveal
      gsap.from('.triptych-img', {
        scale: 1.18,
        duration: 1.3,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: triptychRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Triptych image scroll-driven parallax
      gsap.to('.triptych-item', {
        y: -18,
        stagger: 0.08,
        scrollTrigger: {
          trigger: triptychRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Bottom metadata reveal
      gsap.from('.multi-meta-anim', {
        y: 15,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: triptychRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
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
          <div className="multi-header-anim hidden lg:flex lg:col-span-1 flex-col items-start gap-2 pt-1">
            <span className="font-mono text-sm font-bold text-almostBlack">05</span>
            <span className="multi-accent-line w-6 h-px bg-lightGrey origin-left" />
          </div>

          {/* Left Column: Heading, Subtitle & Action */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <span className="multi-header-anim editorial-eyebrow text-burntOrange">MULTILINGUAL INTELLIGENCE</span>

              <div className="space-y-1">
                <h2 className="multi-header-anim font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-almostBlack">
                  MANY
                </h2>
                <h2 className="multi-header-anim font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-almostBlack">
                  LANGUAGES.
                </h2>
                <h2 className="multi-header-anim font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-burntOrange">
                  ONE BIGGER
                </h2>
                <h2 className="multi-header-anim font-editorial font-black text-4xl sm:text-5xl lg:text-6xl tracking-editorial-tighter leading-[0.92] uppercase text-burntOrange">
                  PICTURE.
                </h2>
              </div>

              <p className="multi-header-anim text-xs sm:text-sm text-editorialMuted max-w-sm leading-relaxed pt-2">
                Breaking language barriers to reveal a more complete understanding of global events.
                Native scripts analyzed with semantic consistency and cultural nuance.
              </p>
            </div>

            <div className="multi-header-anim pt-8">
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
              {/* Photo 1: Historic Street Alley */}
              <div className="triptych-item h-40 bg-almostBlack overflow-hidden border border-lightGrey relative group">
                <Image
                  src="/images/triptych-street.jpg"
                  alt="Historic European street alley with pedestrians"
                  fill
                  sizes="90px"
                  className="triptych-img object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-almostBlack/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold bg-burntOrange/90 px-1 py-0.5">
                    STREET
                  </span>
                </div>
              </div>

              {/* Photo 2: Historic Architectural Facade */}
              <div className="triptych-item h-44 -mt-2 bg-almostBlack overflow-hidden border border-lightGrey relative group shadow-editorial-sm">
                <Image
                  src="/images/triptych-facade.jpg"
                  alt="Historic architectural facade with warm tones"
                  fill
                  sizes="90px"
                  className="triptych-img object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-almostBlack/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold bg-almostBlack/80 px-1 py-0.5 border border-pureWhite/20">
                    FACADE
                  </span>
                </div>
              </div>

              {/* Photo 3: Classical Stone Colonnade / Archway */}
              <div className="triptych-item h-40 bg-almostBlack overflow-hidden border border-lightGrey relative group">
                <Image
                  src="/images/triptych-archway.jpg"
                  alt="Classical stone arched colonnade and portico"
                  fill
                  sizes="90px"
                  className="triptych-img object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-almostBlack/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
                  <span className="font-mono text-[7px] text-pureWhite uppercase font-bold bg-almostBlack/80 px-1 py-0.5 border border-pureWhite/20">
                    HERITAGE
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Stacked Annotation & Globe Mark */}
            <div className="multi-meta-anim mt-8 flex items-center justify-between w-full max-w-[280px] pt-4 border-t border-lightGrey">
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
