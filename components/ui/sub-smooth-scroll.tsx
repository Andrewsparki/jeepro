"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";

export interface SubSmoothScrollOptions {
  lerp?: number;
  duration?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  orientation?: "vertical" | "horizontal";
  overscroll?: boolean;
  enabled?: boolean;
}

/**
 * Attaches a dedicated Locomotive (Lenis) smooth inertia scroll engine
 * to any nested/internal scrollable container.
 *
 * Provides:
 * - Direct Lenis momentum interpolation (0.1 lerp or custom duration)
 * - Touch inertia for mobile devices
 * - Real-time naiveDimensions calculation so limits are never stale
 * - Hardware accelerated smooth momentum scrolling with zero native jumpiness
 */
export function useSubSmoothScroll<T extends HTMLElement = HTMLDivElement>(
  options?: SubSmoothScrollOptions
) {
  const containerRef = useRef<T>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const wrapper = containerRef.current;
    if (!wrapper) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const content = contentRef.current || (wrapper.firstElementChild as HTMLElement) || wrapper;

    let lenis: Lenis | null = null;
    const resizeTimers: ReturnType<typeof setTimeout>[] = [];

    try {
      lenis = new Lenis({
        wrapper,
        content,
        eventsTarget: wrapper,
        lerp: options?.lerp ?? 0.1,
        duration: options?.duration ?? 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: options?.orientation ?? "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: options?.wheelMultiplier ?? 1.0,
        touchMultiplier: options?.touchMultiplier ?? 1.5,
        autoResize: true,
        naiveDimensions: true,
        overscroll: options?.overscroll ?? true,
        autoRaf: true,
      });

      lenisRef.current = lenis;

      // Staggered geometry updates to accommodate layout and spring entrances
      [50, 150, 300, 500].forEach((delay) => {
        const timer = setTimeout(() => {
          lenis?.resize();
        }, delay);
        resizeTimers.push(timer);
      });

      return () => {
        resizeTimers.forEach(clearTimeout);
        lenis?.destroy();
        lenisRef.current = null;
      };
    } catch (err) {
      console.error("[useSubSmoothScroll] Error initializing Lenis:", err);
    }
  }, [
    enabled,
    options?.lerp,
    options?.duration,
    options?.wheelMultiplier,
    options?.touchMultiplier,
    options?.orientation,
    options?.overscroll,
  ]);

  const resize = useCallback(() => {
    lenisRef.current?.resize();
  }, []);

  const scrollTo = useCallback(
    (
      target: number | string | HTMLElement,
      opts?: { immediate?: boolean; offset?: number }
    ) => {
      lenisRef.current?.scrollTo(target, opts);
    },
    []
  );

  return {
    containerRef,
    contentRef,
    lenisRef,
    resize,
    scrollTo,
  };
}
