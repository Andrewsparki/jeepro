"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type Lenis from "lenis";
import { usePerformance } from "@/lib/performance-context";

function LenisExposer() {
  const lenis = useLenis();
  
  useEffect(() => {
    if (lenis) {
      // Safely cast window to expose the active Lenis instance for debugging
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }
  }, [lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { enableSmoothScroll } = usePerformance();

  if (!enableSmoothScroll) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        smoothWheel: true,
        syncTouch: true,
        lerp: 0.07,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        infinite: false,
        autoResize: true,
      }}
    >
      <LenisExposer />
      {children}
    </ReactLenis>
  );
}

export function useSmoothScroll() {
  const lenis = useLenis();

  return {
    scrollTo: (target: number | string | HTMLElement, options?: any) => {
      if (lenis) {
        lenis.scrollTo(target, options);
      } else {
        // Fallback for native scrolling if lenis is disabled
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };
}
