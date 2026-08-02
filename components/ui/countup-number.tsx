import React from 'react';
import CountUp from 'react-countup';

/**
 * Wrapper around react-countup that respects prefers-reduced-motion.
 * If the user prefers reduced motion, the number will be rendered statically.
 */
export function CountUpNumber({ end }: { end: number }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return <span>{end}</span>;
  }
  return <CountUp end={end} duration={1.5} separator="," />;
}
