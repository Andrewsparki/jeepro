"use client";

import { useState } from "react";
import { BookOpen, Target, Sparkles, CloudCheck, Volume2, Coffee } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";

export function StudyExperienceSection() {
  const [focusMode, setFocusMode] = useState(true);
  const [ambientEffects, setAmbientEffects] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [breakReminder, setBreakReminder] = useState(true);

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
          checked={focusMode}
          onChange={setFocusMode}
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
          checked={ambientEffects}
          onChange={setAmbientEffects}
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
          checked={autoSave}
          onChange={setAutoSave}
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
          checked={sounds}
          onChange={setSounds}
          ariaLabel="Toggle acoustic sounds"
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
          checked={breakReminder}
          onChange={setBreakReminder}
          ariaLabel="Toggle break reminder"
        />
      </SettingRow>
    </GlassSection>
  );
}
