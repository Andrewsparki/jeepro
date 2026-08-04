"use client";

import React from 'react';
import { useTilt } from '@/hooks/useTilt';
import { usePerformance } from '@/lib/performance-context';
import { cn } from '@/lib/utils';

/**
 * Wrapper that adds a 3D tilt effect and radial glow to its children.
 * It respects the prefers-reduced-motion setting and Performance Mode.
 */
export const TiltWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { enableTilt } = usePerformance();
  const ref = useTilt(enableTilt ? 4 : 0); // max 4° tilt, 0 disables

  if (!enableTilt) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn('tilt-card', className)}>
      {children}
    </div>
  );
};
