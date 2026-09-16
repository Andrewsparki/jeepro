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
  const mouse = useRef({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);
  const { enableMouseLighting } = usePerformance();

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (touch || isReducedMotion || !enableMouseLighting) {
      const t = setTimeout(() => setIsTouch(true), 0);
      return () => clearTimeout(t);
    }

    let cachedZoom = 1;
    const updateZoom = () => {
      const zoomStr = typeof window !== "undefined" ? window.getComputedStyle(document.documentElement).zoom : "";
      let zoom = 1;
      if (zoomStr) {
        const val = parseFloat(zoomStr);
        if (!isNaN(val)) {
          zoom = zoomStr.includes("%") ? val / 100 : (val > 2 ? val / 100 : val);
        }
      }
      cachedZoom = zoom;
    };

    updateZoom();
    window.addEventListener("resize", updateZoom, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX / cachedZoom, y: e.clientY / cachedZoom };
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", updateZoom);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [enableMouseLighting]);

  const contextValue = React.useMemo(() => ({ isTouch, mouseRef: mouse }), [isTouch]);

  return (
    <LightingContext.Provider value={contextValue}>
      <div className="min-h-screen w-full">
        {children}
      </div>
    </LightingContext.Provider>
  );
}
