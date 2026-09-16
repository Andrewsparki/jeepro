"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useSyncExternalStore } from "react";

export type PerformanceMode = "premium" | "balanced" | "battery-saver";

interface PerformanceContextType {
  mode: PerformanceMode;
  setMode: (mode: PerformanceMode) => void;
  // Derived flags from mode
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

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredModeSnapshot(): PerformanceMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as PerformanceMode | null;
    if (stored && ["premium", "balanced", "battery-saver"].includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return "premium";
}

function getStoredModeServerSnapshot(): PerformanceMode {
  return "premium";
}

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
  const storedMode = useSyncExternalStore(
    subscribeStorage,
    getStoredModeSnapshot,
    getStoredModeServerSnapshot
  );

  const [overriddenMode, setOverriddenMode] = useState<PerformanceMode | null>(null);

  const mode = overriddenMode ?? storedMode;

  const setMode = useCallback((newMode: PerformanceMode) => {
    setOverriddenMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const flags = useMemo(() => getFlags(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode,
      ...flags,
    }),
    [mode, setMode, flags]
  );

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    return {
      mode: "premium" as PerformanceMode,
      setMode: () => {},
      ...getFlags("premium"),
    };
  }
  return context;
}
