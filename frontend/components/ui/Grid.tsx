import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EditorialGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  theme?: 'light' | 'dark';
  divided?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function EditorialGrid({
  columns = 4,
  theme = 'light',
  divided = true,
  className,
  children,
  ...props
}: EditorialGridProps) {
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-editorialDark-border' : 'border-lightGrey';

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  }[columns];

  return (
    <div
      className={twMerge(
        clsx(
          'grid w-full',
          colClasses,
          divided && clsx('border-t border-l', borderColor),
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
  divided?: boolean;
  highlightOnHover?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GridCell({
  theme = 'light',
  divided = true,
  highlightOnHover = true,
  className,
  children,
  ...props
}: GridCellProps) {
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-editorialDark-border' : 'border-lightGrey';

  return (
    <div
      className={twMerge(
        clsx(
          'relative p-6 sm:p-8 flex flex-col justify-between transition-colors duration-150',
          divided && clsx('border-r border-b', borderColor),
          isDark
            ? clsx(
                'bg-editorialDark-surface text-pureWhite',
                highlightOnHover && 'hover:bg-editorialDark-elevated'
              )
            : clsx(
                'bg-pureWhite text-almostBlack',
                highlightOnHover && 'hover:bg-warmOffWhite-dark/40'
              ),
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default EditorialGrid;
