import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children: React.ReactNode;
}

export function Container({
  size = 'xl',
  className,
  children,
  ...props
}: ContainerProps) {
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <div
      className={twMerge(
        clsx('w-full mx-auto px-4 sm:px-6 lg:px-8', sizeStyles, className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface EditorialSectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  sectionNumber?: string;
  theme?: 'light' | 'dark';
  borderTop?: boolean;
  borderBottom?: boolean;
  sideAnnotation?: string;
  className?: string;
  children: React.ReactNode;
}

export function EditorialSection({
  id,
  sectionNumber,
  theme = 'light',
  borderTop = true,
  borderBottom = false,
  sideAnnotation,
  className,
  children,
  ...props
}: EditorialSectionProps) {
  const isDark = theme === 'dark';

  return (
    <section
      id={id}
      className={twMerge(
        clsx(
          'relative w-full transition-colors duration-200',
          isDark
            ? 'bg-editorialDark-bg text-editorialDark-text border-editorialDark-border'
            : 'bg-warmOffWhite text-almostBlack border-lightGrey',
          borderTop && 'border-t',
          borderBottom && 'border-b',
          className
        )
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Optional Left Section Number Gutter */}
          {sectionNumber && (
            <div className="hidden lg:block lg:col-span-1 pt-1">
              <div className="sticky top-24 flex flex-col items-start gap-2">
                <span
                  className={clsx(
                    'font-mono text-sm font-bold tracking-tight',
                    isDark ? 'text-burntOrange' : 'text-almostBlack'
                  )}
                >
                  {sectionNumber}
                </span>
                <span
                  className={clsx(
                    'w-6 h-px',
                    isDark ? 'bg-editorialDark-border' : 'bg-lightGrey'
                  )}
                />
              </div>
            </div>
          )}

          {/* Main Section Content */}
          <div
            className={clsx(
              sectionNumber ? (sideAnnotation ? 'lg:col-span-10' : 'lg:col-span-11') : (sideAnnotation ? 'lg:col-span-11' : 'lg:col-span-12'),
              'w-full'
            )}
          >
            {children}
          </div>

          {/* Optional Right Side Annotation */}
          {sideAnnotation && (
            <div className="hidden lg:block lg:col-span-1 pt-1 text-right">
              <div className="sticky top-24">
                <p
                  className={clsx(
                    'font-mono text-[10px] tracking-widest uppercase leading-relaxed',
                    isDark ? 'text-editorialDark-muted' : 'text-editorialMuted'
                  )}
                >
                  {sideAnnotation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Container;
