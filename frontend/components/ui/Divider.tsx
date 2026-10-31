import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  theme?: 'light' | 'dark';
  crossmark?: boolean;
  crossmarkPosition?: 'start' | 'center' | 'end';
  label?: string;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  theme = 'light',
  crossmark = false,
  crossmarkPosition = 'start',
  label,
  className,
}: DividerProps) {
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-editorialDark-border' : 'border-lightGrey';
  const textColor = isDark ? 'text-editorialDark-muted' : 'text-editorialMuted';

  if (orientation === 'vertical') {
    return (
      <div
        className={twMerge(
          clsx('relative self-stretch flex items-center justify-center', className)
        )}
      >
        <div className={clsx('h-full w-px border-r', borderColor)} />
        {crossmark && (
          <span
            className={clsx(
              'absolute font-mono text-xs select-none pointer-events-none',
              textColor,
              crossmarkPosition === 'start' && 'top-0 -translate-y-1/2',
              crossmarkPosition === 'center' && 'top-1/2 -translate-y-1/2',
              crossmarkPosition === 'end' && 'bottom-0 translate-y-1/2'
            )}
          >
            +
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx('relative w-full flex items-center', label ? 'my-4' : 'my-0', className)
      )}
    >
      <div className={clsx('w-full border-b', borderColor)} />
      {crossmark && (
        <span
          className={clsx(
            'absolute font-mono text-xs select-none pointer-events-none',
            textColor,
            crossmarkPosition === 'start' && 'left-0 -translate-x-1/2',
            crossmarkPosition === 'center' && 'left-1/2 -translate-x-1/2',
            crossmarkPosition === 'end' && 'right-0 translate-x-1/2'
          )}
        >
          +
        </span>
      )}
      {label && (
        <span
          className={clsx(
            'absolute left-4 -translate-y-1/2 px-2 font-mono text-[10px] tracking-wider uppercase font-semibold',
            isDark ? 'bg-editorialDark-bg text-editorialDark-muted' : 'bg-warmOffWhite text-editorialMuted'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default Divider;
