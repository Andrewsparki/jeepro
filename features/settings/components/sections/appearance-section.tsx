"use client";

import { Palette } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { usePerformance, PerformanceMode } from "@/lib/performance-context";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { mode, setMode } = usePerformance();

  const handleToggle = (feature: 'blur' | 'particles' | 'cursor', checked: boolean) => {
    // If they want to toggle something specific, we bump them up to a custom mode or 
    // for now we just change the global performance preset for simplicity as requested.
    if (checked) {
      setMode("premium");
    } else {
      setMode("balanced");
    }
  };

  return (
    <GlassSection id="appearance" title="Appearance" icon={Palette} description="Customize the visual fidelity and aesthetics.">
      
      <SettingRow 
        title="Performance Preset" 
        description="Globally adjust visual effects based on your device capabilities."
      >
        <div className="flex bg-surface border border-glass-border rounded-lg p-1">
          {(["premium", "balanced", "battery-saver"] as PerformanceMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                mode === m 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow 
        title="Dashboard Blur" 
        description="Enable heavy glassmorphism and backdrop blurs across the app."
      >
        <PremiumSwitch 
          checked={mode === "premium"} 
          onChange={(v) => handleToggle('blur', v)} 
        />
      </SettingRow>

      <SettingRow 
        title="Floating Particles" 
        description="Render dynamic background particles in the dashboard."
      >
        <PremiumSwitch 
          checked={mode === "premium"} 
          onChange={(v) => handleToggle('particles', v)} 
        />
      </SettingRow>

      <SettingRow 
        title="Interactive Cursor" 
        description="Show the glowing trail and interactive magnetic fields."
      >
        <PremiumSwitch 
          checked={mode !== "battery-saver"} 
          onChange={(v) => handleToggle('cursor', v)} 
        />
      </SettingRow>

      <SettingRow 
        title="Reduce Motion" 
        description="Disable spring animations and parallax for a static layout."
        isLast
      >
        <PremiumSwitch 
          checked={mode === "battery-saver"} 
          onChange={(v) => setMode(v ? "battery-saver" : "balanced")} 
        />
      </SettingRow>

    </GlassSection>
  );
}
