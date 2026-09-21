"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { playHapticSound, SoundType } from "@/lib/sound-effects";
import { dispatchInteractionSound, SemanticSoundEvent } from "@/lib/sound-engine";

export interface UserSettings {
  // Study & Focus Experience
  focusMode: boolean;
  ambientEffects: boolean;
  autoSave: boolean;
  sounds: boolean;
  soundVolume: number;
  breakReminder: boolean;

  // Appearance & Viewports
  activeTheme: "midnight" | "amoled" | "titanium" | "light";
  viewStyle: "carousel" | "grid";
  detailType: "page" | "modal";
  useFormulas: boolean;
  autoAudio: boolean;
  showNotifications: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  focusMode: true,
  ambientEffects: false,
  autoSave: true,
  sounds: true,
  soundVolume: 0.8,
  breakReminder: true,
  activeTheme: "midnight",
  viewStyle: "carousel",
  detailType: "page",
  useFormulas: true,
  autoAudio: true,
  showNotifications: true,
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
  viewStyle: "Study View Layout",
  detailType: "Detail View Presentation",
  useFormulas: "Formula Anchor Cards",
  autoAudio: "Interactive Video Previews",
  showNotifications: "System Notifications",
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  // Load from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // Use defaults if storage read fails
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const playSound = useCallback((type: SoundType = "click") => {
    playHapticSound(type, settings.sounds, settings.soundVolume);
  }, [settings.sounds, settings.soundVolume]);

  const playInteractionSound = useCallback((event: SemanticSoundEvent) => {
    dispatchInteractionSound(event, settings.sounds);
  }, [settings.sounds]);

  const updateSetting = <K extends keyof UserSettings>(
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
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setTheme(DEFAULT_SETTINGS.activeTheme);
    playSound("danger");
    toast.success("Settings restored to defaults");
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: mounted ? settings : DEFAULT_SETTINGS,
        updateSetting,
        resetSettings,
        playSound,
        playInteractionSound,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
