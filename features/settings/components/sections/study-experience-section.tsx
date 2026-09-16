"use client";

import { BookOpen, Target, Sparkles, CloudCheck, Volume2, Coffee, Bell } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { useSettings } from "@/providers/settings-provider";

export function StudyExperienceSection() {
  const { settings, updateSetting } = useSettings();

  return (
    <GlassSection
      id="study"
      title="Study & Focus Experience"
      icon={BookOpen}
      badge="Productivity"
      description="Configure deep focus parameters, telemetry auto-saving, and ambient audio cues."
    >
      {/* Deep Focus Mode */}
      <SettingRow
        title="Deep Focus Mode"
        description="Automatically suppress sidebars and enter a zero-distraction workspace."
        icon={Target}
        iconGradient="from-indigo-500 to-blue-600"
      >
        <PremiumSwitch
          checked={settings.focusMode}
          onChange={(checked) => updateSetting("focusMode", checked)}
          ariaLabel="Toggle deep focus mode"
        />
      </SettingRow>

      {/* Ambient Visual Effects */}
      <SettingRow
        title="Spatial Ambient Glow"
        description="Render subtle background lighting reactive to problem difficulty."
        icon={Sparkles}
        iconGradient="from-cyan-500 to-teal-500"
      >
        <PremiumSwitch
          checked={settings.ambientEffects}
          onChange={(checked) => updateSetting("ambientEffects", checked)}
          ariaLabel="Toggle spatial ambient glow"
        />
      </SettingRow>

      {/* Telemetry Auto-Save */}
      <SettingRow
        title="Live Session Auto-Sync"
        description="Persist progress to local IndexedDB and cloud sync queue every 5 minutes."
        icon={CloudCheck}
        iconGradient="from-emerald-500 to-green-600"
      >
        <PremiumSwitch
          checked={settings.autoSave}
          onChange={(checked) => updateSetting("autoSave", checked)}
          ariaLabel="Toggle session auto-save"
        />
      </SettingRow>

      {/* Acoustic Feedback */}
      <SettingRow
        title="Acoustic Haptic Feedback"
        description="Play crisp Apple-style chimes upon solution milestone completions."
        icon={Volume2}
        iconGradient="from-amber-500 to-yellow-600"
      >
        <PremiumSwitch
          checked={settings.sounds}
          onChange={(checked) => updateSetting("sounds", checked)}
          ariaLabel="Toggle acoustic sounds"
        />
      </SettingRow>

      {/* System Notifications */}
      <SettingRow
        title="System Notifications"
        description="Show non-intrusive toast alerts when changing system settings."
        icon={Bell}
        iconGradient="from-violet-500 to-fuchsia-600"
      >
        <PremiumSwitch
          checked={settings.showNotifications}
          onChange={(checked) => updateSetting("showNotifications", checked)}
          ariaLabel="Toggle system notifications"
        />
      </SettingRow>

      {/* Interval Break Reminders */}
      <SettingRow
        title="Pomodoro Reset Reminders"
        description="Prompt a 5-minute visual reset after every 50 minutes of continuous focus."
        icon={Coffee}
        iconGradient="from-rose-500 to-pink-600"
        isLast
      >
        <PremiumSwitch
          checked={settings.breakReminder}
          onChange={(checked) => updateSetting("breakReminder", checked)}
          ariaLabel="Toggle break reminder"
        />
      </SettingRow>
    </GlassSection>
  );
}
