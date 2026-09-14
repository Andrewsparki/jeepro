"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePerformance } from "@/lib/performance-context";

interface SmoothScrollContextType {
  scrollTo: (target: number | string | HTMLElement, options?: { duration?: number; offset?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
});

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { enableSmoothScroll } = usePerformance();
  const isScrolling = useRef(false);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Keep native momentum on touch devices and respect reduced-motion
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!enableSmoothScroll || isTouch || prefersReducedMotion) {
      return;
    }

    currentY.current = window.scrollY;
    targetY.current = window.scrollY;
    lastTime.current = performance.now();

    // Frame-rate independent LERP physics loop (Optimized for 60Hz, 120Hz, 144Hz, 240Hz, 360Hz+)
    const updateScroll = (time: number) => {
      const deltaMs = Math.min(32, Math.max(1, time - (lastTime.current || time)));
      lastTime.current = time;

      // Time-normalized lerp coefficient: guarantees identical silky physics on any refresh rate
      const timeScale = deltaMs / 16.667;
      const lerpFactor = 1 - Math.pow(1 - 0.138, timeScale);

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetY.current = Math.max(0, Math.min(targetY.current, maxScroll));

      currentY.current += (targetY.current - currentY.current) * lerpFactor;
      window.scrollTo(0, Math.round(currentY.current * 10) / 10);

      const diff = Math.abs(targetY.current - currentY.current);
      if (diff > 0.25) {
        rafId.current = requestAnimationFrame(updateScroll);
      } else {
        isScrolling.current = false;
        currentY.current = targetY.current;
        window.scrollTo(0, targetY.current);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      let targetElement = e.target as HTMLElement | null;
      let hasInternalScroll = false;
      while (targetElement && targetElement !== document.body && targetElement !== document.documentElement) {
        const style = window.getComputedStyle(targetElement);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          targetElement.scrollHeight > targetElement.clientHeight
        ) {
          const atTop = targetElement.scrollTop === 0 && e.deltaY < 0;
          const atBottom =
            Math.ceil(targetElement.scrollTop + targetElement.clientHeight) >= targetElement.scrollHeight &&
            e.deltaY > 0;
          if (!atTop && !atBottom) {
            hasInternalScroll = true;
            break;
          }
        }
        targetElement = targetElement.parentElement;
      }

      if (hasInternalScroll) return;

      e.preventDefault();

      const deltaMultiplier = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * deltaMultiplier;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      targetY.current = Math.max(0, Math.min(targetY.current + delta * 0.95, maxScroll));

      if (!isScrolling.current) {
        isScrolling.current = true;
        lastTime.current = performance.now();
        rafId.current = requestAnimationFrame(updateScroll);
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(activeTag) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      let delta = 0;
      if (e.key === "ArrowDown") delta = 90;
      else if (e.key === "ArrowUp") delta = -90;
      else if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) delta = window.innerHeight * 0.75;
      else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) delta = -window.innerHeight * 0.75;
      else if (e.key === "Home") {
        targetY.current = 0;
        delta = 0;
      } else if (e.key === "End") {
        targetY.current = document.documentElement.scrollHeight - window.innerHeight;
        delta = 0;
      }

      if (delta !== 0 || e.key === "Home" || e.key === "End") {
        e.preventDefault();
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        targetY.current = Math.max(0, Math.min(targetY.current + delta, maxScroll));

        if (!isScrolling.current) {
          isScrolling.current = true;
          lastTime.current = performance.now();
          rafId.current = requestAnimationFrame(updateScroll);
        }
      }
    };

    const onScrollSync = () => {
      if (!isScrolling.current) {
        currentY.current = window.scrollY;
        targetY.current = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("scroll", onScrollSync, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("scroll", onScrollSync);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enableSmoothScroll]);

  const scrollTo = (
    target: number | string | HTMLElement,
    options?: { duration?: number; offset?: number }
  ) => {
    if (typeof window === "undefined") return;

    let targetPosition = 0;
    const offset = options?.offset || 0;

    if (typeof target === "number") {
      targetPosition = target + offset;
    } else if (typeof target === "string") {
      const el = document.querySelector(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        targetPosition = rect.top + window.scrollY + offset;
      }
    } else if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      targetPosition = rect.top + window.scrollY + offset;
    }

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    targetY.current = Math.max(0, Math.min(targetPosition, maxScroll));
    currentY.current = window.scrollY;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateScroll = () => {
      currentY.current = lerp(currentY.current, targetY.current, 0.138);
      window.scrollTo(0, currentY.current);

      if (Math.abs(targetY.current - currentY.current) > 0.5) {
        requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetY.current);
      }
    };

    requestAnimationFrame(updateScroll);
  };

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
