"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { playHapticSound, SoundType } from "@/lib/sound-effects";
import { dispatchInteractionSound, SemanticSoundEvent } from "@/lib/sound-engine";

import { VisualThemeId, DEFAULT_THEME, THEME_IDS } from "@/types/theme";

export interface UserSettings {
  // Study & Focus Experience
  focusMode: boolean;
  ambientEffects: boolean;
  autoSave: boolean;
  sounds: boolean;
  soundVolume: number;
  breakReminder: boolean;

  // Appearance & Viewports
  activeTheme: VisualThemeId;
  ambientParticles: boolean;
  viewStyle: "carousel" | "grid";
  detailType: "page" | "modal";
  useFormulas: boolean;
  autoAudio: boolean;
  showNotifications: boolean;

  // Goals & Targets
  weeklyGoalHours: number;
  isCustomWeeklyGoal: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  focusMode: true,
  ambientEffects: false,
  autoSave: true,
  sounds: true,
  soundVolume: 0.8,
  breakReminder: true,
  activeTheme: DEFAULT_THEME,
  ambientParticles: true,
  viewStyle: "carousel",
  detailType: "page",
  useFormulas: true,
  autoAudio: true,
  showNotifications: true,
  weeklyGoalHours: 20,
  isCustomWeeklyGoal: false,
};

const SETTINGS_STORAGE_KEY = "jee-pro-user-settings";

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
  playSound: (type?: SoundType) => void;
  playInteractionSound: (event: SemanticSoundEvent) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  resetSettings: () => {},
  playSound: () => {},
  playInteractionSound: () => {},
});

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

const SETTING_LABELS: Record<keyof UserSettings, string> = {
  focusMode: "Deep Focus Mode",
  ambientEffects: "Spatial Ambient Glow",
  autoSave: "Live Session Auto-Sync",
  sounds: "Acoustic Haptic Feedback",
  soundVolume: "Master Interaction Volume",
  breakReminder: "Pomodoro Reset Reminders",
  activeTheme: "Interface Theme",
  ambientParticles: "Ambient Particles",
  viewStyle: "Study View Layout",
  detailType: "Detail View Presentation",
  useFormulas: "Formula Anchor Cards",
  autoAudio: "Interactive Video Previews",
  showNotifications: "System Notifications",
  weeklyGoalHours: "Weekly Study Target",
  isCustomWeeklyGoal: "Custom Weekly Target",
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Load from localStorage on mount & synchronize theme
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.activeTheme) {
            if (parsed.activeTheme === "amoled") parsed.activeTheme = "obsidian";
            else if (parsed.activeTheme === "titanium") parsed.activeTheme = "minimal-wave";
            else if (parsed.activeTheme === "light") parsed.activeTheme = "obsidian";
            else if (!THEME_IDS.includes(parsed.activeTheme)) {
              parsed.activeTheme = DEFAULT_THEME;
            }
            setTheme(parsed.activeTheme);
          }
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // Use defaults if storage read fails
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [setTheme]);

  // Keep settings.activeTheme in sync if theme is switched externally
  useEffect(() => {
    if (theme && THEME_IDS.includes(theme as VisualThemeId)) {
      setSettings((prev) => (prev.activeTheme === theme ? prev : { ...prev, activeTheme: theme as VisualThemeId }));
    }
  }, [theme]);

  const playSound = useCallback((type: SoundType = "click") => {
    playHapticSound(type, settings.sounds, settings.soundVolume);
  }, [settings.sounds, settings.soundVolume]);

  const playInteractionSound = useCallback((event: SemanticSoundEvent) => {
    dispatchInteractionSound(event, settings.sounds);
  }, [settings.sounds]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage write fail gracefully
      }
      return next;
    });

    // Theme sync
    if (key === "activeTheme") {
      setTheme(value as string);
    }

    // Acoustic chime feedback
    const effectiveSounds = key === "sounds" ? (value as boolean) : settings.sounds;
    if (typeof value === "boolean") {
      playHapticSound(value ? (key === "sounds" ? "notification" : "toggleOn") : "toggleOff", effectiveSounds);
    } else {
      playHapticSound("click", effectiveSounds);
    }

    // Friendly feedback toast
    if (settings.showNotifications) {
      const label = SETTING_LABELS[key] || key;
      if (typeof value === "boolean") {
        toast.success(`${label} ${value ? "enabled" : "disabled"}`);
      } else {
        toast.info(`${label} set to ${String(value)}`);
      }
    }
  }, [setTheme, settings.sounds, settings.showNotifications]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setTheme(DEFAULT_SETTINGS.activeTheme);
    playSound("danger");
    toast.success("Settings restored to defaults");
  }, [setTheme, playSound]);

  const contextValue = React.useMemo(
    () => ({
      settings: mounted ? settings : DEFAULT_SETTINGS,
      updateSetting,
      resetSettings,
      playSound,
      playInteractionSound,
    }),
    [mounted, settings, updateSetting, resetSettings, playSound, playInteractionSound]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
