"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePerformance } from "@/lib/performance-context";

interface LightingContextType {
  isTouch: boolean;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

const LightingContext = createContext<LightingContextType>({
  isTouch: false,
  mouseRef: { current: { x: 0, y: 0 } },
});

export function useLighting() {
  return useContext(LightingContext);
}

export function LightingProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const dirty = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const { enableMouseLighting } = usePerformance();

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (touch || isReducedMotion || !enableMouseLighting) {
      const t = setTimeout(() => setIsTouch(true), 0);
      return () => clearTimeout(t);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dirty.current = true;

      // Restart RAF loop if it was stopped due to idle
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(updateLighting);
      }

      // Reset idle timer
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        // Stop the RAF loop after 100ms of no mouse movement
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = 0;
        }
      }, 100);
    };

    const updateLighting = () => {
      if (dirty.current && containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${mouse.current.x}px`);
        containerRef.current.style.setProperty("--mouse-y", `${mouse.current.y}px`);
        dirty.current = false;
      }
      requestRef.current = requestAnimationFrame(updateLighting);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    requestRef.current = requestAnimationFrame(updateLighting);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [enableMouseLighting]);

  const contextValue = React.useMemo(() => ({ isTouch, mouseRef: mouse }), [isTouch]);

  return (
    <LightingContext.Provider value={contextValue}>
      <div 
        ref={containerRef} 
        className="min-h-screen w-full"
        style={{ "--mouse-x": "-1000px", "--mouse-y": "-1000px" } as React.CSSProperties}
      >
        {children}
      </div>
    </LightingContext.Provider>
  );
}
