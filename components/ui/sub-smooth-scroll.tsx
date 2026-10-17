"use client";

import { useEffect, useRef, useCallback } from "react";

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
 * Attaches a dedicated Locomotive-style requestAnimationFrame momentum inertia scroll engine
 * to any nested or internal scrollable container.
 *
 * Architecture & Features:
 * - Scoped wheel smoothing with Locomotive's signature exponential deceleration (0.11 lerp)
 * - Complete scroll isolation: stops propagation and prevents bleed into parent window / dashboard
 * - Portal & deferred-mount resilience: automatically binds when Radix Portals / AnimatePresence finish mounting
 * - Frictionless scrollbar dragging & native keyboard navigation synchronization
 * - Native touch inertia on mobile devices (touch-pan-y)
 * - Real-time ResizeObserver tracking dynamic child height shifts
 * - 0% CPU consumption when idle; clean unmount on dropdown close
 */
export function useSubSmoothScroll<T extends HTMLElement = HTMLDivElement>(
  options?: SubSmoothScrollOptions
) {
  const containerRef = useRef<T | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const enabled = options?.enabled ?? true;
  const lerp = options?.lerp ?? 0.11;
  const wheelMultiplier = options?.wheelMultiplier ?? 1.05;

  const targetScrollRef = useRef<number>(0);
  const currentScrollRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  // Synchronize target and current scroll positions
  const clampTarget = useCallback(
    (el: HTMLElement) => {
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      targetScrollRef.current = Math.max(
        0,
        Math.min(maxScroll, targetScrollRef.current)
      );
      return maxScroll;
    },
    []
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let isCancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cleanupEngine: (() => void) | null = null;
    let attempts = 0;

    const setupEngine = (el: T) => {
      currentScrollRef.current = el.scrollTop;
      targetScrollRef.current = el.scrollTop;

      // Animation frame tick for exponential inertia decay
      const tick = () => {
        const maxScroll = clampTarget(el);
        if (maxScroll <= 0) {
          rafIdRef.current = null;
          isAnimatingRef.current = false;
          return;
        }

        const current = currentScrollRef.current;
        const target = targetScrollRef.current;
        const diff = target - current;
        const absDiff = Math.abs(diff);

        if (absDiff < 0.25) {
          currentScrollRef.current = target;
          el.scrollTop = target;
          isAnimatingRef.current = false;
          rafIdRef.current = null;
        } else {
          const next = current + diff * lerp;
          currentScrollRef.current = next;
          isAnimatingRef.current = true;
          el.scrollTop = next;
          rafIdRef.current = requestAnimationFrame(tick);
        }
      };

      const startRaf = () => {
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(tick);
        }
      };

      // Scoped Wheel event handler: prevents bleed-through and drives momentum
      const onWheel = (e: WheelEvent) => {
        // 1. Isolate event completely so background page / dashboard never scrolls
        e.stopPropagation();

        const maxScroll = clampTarget(el);

        // 2. Prevent default native stepped wheel jump
        e.preventDefault();

        if (maxScroll <= 0) return;

        // Normalize wheel delta across browsers and devices
        let delta = e.deltaY;
        if (e.deltaMode === 1) {
          // Line mode (e.g. Firefox)
          delta *= 16;
        } else if (e.deltaMode === 2) {
          // Page mode
          delta *= el.clientHeight || 400;
        }

        // Precision trackpads emit continuous fractional deltas
        const isTouchpad = !Number.isInteger(delta) || Math.abs(delta) < 25;
        const multiplier = isTouchpad ? 1.0 : wheelMultiplier;
        const scrollStep = delta * multiplier;

        targetScrollRef.current = Math.max(
          0,
          Math.min(maxScroll, targetScrollRef.current + scrollStep)
        );

        startRaf();
      };

      // Keep state synchronized with native scrollbar dragging and keyboard navigation
      const onScroll = () => {
        if (
          !isAnimatingRef.current ||
          Math.abs(el.scrollTop - currentScrollRef.current) > 2
        ) {
          currentScrollRef.current = el.scrollTop;
          targetScrollRef.current = el.scrollTop;
        }
      };

      // Detect click / drag in scrollbar gutter (right 16px)
      const onPointerDown = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.right - 18) {
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          isAnimatingRef.current = false;
          currentScrollRef.current = el.scrollTop;
          targetScrollRef.current = el.scrollTop;
        }
      };

      // Attach active listeners directly to the scroll element
      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("scroll", onScroll, { passive: true });
      el.addEventListener("pointerdown", onPointerDown, { passive: true });

      // Dynamic resize observer for notification addition, removal, or accordion toggling
      const resizeObserver = new ResizeObserver(() => {
        const maxScroll = clampTarget(el);
        currentScrollRef.current = Math.max(
          0,
          Math.min(maxScroll, currentScrollRef.current)
        );
      });

      resizeObserver.observe(el);
      const contentEl = contentRef.current;
      if (contentEl) {
        resizeObserver.observe(contentEl);
      }

      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        isAnimatingRef.current = false;
        resizeObserver.disconnect();
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("scroll", onScroll);
        el.removeEventListener("pointerdown", onPointerDown);
      };
    };

    const attach = () => {
      if (isCancelled) return;
      const el = containerRef.current;
      if (!el) {
        // Retry for deferred mounts (e.g. Radix UI Portals and AnimatePresence)
        if (attempts < 12) {
          attempts++;
          retryTimer = setTimeout(attach, 35);
        }
        return;
      }

      cleanupEngine = setupEngine(el);
    };

    attach();

    return () => {
      isCancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (cleanupEngine) {
        cleanupEngine();
      }
    };
  }, [enabled, lerp, wheelMultiplier, clampTarget]);

  const resize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    clampTarget(el);
  }, [clampTarget]);

  const scrollTo = useCallback(
    (
      target: number | string | HTMLElement,
      opts?: { immediate?: boolean; offset?: number }
    ) => {
      const el = containerRef.current;
      if (!el) return;

      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      let targetY = 0;

      if (typeof target === "number") {
        targetY = target;
      } else if (typeof target === "string") {
        if (target === "top" || target === "#top" || target === "start") {
          targetY = 0;
        } else if (target === "bottom" || target === "end") {
          targetY = maxScroll;
        } else {
          const found = el.querySelector(target);
          if (found instanceof HTMLElement) {
            targetY = found.offsetTop;
          }
        }
      } else if (target instanceof HTMLElement) {
        targetY = target.offsetTop;
      }

      targetY += opts?.offset ?? 0;
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      if (opts?.immediate) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        isAnimatingRef.current = false;
        currentScrollRef.current = targetY;
        targetScrollRef.current = targetY;
        el.scrollTop = targetY;
      } else {
        targetScrollRef.current = targetY;
        if (!rafIdRef.current) {
          const tick = () => {
            const current = currentScrollRef.current;
            const diff = targetScrollRef.current - current;
            if (Math.abs(diff) < 0.25) {
              currentScrollRef.current = targetScrollRef.current;
              el.scrollTop = targetScrollRef.current;
              isAnimatingRef.current = false;
              rafIdRef.current = null;
            } else {
              const next = current + diff * lerp;
              currentScrollRef.current = next;
              isAnimatingRef.current = true;
              el.scrollTop = next;
              rafIdRef.current = requestAnimationFrame(tick);
            }
          };
          rafIdRef.current = requestAnimationFrame(tick);
        }
      }
    },
    [lerp]
  );

  // Compatible mock object for any legacy callers querying lenisRef
  const lenisRef = useRef<{
    resize: () => void;
    scrollTo: typeof scrollTo;
    destroy: () => void;
  } | null>(null);

  useEffect(() => {
    lenisRef.current = {
      resize,
      scrollTo,
      destroy: () => {},
    };
  }, [resize, scrollTo]);

  return {
    containerRef,
    contentRef,
    lenisRef,
    resize,
    scrollTo,
  };
}
