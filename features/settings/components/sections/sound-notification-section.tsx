"use client";

import { Volume2, Bell } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { useSettings } from "@/providers/settings-provider";

export function SoundNotificationSection() {
  const { settings, updateSetting, playSound } = useSettings();

  return (
    <div id="notifications" className="space-y-6">
      <GlassSection
        title="Acoustic Haptics & Alerts"
        icon={Volume2}
        badge="Audio"
        description="Fine-tune procedural interaction soundscapes and system notification toasts."
      >
        <SettingRow
          title="Acoustic Haptic Feedback"
          description="Synthesize procedural audio chimes for milestone unlocks, timer ticks, and interface navigation."
          icon={Volume2}
        >
          <PremiumSwitch
            checked={settings.sounds}
            onChange={(checked) => {
              updateSetting("sounds", checked);
              if (checked) {
                setTimeout(() => playSound("success"), 50);
              }
            }}
            ariaLabel="Toggle acoustic sounds"
          />
        </SettingRow>

        {settings.sounds && (
          <SettingRow
            title="Master Interaction Volume"
            description="Adjust master loudness for all synthesis engines and navigation haptics."
            icon={Volume2}
          >
            <div className="flex items-center gap-3 w-48 sm:w-56 select-none">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume ?? 0.8}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  updateSetting("soundVolume", vol);
                }}
                onMouseUp={() => playSound("soft-tap")}
                onTouchEnd={() => playSound("soft-tap")}
                className="w-full accent-[#78A9FF] cursor-pointer h-1.5 rounded-lg bg-[#171D28] border border-[#2B3342]"
                aria-label="Master Interaction Volume"
              />
              <span className="text-xs font-mono font-bold text-[#F5F7FB] w-9 text-right shrink-0">
                {Math.round((settings.soundVolume ?? 0.8) * 100)}%
              </span>
            </div>
          </SettingRow>
        )}

        <SettingRow
          title="System Toast Notifications"
          description="Display informative, non-intrusive status alerts when changing platform configurations."
          icon={Bell}
        >
          <PremiumSwitch
            checked={settings.showNotifications}
            onChange={(checked) => updateSetting("showNotifications", checked)}
            ariaLabel="Toggle system notifications"
          />
        </SettingRow>
      </GlassSection>
    </div>
  );
}
