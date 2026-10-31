'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Detect touch / coarse pointer devices or reduced motion
    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const checkSupport = () => {
      const isTouch = touchQuery.matches;
      const prefersReduced = motionQuery.matches;
      setIsEnabled(!isTouch && !prefersReduced);
    };

    checkSupport();
    touchQuery.addEventListener('change', checkSupport);
    motionQuery.addEventListener('change', checkSupport);

    return () => {
      touchQuery.removeEventListener('change', checkSupport);
      motionQuery.removeEventListener('change', checkSupport);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = !!target.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor="interactive"], .interactive-target'
      );
      setIsHovering(isInteractive);
    };

    const render = () => {
      const dx = targetX - ringX;
      const dy = targetY - ringY;
      ringX += dx * 0.22;
      ringY += dy * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Central precise dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-burntOrange rounded-full pointer-events-none z-[9999] opacity-0 transition-opacity duration-150"
        style={{ willChange: 'transform' }}
      />

      {/* Trailing outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] opacity-0 transition-[width,height,background-color,border-color,opacity] duration-200 ease-out ${
          isHovering
            ? 'w-10 h-10 border-2 border-burntOrange bg-burntOrange/10'
            : 'w-7 h-7 border border-burntOrange/60 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
