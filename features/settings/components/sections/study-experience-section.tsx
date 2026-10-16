"use client";

import { BookOpen, Target, CloudCheck, Coffee } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { useSettings } from "@/providers/settings-provider";

export function StudyExperienceSection() {
  const { settings, updateSetting } = useSettings();

  return (
    <div id="study" className="space-y-6">
      <GlassSection
        title="Study & Deep Work Engine"
        icon={BookOpen}
        badge="Focus"
        description="Configure distraction suppression, telemetry synchronization, and interval reminders."
      >
        <SettingRow
          title="Deep Focus Mode"
          description="Automatically collapse navigation bars and eliminate interface clutter when entering focus chambers."
          icon={Target}
        >
          <PremiumSwitch
            checked={settings.focusMode}
            onChange={(checked) => updateSetting("focusMode", checked)}
            ariaLabel="Toggle deep focus mode"
          />
        </SettingRow>

        <SettingRow
          title="Continuous Session Auto-Sync"
          description="Automatically synchronize active solve timers, completed checklist steps, and telemetry to cloud storage every 5 minutes."
          icon={CloudCheck}
        >
          <PremiumSwitch
            checked={settings.autoSave}
            onChange={(checked) => updateSetting("autoSave", checked)}
            ariaLabel="Toggle session auto-save"
          />
        </SettingRow>

        <SettingRow
          title="Pomodoro Reset Intervals"
          description="Display a gentle 5-minute cognitive rest prompt after every 50 minutes of continuous focus."
          icon={Coffee}
        >
          <PremiumSwitch
            checked={settings.breakReminder}
            onChange={(checked) => updateSetting("breakReminder", checked)}
            ariaLabel="Toggle break reminder"
          />
        </SettingRow>
      </GlassSection>
    </div>
  );
}
