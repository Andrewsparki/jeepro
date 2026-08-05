"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";

export function StudyExperienceSection() {
  const [focusMode, setFocusMode] = useState(true);
  const [ambientEffects, setAmbientEffects] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [breakReminder, setBreakReminder] = useState(true);

  return (
    <GlassSection id="study" title="Study Experience" icon={BookOpen} description="Configure your workspace and focus tools.">
      
      <SettingRow 
        title="Focus Mode" 
        description="Hide all distractions and full-screen the workspace automatically."
      >
        <PremiumSwitch checked={focusMode} onChange={setFocusMode} />
      </SettingRow>

      <SettingRow 
        title="Ambient Effects" 
        description="Subtle background animations during active study sessions."
      >
        <PremiumSwitch checked={ambientEffects} onChange={setAmbientEffects} />
      </SettingRow>

      <SettingRow 
        title="Session Auto-Save" 
        description="Automatically save progress to the offline queue every 5 minutes."
      >
        <PremiumSwitch checked={autoSave} onChange={setAutoSave} />
      </SettingRow>

      <SettingRow 
        title="Notification Sounds" 
        description="Play a subtle premium chime on session completion."
      >
        <PremiumSwitch checked={sounds} onChange={setSounds} />
      </SettingRow>

      <SettingRow 
        title="Break Reminder" 
        description="Suggest a 5-minute break every 50 minutes of continuous focus."
        isLast
      >
        <PremiumSwitch checked={breakReminder} onChange={setBreakReminder} />
      </SettingRow>

    </GlassSection>
  );
}
