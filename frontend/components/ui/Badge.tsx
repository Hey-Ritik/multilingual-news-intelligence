import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'language' | 'numeric' | 'status' | 'orange' | 'neutral' | 'dark';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  pulseColor?: 'orange' | 'emerald' | 'amber';
  active?: boolean;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  pulseColor = 'orange',
  active = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-mono font-medium tracking-tight select-none transition-colors duration-150';

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  }[size];

  const variantStyles = {
    language: clsx(
      'border text-xs uppercase',
      active
        ? 'border-burntOrange bg-burntOrange/10 text-burntOrange font-bold'
        : 'border-lightGrey bg-pureWhite text-almostBlack/70 hover:border-almostBlack hover:text-almostBlack'
    ),
    numeric:
      'border border-lightGrey bg-pureWhite text-almostBlack font-semibold',
    status:
      'border border-lightGrey bg-pureWhite text-almostBlack text-xs font-semibold rounded-full',
    orange:
      'border border-burntOrange bg-burntOrange text-white font-bold',
    neutral:
      'border border-lightGrey bg-pureWhite text-almostBlack',
    dark:
      'border border-editorialDark-border bg-editorialDark-surface text-pureWhite',
  }[variant];

  const pulseDotColor = {
    orange: 'bg-burntOrange',
    emerald: 'bg-emerald-500',
    amber: 'bg-warmOrange',
  }[pulseColor];

  return (
    <span
      className={twMerge(
        clsx(baseStyles, sizeStyles, variantStyles, className)
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={clsx(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseDotColor
            )}
          />
          <span
            className={clsx(
              'relative inline-flex rounded-full h-2 w-2',
              pulseDotColor
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
