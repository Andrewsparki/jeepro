"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import LocomotiveScroll from "locomotive-scroll";
import type { ILenisScrollToOptions } from "locomotive-scroll";

export interface ScrollToOptions extends ILenisScrollToOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
}

interface SmoothScrollContextType {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: ScrollToOptions
  ) => void;
  getLocomotive: () => LocomotiveScroll | null;
  resize: () => void;
  start: () => void;
  stop: () => void;
  smoother: LocomotiveScroll | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
  getLocomotive: () => null,
  resize: () => {},
  start: () => {},
  stop: () => {},
  smoother: null,
});

/**
 * Checks whether the page is intentionally scroll-locked by a modal, dialog, sheet, or overlay.
 * Crucially, this inspects EXTERNAL lock signals only (e.g. Radix data-scroll-locked, overflow: hidden).
 * It NEVER checks internal Locomotive/Lenis state classes (such as lenis-stopped), which would
 * cause an unrecoverable deadlock.
 */
function checkIsScrollLocked(): boolean {
  if (typeof document === "undefined") return false;

  const body = document.body;
  const html = document.documentElement;

  // 1. Radix UI or custom scroll-lock attributes
  if (
    body.hasAttribute("data-scroll-locked") ||
    html.hasAttribute("data-scroll-locked")
  ) {
    return true;
  }

  // 2. Inline overflow styles on body
  const bodyOverflow = body.style.overflow;
  const bodyOverflowY = body.style.overflowY;
  if (
    bodyOverflow === "hidden" ||
    bodyOverflow === "clip" ||
    bodyOverflowY === "hidden" ||
    bodyOverflowY === "clip"
  ) {
    return true;
  }

  // 3. Inline overflow styles on html
  const htmlOverflow = html.style.overflow;
  const htmlOverflowY = html.style.overflowY;
  if (
    htmlOverflow === "hidden" ||
    htmlOverflow === "clip" ||
    htmlOverflowY === "hidden" ||
    htmlOverflowY === "clip"
  ) {
    return true;
  }

  // 4. Utility classes indicating an explicit scroll lock
  const lockedClasses = ["overflow-hidden", "no-scroll", "scroll-locked", "modal-open"];
  if (lockedClasses.some((cls) => body.classList.contains(cls))) {
    return true;
  }
  if (lockedClasses.some((cls) => html.classList.contains(cls))) {
    return true;
  }

  return false;
}

