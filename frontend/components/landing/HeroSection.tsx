'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGPathElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Intro timeline for headline and ribbon
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-anim-text', {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
      })
        .from(
          '.hero-ribbon',
          {
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 1.2,
            ease: 'expo.out',
          },
          '-=0.7'
        )
        .from(
          '.hero-globe',
          {
            scale: 0.9,
            opacity: 0,
            duration: 1,
          },
          '-=0.9'
        )
        .from(
          '.hero-sub-card',
          {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
          },
          '-=0.6'
        );

      // Scroll-driven parallax for the orange ribbon and globe
      gsap.to('.hero-ribbon', {
        y: 80,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.hero-globe', {
        y: -40,
        rotate: 10,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToNextSection = () => {
    const el = document.getElementById('section-global-perspective');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full bg-warmOffWhite border-b border-lightGrey overflow-hidden min-h-[92vh] flex flex-col justify-between"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 border-x border-lightGrey/60 grid grid-cols-12">
          <div className="col-span-1 border-r border-lightGrey/40 h-full hidden lg:block" />
          <div className="col-span-7 h-full" />
          <div className="col-span-3 border-r border-lightGrey/40 h-full hidden md:block" />
          <div className="col-span-1 h-full hidden lg:block" />
        </div>
      </div>

      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 flex-1 flex flex-col justify-between z-10">
        {/* Main Hero Architectural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          {/* Left Vertical Language Rail (Reference Style) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-start gap-4 pt-4 border-r border-lightGrey/60 pr-4">
            <span className="text-burntOrange font-mono text-sm font-bold">→</span>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase font-semibold text-editorialMuted">
              <span className="text-burntOrange font-bold bg-burntOrange/10 px-1.5 py-0.5 border border-burntOrange">
                EN
              </span>
              <span className="hover:text-almostBlack transition-colors cursor-default">
                हिंदी
              </span>
              <span className="hover:text-almostBlack transition-colors cursor-default">
                বাংলা
              </span>
              <span className="hover:text-almostBlack transition-colors cursor-default">
                தமிழ்
              </span>
              <span className="text-almostBlack/40 font-bold">+</span>
            </div>
          </div>

          {/* Center-Left Content Area */}
          <div className="lg:col-span-6 flex flex-col justify-between z-20">
            {/* Oversized Headline matching Reference Image */}
            <div ref={headlineRef} className="space-y-1 sm:space-y-2">
              <h1 className="hero-anim-text font-editorial font-black text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] tracking-editorial-tighter leading-[0.88] uppercase text-almostBlack">
                NEWS.
              </h1>
              <h1 className="hero-anim-text font-editorial font-black text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] tracking-editorial-tighter leading-[0.88] uppercase text-almostBlack">
                WITHOUT
              </h1>
              <h1 className="hero-anim-text font-editorial font-black text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] tracking-editorial-tighter leading-[0.88] uppercase text-burntOrange">
                BORDERS.
              </h1>
            </div>

            {/* Sub-Eyebrow & Supporting Description */}
            <div className="mt-8 space-y-4 max-w-md">
              <div className="hero-anim-text font-mono text-xs font-bold tracking-editorial-widest uppercase text-almostBlack/90 border-l-2 border-burntOrange pl-3">
                MULTILINGUAL NEWS INTELLIGENCE SYSTEM
              </div>

              <p className="hero-anim-text text-xs sm:text-sm text-editorialMuted leading-relaxed font-normal">
                <strong className="text-almostBlack font-semibold">Analyse. Understand. Compare.</strong>
                <br />
                Bringing global news perspectives together through advanced multilingual NLP and
                explainable cross-language linguistic verification.
              </p>

              {/* Scroll Trigger Discover Pill */}
              <div className="hero-anim-text pt-4 flex items-center gap-4">
                <button
                  onClick={scrollToNextSection}
                  className="group flex items-center gap-3 text-left focus:outline-none"
                  aria-label="Scroll to discover"
                >
                  <div className="w-9 h-9 rounded-full bg-almostBlack text-pureWhite flex items-center justify-center group-hover:bg-burntOrange transition-colors duration-200">
                    <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-almostBlack group-hover:text-burntOrange transition-colors">
                      Explore the Platform
                    </div>
                    <div className="text-[10px] font-mono text-editorialMuted">
                      Scroll to discover
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Center-Right: Signature Orange Geometric Curved Swoop & Grayscale Globe */}
          <div className="lg:col-span-4 relative h-[380px] sm:h-[480px] flex items-center justify-center overflow-visible">
            {/* The Signature Orange Dynamic Geometric Swoop */}
            <div className="hero-ribbon absolute -top-12 -right-8 w-[280px] sm:w-[360px] h-[480px] sm:h-[560px] pointer-events-none z-10">
              <svg
                viewBox="0 0 360 560"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-editorial-md"
              >
                {/* Asymmetric curved orange architectural swoop from the reference */}
                <path
                  d="M190 0 C280 120 330 260 270 380 C230 460 160 520 80 560 L0 560 C90 510 160 440 190 360 C230 260 190 140 110 0 Z"
                  fill="#E85D26"
                />
                {/* Secondary deeper accent geometric facet */}
                <path
                  d="M270 380 C230 460 160 520 80 560 L140 560 C200 510 250 450 280 390 Z"
                  fill="#C7471D"
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* High-Contrast Grayscale Globe with Coordinate Grids */}
            <div className="hero-globe relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-almostBlack/20 bg-pureWhite shadow-editorial-md overflow-hidden flex items-center justify-center z-0">
              {/* Halftone / Line Grids */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(#171717 1px, transparent 1px), linear-gradient(to right, #171717 1px, transparent 1px)',
                  backgroundSize: '16px 16px, 32px 32px',
                }}
              />

              {/* Vector Globe Wireframe Projection */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full stroke-almostBlack/40 fill-none"
                strokeWidth="0.75"
              >
                {/* Outer Sphere */}
                <circle cx="100" cy="100" r="96" strokeWidth="1" stroke="#171717" />
                {/* Latitudinal Ellipses */}
                <ellipse cx="100" cy="100" rx="96" ry="32" />
                <ellipse cx="100" cy="100" rx="96" ry="64" />
                <ellipse cx="100" cy="100" rx="96" ry="86" />
                {/* Longitudinal Ellipses */}
                <ellipse cx="100" cy="100" rx="32" ry="96" />
                <ellipse cx="100" cy="100" rx="64" ry="96" />
                <ellipse cx="100" cy="100" rx="86" ry="96" />
                <line x1="4" y1="100" x2="196" y2="100" strokeWidth="1.2" stroke="#E85D26" />
                <line x1="100" y1="4" x2="100" y2="196" strokeWidth="1" />
              </svg>

              {/* Realistic Grayscale Topographic Globe Overlay */}
              <div
                className="absolute inset-0 mix-blend-multiply opacity-75 grayscale contrast-125"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8), rgba(20,20,20,0.95))',
                }}
              />

              {/* Precision Target Coordinates */}
              <div className="absolute font-mono text-[9px] text-almostBlack font-bold bottom-4 left-6 bg-pureWhite/90 px-1 border border-lightGrey">
                LAT 28.61° N / LON 77.20° E
              </div>
            </div>
          </div>

          {/* Right Gutter Annotation Strip (Reference Style) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col justify-between items-end h-full pt-4">
            <div className="space-y-1 font-mono text-[9px] text-right text-editorialMuted tracking-widest uppercase leading-snug">
              <div>GLOBAL</div>
              <div>NEWS</div>
              <div>LOCAL</div>
              <div>PERSPECTIVES</div>
              <div>A CLEARER</div>
              <div className="text-burntOrange font-bold">TRUTH.</div>
            </div>

            <div className="pt-24 flex flex-col items-end gap-1">
              <span className="font-mono text-sm font-bold text-almostBlack">01</span>
              <span className="w-6 h-px bg-almostBlack" />
            </div>
          </div>
        </div>

        {/* Bottom Editorial Vignettes Row (Reference Image) */}
        <div
          ref={cardsRef}
          className="mt-12 pt-6 border-t border-lightGrey grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6"
        >
          {/* Vignette 1: Same Event */}
          <div className="hero-sub-card flex items-center gap-3 p-3 bg-pureWhite border border-lightGrey shadow-editorial-sm group hover:border-almostBlack transition-all">
            <div className="w-16 h-12 bg-almostBlack/90 overflow-hidden relative border border-lightGrey shrink-0">
              {/* Grayscale Press / Assembly Visual */}
              <div className="w-full h-full bg-gradient-to-tr from-almostBlack via-editorialMuted to-pureWhite/80 opacity-80 mix-blend-luminosity flex items-center justify-center font-mono text-[8px] text-pureWhite">
                EVENT
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-burntOrange uppercase tracking-wider">
                SAME EVENT.
              </div>
              <div className="text-xs text-editorialMuted leading-tight mt-0.5">
                Single global development occurring in real time.
              </div>
            </div>
          </div>

          {/* Vignette 2: Different Perspectives */}
          <div className="hero-sub-card flex items-center gap-3 p-3 bg-pureWhite border border-lightGrey shadow-editorial-sm group hover:border-almostBlack transition-all">
            <div className="w-16 h-12 bg-almostBlack/90 overflow-hidden relative border border-lightGrey shrink-0">
              <div className="w-full h-full bg-gradient-to-tr from-almostBlack via-editorialMuted to-pureWhite/80 opacity-80 mix-blend-luminosity flex items-center justify-center font-mono text-[8px] text-pureWhite">
                MEDIA
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-almostBlack uppercase tracking-wider">
                DIFFERENT PERSPECTIVES.
              </div>
              <div className="text-xs text-editorialMuted leading-tight mt-0.5">
                Framing variations across diverse cultural media.
              </div>
            </div>
          </div>

          {/* Vignette 3: A Broader Understanding */}
          <div className="hero-sub-card flex items-center gap-3 p-3 bg-pureWhite border border-lightGrey shadow-editorial-sm group hover:border-almostBlack transition-all">
            <div className="w-16 h-12 bg-almostBlack/90 overflow-hidden relative border border-lightGrey shrink-0">
              <div className="w-full h-full bg-gradient-to-tr from-burntOrange via-deepOrange to-almostBlack opacity-90 flex items-center justify-center font-mono text-[8px] text-pureWhite">
                TRUTH
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-almostBlack uppercase tracking-wider">
                A BROADER UNDERSTANDING.
              </div>
              <div className="text-xs text-editorialMuted leading-tight mt-0.5">
                Explainable verification without linguistic bias.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
