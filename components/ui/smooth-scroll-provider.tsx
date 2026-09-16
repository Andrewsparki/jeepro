"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

export interface ScrollToOptions {
  duration?: number;
  offset?: number;
  immediate?: boolean;
}

interface SmoothScrollContextType {
  scrollTo: (target: number | string | HTMLElement, options?: ScrollToOptions) => void;
  smoother: null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
  smoother: null,
});

/**
 * High-Performance Native Scrolling Provider
 *
 * Utilizes the browser's native compositor-thread scrolling:
 * - 0ms input latency, 0 wheel event hijacking, 0 passive:false listeners
 * - Fully hardware-accelerated at native refresh rates (60Hz, 120Hz, 144Hz, 240Hz)
 * - Zero CPU/GPU overhead when idle
 * - Flawless native touch and precision trackpad inertia
 * - Full accessibility and keyboard scroll compliance
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Reset scroll to top on client-side route navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  // Programmatic scrollTo method for Navbars, anchor jumps, and settings tabs
  const scrollTo = useCallback(
    (target: number | string | HTMLElement, options?: ScrollToOptions) => {
      if (typeof window === "undefined") return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const immediate = options?.immediate || prefersReducedMotion;
      const behavior: ScrollBehavior = immediate ? "auto" : "smooth";
      const offset = options?.offset ?? 0;

      if (typeof target === "number") {
        window.scrollTo({
          top: Math.max(0, target + offset),
          behavior,
        });
        return;
      }

      const element =
        typeof target === "string" ? document.querySelector(target) : target;

      if (element instanceof HTMLElement) {
        const elementTop =
          element.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({
          top: Math.max(0, elementTop),
          behavior,
        });
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      scrollTo,
      smoother: null,
    }),
    [scrollTo]
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
