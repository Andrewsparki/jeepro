"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useSyncExternalStore,
} from "react";

export type PerformancePreset = "battery-saver" | "balanced" | "full" | "custom";
export type PerformanceMode = "premium" | "balanced" | "battery-saver";

export interface PerformanceSettings {
  particles: boolean;
  ambientLighting: boolean;
  pageTransitions: boolean;
  animatedStats: boolean;
  smoothScroll: boolean;
  heavyBlur: boolean;
  microInteractions: boolean;
  loadingScreenAnimations: boolean;
  concertVisualComplexity: boolean;
}

export const PRESET_CONFIGS: Record<Exclude<PerformancePreset, "custom">, PerformanceSettings> = {
  "battery-saver": {
    particles: false,
    ambientLighting: false,
    pageTransitions: false,
    animatedStats: false,
    smoothScroll: false,
    heavyBlur: false,
    microInteractions: false,
    loadingScreenAnimations: false,
    concertVisualComplexity: false,
  },
  balanced: {
    particles: false,
    ambientLighting: true,
    pageTransitions: true,
    animatedStats: true,
    smoothScroll: true,
    heavyBlur: false,
    microInteractions: true,
    loadingScreenAnimations: true,
    concertVisualComplexity: false,
  },
  full: {
    particles: true,
    ambientLighting: true,
    pageTransitions: true,
    animatedStats: true,
    smoothScroll: true,
    heavyBlur: true,
    microInteractions: true,
    loadingScreenAnimations: true,
    concertVisualComplexity: true,
  },
};

export function computePresetFromSettings(settings: PerformanceSettings): PerformancePreset {
  for (const preset of ["battery-saver", "balanced", "full"] as const) {
    const config = PRESET_CONFIGS[preset];
    const isMatch = (Object.keys(config) as (keyof PerformanceSettings)[]).every(
      (key) => config[key] === settings[key]
    );
    if (isMatch) return preset;
  }
  return "custom";
}

interface PerformanceContextType extends PerformanceSettings {
  preset: PerformancePreset;
  mode: PerformanceMode;
  isReducedMotion: boolean;
  setPreset: (preset: Exclude<PerformancePreset, "custom">) => void;
  setMode: (mode: PerformanceMode) => void;
  updateSetting: <K extends keyof PerformanceSettings>(key: K, value: boolean) => void;
  resetToPreset: (preset: Exclude<PerformancePreset, "custom">) => void;

  // Backwards compatible flags
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

const SETTINGS_STORAGE_KEY = "jee-pro-performance-settings";
const LEGACY_MODE_STORAGE_KEY = "jee-pro-performance-mode";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const [settings, setSettings] = useState<PerformanceSettings>(PRESET_CONFIGS.full);

  // Load stored settings after hydration to ensure server and client markup match
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
          return;
        }
        const legacyMode = localStorage.getItem(LEGACY_MODE_STORAGE_KEY);
        if (legacyMode === "battery-saver") {
          setSettings(PRESET_CONFIGS["battery-saver"]);
        } else if (legacyMode === "balanced") {
          setSettings(PRESET_CONFIGS.balanced);
        }
      } catch {
        // Storage unavailable
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const preset = useMemo(() => computePresetFromSettings(settings), [settings]);

  const mode: PerformanceMode = useMemo(() => {
    if (preset === "battery-saver") return "battery-saver";
    if (preset === "balanced") return "balanced";
    return "premium";
  }, [preset]);

  const persistSettings = useCallback((newSettings: PerformanceSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      const computed = computePresetFromSettings(newSettings);
      const legMode = computed === "battery-saver" ? "battery-saver" : computed === "balanced" ? "balanced" : "premium";
      localStorage.setItem(LEGACY_MODE_STORAGE_KEY, legMode);
    } catch {
      // Storage unavailable
    }
  }, []);

  const setPreset = useCallback((newPreset: Exclude<PerformancePreset, "custom">) => {
    const newSettings = { ...PRESET_CONFIGS[newPreset] };
    setSettings(newSettings);
    persistSettings(newSettings);
  }, [persistSettings]);

  const setMode = useCallback((newMode: PerformanceMode) => {
    const targetPreset = newMode === "premium" ? "full" : newMode;
    setPreset(targetPreset);
  }, [setPreset]);

  const updateSetting = useCallback(<K extends keyof PerformanceSettings>(key: K, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  const resetToPreset = useCallback((newPreset: Exclude<PerformancePreset, "custom">) => {
    setPreset(newPreset);
  }, [setPreset]);

  // Apply DOM attributes directly to <html> for instant CSS rule changes (no layout shift, 0 reloads)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.performancePreset = preset;
    root.dataset.disableBlur = String(!settings.heavyBlur);
    root.dataset.disableShadows = String(!settings.heavyBlur);
    root.dataset.disableHover = String(!settings.microInteractions);
    root.dataset.disableParticles = String(!settings.particles);
  }, [preset, settings]);

  const contextValue = useMemo<PerformanceContextType>(
    () => ({
      ...settings,
      preset,
      mode,
      isReducedMotion,
      setPreset,
      setMode,
      updateSetting,
      resetToPreset,

      // Backwards compatible flags
      enableBlur: settings.heavyBlur,
      enableParticles: settings.particles && !isReducedMotion,
      particleCount: settings.particles && !isReducedMotion ? 18 : 0,
      enableBackgroundAnimation: settings.ambientLighting,
      enableSmoothScroll: settings.smoothScroll && !isReducedMotion,
      enableMagnetic: settings.microInteractions && !isReducedMotion,
      enableTilt: settings.microInteractions && !isReducedMotion,
      enableMouseLighting: settings.ambientLighting,
      enableTabSlide: settings.pageTransitions && !isReducedMotion,
      enableEntryAnimations: settings.pageTransitions && !isReducedMotion,
    }),
    [settings, preset, mode, isReducedMotion, setPreset, setMode, updateSetting, resetToPreset]
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
    const fallbackSettings = PRESET_CONFIGS.full;
    return {
      ...fallbackSettings,
      preset: "full" as PerformancePreset,
      mode: "premium" as PerformanceMode,
      isReducedMotion: false,
      setPreset: () => {},
      setMode: () => {},
      updateSetting: () => {},
      resetToPreset: () => {},
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
  }
  return context;
}
