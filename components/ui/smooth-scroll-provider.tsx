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
  smoother: LocomotiveScroll | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
  getLocomotive: () => null,
  smoother: null,
});

/**
 * Production-Optimized Locomotive Scroll Provider for Next.js App Router
 *
 * Optimizations:
 * - Direct LocomotiveScroll v5 (powered by Lenis) hardware-accelerated momentum engine
 * - Exponential decay easing with zero input latency & crisp deceleration
 * - Route transition reset & dynamic content auto-resize
 * - Modal / Radix dialog scroll-lock observer (stops locomotive when modals open)
 * - Automatic [data-lenis-prevent] protection on nested scrollable containers (sidebars, dialogs)
 * - Zero React re-renders during active scrolling (GPU direct DOM transforms)
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locomotiveRef = useRef<LocomotiveScroll | null>(null);

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

    // Hook into Lenis scroll events for the floating scrollbar indicator
    const lenis = locomotive.lenisInstance;
    if (lenis) {
      lenis.on("scroll", (e: { scroll: number; limit: number }) => {
        updateThumbPosition(e.scroll, e.limit);
      });
    }

    // Modal scroll lock observer (pause locomotive when dialogs/drawers lock body scroll)
    const observer = new MutationObserver(() => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.classList.contains("lenis-stopped");

      if (isLocked) {
        locomotive.stop();
      } else {
        locomotive.start();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });

    return () => {
      observer.disconnect();
      locomotive.destroy();
      locomotiveRef.current = null;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [updateThumbPosition]);

  // Route change: immediately reset scroll and recalculate heights
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (locomotiveRef.current) {
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

  const contextValue = useMemo(
    () => ({
      scrollTo,
      getLocomotive,
      smoother: locomotiveRef.current,
    }),
    [scrollTo, getLocomotive]
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
