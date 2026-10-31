'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { clsx } from 'clsx';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Workspace', href: '/workspace' },
    { name: 'Methodology', href: '/methodology' },
    { name: 'Limitations', href: '/limitations' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-warmOffWhite/95 backdrop-blur-sm border-b border-lightGrey transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity (Swiss International Typographic Style) */}
          <Link href="/" className="flex items-center gap-3.5 group select-none">
            <div className="relative w-9 h-9 border border-almostBlack/80 flex items-center justify-center bg-pureWhite transition-colors duration-200 group-hover:bg-burntOrange group-hover:border-burntOrange group-hover:text-pureWhite">
              <Globe className="w-5 h-5 text-almostBlack transition-colors duration-200 group-hover:text-pureWhite stroke-[1.75]" />
              {/* Corner crosshairs characteristic of Swiss layouts */}
              <span className="absolute -top-1 -left-1 text-[8px] font-mono text-almostBlack/40 leading-none group-hover:text-burntOrange">+</span>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono text-almostBlack/40 leading-none group-hover:text-burntOrange">+</span>
            </div>

            <div className="flex flex-col">
              <span className="font-editorial font-extrabold text-sm sm:text-base tracking-editorial-tight uppercase text-almostBlack leading-none group-hover:text-burntOrange transition-colors">
                MULTILINGUAL
              </span>
              <span className="font-editorial font-bold text-xs tracking-editorial-wide uppercase text-almostBlack/70 leading-tight">
                NEWS INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    'relative text-xs uppercase font-bold tracking-editorial-wide transition-colors duration-150 py-1',
                    isActive
                      ? 'text-almostBlack font-extrabold'
                      : 'text-editorialMuted hover:text-almostBlack'
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-burntOrange" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Language Chip & Primary CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Supported Language Chips */}
            <div className="flex items-center border border-lightGrey bg-pureWhite px-2.5 py-1 text-[11px] font-mono font-semibold text-almostBlack/80 gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>EN • HI • KN • TE • TA</span>
            </div>

            {/* Signature Swiss Editorial Pill Button from Reference */}
            <Button
              href="/workspace"
              variant="pill"
              size="sm"
              showArrow
              className="px-5 py-2 text-xs uppercase tracking-wider"
            >
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              href="/workspace"
              variant="pill"
              size="xs"
              className="text-[11px]"
            >
              Launch
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-lightGrey bg-pureWhite text-almostBlack hover:border-almostBlack focus-visible:ring-2 focus-visible:ring-burntOrange transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-lightGrey bg-pureWhite px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center justify-between text-sm uppercase font-bold tracking-wider py-2 border-b border-lightGrey/60',
                  pathname === link.href ? 'text-burntOrange' : 'text-almostBlack'
                )}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-editorialMuted border border-lightGrey p-2.5 bg-warmOffWhite">
              <span>ACTIVE NLP MODELS</span>
              <span className="font-bold text-almostBlack">EN • HI • KN • TE • TA</span>
            </div>
            <Button
              href="/workspace"
              variant="primary"
              size="md"
              fullWidth
              showArrow
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch App
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
