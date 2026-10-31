import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'pill' | 'secondary' | 'outline' | 'dark' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pill?: boolean;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showArrow?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  href,
  icon,
  iconPosition = 'right',
  showArrow = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isPill = pill || variant === 'pill';

  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burntOrange focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.99]';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 gap-1.5',
    sm: 'text-xs px-3.5 py-1.5 gap-2 font-semibold',
    md: 'text-sm px-5 py-2.5 gap-2.5 font-semibold',
    lg: 'text-base px-7 py-3 gap-3 font-bold',
  }[size];

  const variantStyles = {
    primary:
      'bg-burntOrange text-white hover:bg-burntOrange-hover active:bg-deepOrange shadow-editorial-sm border border-transparent',
    pill:
      'bg-almostBlack text-white hover:bg-burntOrange hover:shadow-editorial-orange border border-transparent',
    secondary:
      'bg-pureWhite text-almostBlack border border-lightGrey hover:border-almostBlack hover:bg-warmOffWhite shadow-editorial-sm',
    outline:
      'bg-transparent text-almostBlack border border-almostBlack/40 hover:border-almostBlack hover:bg-almostBlack hover:text-white',
    dark:
      'bg-almostBlack text-pureWhite hover:bg-almostBlack-soft border border-almostBlack',
    ghost:
      'bg-transparent text-almostBlack hover:bg-almostBlack/5 border border-transparent',
  }[variant];

  const roundedStyles = isPill ? 'rounded-full' : 'rounded-none';

  const classes = twMerge(
    clsx(
      baseStyles,
      sizeStyles,
      variantStyles,
      roundedStyles,
      fullWidth && 'w-full',
      className
    )
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      {showArrow && !icon && (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={clsx('group', classes)}>
        {content}
      </Link>
    );
  }

  return (
    <button className={clsx('group', classes)} disabled={disabled} {...props}>
      {content}
    </button>
  );
}

export default Button;
