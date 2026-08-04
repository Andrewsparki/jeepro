"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type PerformanceMode = "premium" | "balanced" | "battery-saver";

interface PerformanceContextType {
  mode: PerformanceMode;
  setMode: (mode: PerformanceMode) => void;
  // Convenience flags derived from mode
  enableBlur: boolean;
  enableParticles: boolean;
  particleCount: number;
  enableBackgroundAnimation: boolean;
  enableSmoothScroll: boolean;
  enableMagnetic: boolean;
  enableTilt: boolean;
  enableMouseLighting: boolean;
  enableTabSlide: boolean;
  enableEntryAnimations: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

const STORAGE_KEY = "jee-pro-performance-mode";

function getFlags(mode: PerformanceMode) {
  switch (mode) {
    case "premium":
      return {
        enableBlur: true,
        enableParticles: true,
        particleCount: 18,
        enableBackgroundAnimation: true,
        enableSmoothScroll: true,
        enableMagnetic: true,
        enableTilt: true,
        enableMouseLighting: true,
        enableTabSlide: true,
        enableEntryAnimations: true,
      };
    case "balanced":
      return {
        enableBlur: false,
        enableParticles: true,
        particleCount: 8,
        enableBackgroundAnimation: true,
        enableSmoothScroll: true,
        enableMagnetic: false,
        enableTilt: false,
        enableMouseLighting: true,
        enableTabSlide: true,
        enableEntryAnimations: true,
      };
    case "battery-saver":
      return {
        enableBlur: false,
        enableParticles: false,
        particleCount: 0,
        enableBackgroundAnimation: false,
        enableSmoothScroll: false,
        enableMagnetic: false,
        enableTilt: false,
        enableMouseLighting: false,
        enableTabSlide: false,
        enableEntryAnimations: false,
      };
  }
}

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PerformanceMode>("premium");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PerformanceMode | null;
      if (stored && ["premium", "balanced", "battery-saver"].includes(stored)) {
        // eslint-disable-next-line
        setModeState(stored);
      }
    } catch {
      // localStorage not available
    }
    setHydrated(true);
  }, []);

  const setMode = useCallback((newMode: PerformanceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // localStorage not available
    }
  }, []);

  const flags = getFlags(mode);

  const contextValue = React.useMemo(() => ({
    mode,
    setMode,
    ...flags
  }), [mode, setMode, flags]);

  // Don't render children until hydrated to avoid flash of wrong mode
  if (!hydrated) {
    return <>{children}</>;
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    // Return premium defaults if used outside provider (e.g., during SSR)
    return {
      mode: "premium" as PerformanceMode,
      setMode: () => {},
      ...getFlags("premium"),
    };
  }
  return context;
}
