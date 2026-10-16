"use client";

import React, { createContext, useContext, useRef, useState } from "react";

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

function getIsTouchOrReducedMotion() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function LightingProvider({ children }: { children: React.ReactNode }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [isTouch] = useState(getIsTouchOrReducedMotion);

  const contextValue = React.useMemo(() => ({ isTouch, mouseRef: mouse }), [isTouch]);


  return (
    <LightingContext.Provider value={contextValue}>
      <div className="min-h-screen w-full">
        {children}
      </div>
    </LightingContext.Provider>
  );
}
