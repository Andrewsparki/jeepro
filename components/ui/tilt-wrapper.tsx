import React from 'react';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';

/**
 * Wrapper that adds a 3D tilt effect and radial glow to its children.
 * It respects the prefers‑reduced‑motion setting.
 */
export const TiltWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useTilt(4); // max 4° tilt
  return (
    <div ref={ref} className={cn('tilt-card', className)}>
      {children}
    </div>
  );
};