/**
 * Production-Optimized Locomotive Scroll Provider for Next.js App Router
 *
 * Architecture & Features:
 * - Direct LocomotiveScroll v5 (powered by Lenis) hardware-accelerated momentum engine
 * - Single persistent scroll owner for the authenticated application
 * - Deadlock-free modal/dialog scroll-lock synchronizer
 * - Real-time ResizeObserver for dynamic DOM content height shifts (e.g. Leaderboard tab changes)
 * - Route navigation transition reset with automatic cleanup of orphaned modal locks
 * - Zero React re-renders during active scrolling (GPU direct DOM transforms)
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locomotiveRef = useRef<LocomotiveScroll | null>(null);
  const isStoppedRef = useRef(false);

  const indicatorContainerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  // Update floating indicator thumb directly on compositor (0 React re-renders)
  const updateThumbPosition = useCallback((scroll: number, limit: number) => {
    if (!thumbRef.current || !indicatorContainerRef.current) return;

    if (limit <= 10) {
      indicatorContainerRef.current.style.display = "none";
      return;
    }

    indicatorContainerRef.current.style.display = "block";
    indicatorContainerRef.current.style.opacity = "1";

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (indicatorContainerRef.current && !isDraggingRef.current) {
        indicatorContainerRef.current.style.opacity = "0";
      }
    }, 1100);

    const progress = Math.max(0, Math.min(1, limit > 0 ? scroll / limit : 0));
    const trackH = window.innerHeight - 32;
    const thumbH = Math.max(
      40,
      (window.innerHeight / (limit + window.innerHeight)) * trackH
    );
    const thumbTop = Math.max(0, Math.min(trackH - thumbH, progress * (trackH - thumbH)));

    thumbRef.current.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
    thumbRef.current.style.height = `${thumbH}px`;
  }, []);

  // Initialize Locomotive Scroll on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const locomotive = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.1, // Locomotive's signature smooth inertia ratio
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean exponential deceleration
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
        autoResize: true,
      },
      autoStart: true,
    });

    locomotiveRef.current = locomotive;
    isStoppedRef.current = false;

    // Hook into Lenis scroll events for the floating scrollbar indicator
    const lenis = locomotive.lenisInstance;
    if (lenis) {
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        updateThumbPosition(e.scroll, e.limit);
      });
    }

    // Modal scroll lock synchronizer: pauses locomotive when dialogs/drawers lock body scroll,
    // and reliably restarts locomotive when all locks are released.
    const syncScrollLock = () => {
      if (!locomotiveRef.current) return;
      const locked = checkIsScrollLocked();

      if (locked) {
        if (!isStoppedRef.current) {
          locomotiveRef.current.stop();
          isStoppedRef.current = true;
        }
      } else {
        if (isStoppedRef.current) {
          locomotiveRef.current.start();
          isStoppedRef.current = false;
        }
      }
    };

    const mutationObserver = new MutationObserver(() => {
      syncScrollLock();
    });

    mutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class", "data-scroll-locked"],
    });

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });

    // Content resize observer: detects DOM height shifts (e.g. Leaderboard tab changes, data loading)
    // and updates Locomotive dimensions immediately via requestAnimationFrame
    let resizeRafId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (locomotiveRef.current && !isStoppedRef.current) {
          locomotiveRef.current.resize();
        }
      });
    });

    resizeObserver.observe(document.body);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      locomotive.destroy();
      locomotiveRef.current = null;
      isStoppedRef.current = false;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [updateThumbPosition]);

  // Route change: immediately reset scroll, clear any orphaned locks, and recalculate heights
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear any orphaned lock left by unmounted modals from the previous route
    const hasOpenDialog = Boolean(
      document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-slot="dialog-content"], [data-slot="sheet-content"]'
      )
    );
    if (!hasOpenDialog) {
      if (document.body.hasAttribute("data-scroll-locked")) {
        document.body.removeAttribute("data-scroll-locked");
      }
      if (document.body.style.overflow === "hidden" || document.body.style.overflow === "clip") {
        document.body.style.overflow = "";
      }
    }

    if (locomotiveRef.current) {
      if (!checkIsScrollLocked()) {
        locomotiveRef.current.start();
        isStoppedRef.current = false;
      }
      locomotiveRef.current.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => {
        locomotiveRef.current?.resize();
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Programmatic scrollTo method
  const scrollTo = useCallback(
    (
      target: number | string | HTMLElement,
      options?: ScrollToOptions
    ) => {
      if (locomotiveRef.current) {
        locomotiveRef.current.scrollTo(target, options);
      } else if (typeof window !== "undefined") {
        if (typeof target === "number") {
          window.scrollTo({
            top: target + (options?.offset ?? 0),
            behavior: options?.immediate ? "auto" : "smooth",
          });
        } else {
          const el =
            typeof target === "string" ? document.querySelector(target) : target;
          if (el instanceof HTMLElement) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: top + (options?.offset ?? 0),
              behavior: options?.immediate ? "auto" : "smooth",
            });
          }
        }
      }
    },
    []
  );

  const getLocomotive = useCallback(() => locomotiveRef.current, []);

  const resize = useCallback(() => {
    if (locomotiveRef.current && !isStoppedRef.current) {
      locomotiveRef.current.resize();
    }
  }, []);

  const start = useCallback(() => {
    if (locomotiveRef.current && !checkIsScrollLocked()) {
      locomotiveRef.current.start();
      isStoppedRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    if (locomotiveRef.current) {
      locomotiveRef.current.stop();
      isStoppedRef.current = true;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      scrollTo,
      getLocomotive,
      resize,
      start,
      stop,
      get smoother() {
        return locomotiveRef.current;
      },
    }),
    [scrollTo, getLocomotive, resize, start, stop]
  );

  // Floating indicator drag logic
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const locomotive = locomotiveRef.current;
    if (!locomotive || !locomotive.lenisInstance) return;

    const startY = e.clientY;
    const lenis = locomotive.lenisInstance;
    const startScroll = lenis.scroll;
    const maxScroll = lenis.limit;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const trackH = window.innerHeight - 32;
      const ratio = deltaY / trackH;
      const newTarget = Math.max(
        0,
        Math.min(maxScroll, startScroll + ratio * maxScroll)
      );

      locomotive.scrollTo(newTarget, { immediate: true });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (indicatorContainerRef.current) {
        indicatorContainerRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}

      {/* Floating Locomotive Liquid Glass Scrollbar Indicator */}
      <div
        ref={indicatorContainerRef}
        aria-hidden="true"
        className="fixed right-1.5 top-4 bottom-4 z-50 pointer-events-none transition-opacity duration-300 ease-out opacity-0"
      >
        <div
          ref={thumbRef}
          onMouseDown={handleThumbMouseDown}
          className="w-1.5 hover:w-2.5 rounded-full bg-white/25 hover:bg-white/45 border border-white/20 backdrop-blur-md shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-[width,background-color] duration-150 pointer-events-auto cursor-grab active:cursor-grabbing group relative"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-400/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
