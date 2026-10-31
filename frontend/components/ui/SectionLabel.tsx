import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionLabelProps {
  index?: string;
  category: string;
  title?: React.ReactNode;
  accentWord?: string;
  description?: React.ReactNode;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  children?: React.ReactNode;
}

export function SectionLabel({
  index,
  category,
  title,
  accentWord,
  description,
  theme = 'light',
  size = 'md',
  className,
  children,
}: SectionLabelProps) {
  const isDark = theme === 'dark';

  const titleSizes = {
    sm: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    md: 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-editorial-tighter leading-none',
    lg: 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-editorial-tighter leading-none',
    hero: 'text-5xl sm:text-7xl lg:text-8xl font-black tracking-editorial-tighter leading-[0.88]',
  }[size];

  return (
    <div className={twMerge(clsx('flex flex-col gap-3', className))}>
      {/* Top index and eyebrow row */}
      <div className="flex items-center gap-3">
        {index && (
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'font-mono text-xs font-semibold tracking-wider',
                isDark ? 'text-burntOrange' : 'text-almostBlack'
              )}
            >
              {index}
            </span>
            <span
              className={clsx(
                'w-6 h-px',
                isDark ? 'bg-editorialDark-border' : 'bg-lightGrey'
              )}
            />
          </div>
        )}

        <span
          className={clsx(
            'editorial-eyebrow',
            isDark ? 'text-burntOrange' : 'text-burntOrange'
          )}
        >
          {category}
        </span>
      </div>

      {/* Main Title */}
      {title && (
        <h2
          className={clsx(
            'editorial-title uppercase',
            titleSizes,
            isDark ? 'text-pureWhite' : 'text-almostBlack'
          )}
        >
          {title}
          {accentWord && (
            <span className="text-burntOrange ml-2 inline-block">
              {accentWord}
            </span>
          )}
        </h2>
      )}

      {/* Optional Description */}
      {description && (
        <p
          className={clsx(
            'text-sm sm:text-base max-w-2xl font-normal leading-relaxed',
            isDark ? 'text-editorialDark-muted' : 'text-editorialMuted'
          )}
        >
          {description}
        </p>
      )}

      {children}
    </div>
  );
}

export default SectionLabel;
