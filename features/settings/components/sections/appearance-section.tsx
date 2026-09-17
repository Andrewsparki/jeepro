"use client";

import { Palette, LayoutGrid, Maximize2, Sparkles, Film } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";

const THEMES = [
  { id: "midnight", label: "Midnight", color: "#4F46E5" },
  { id: "amoled", label: "AMOLED", color: "#000000" },
  { id: "titanium", label: "Titanium", color: "#64748B" },
  { id: "light", label: "Daylight", color: "#4338CA" },
] as const;

export function AppearanceSection() {
  const { settings, updateSetting } = useSettings();

  return (
    <GlassSection
      id="appearance"
      title="Appearance & Viewports"
      icon={Palette}
      badge="Interface"
      description="Tailor your visual ambiance, navigation layouts, and study card presentations."
    >
      {/* Theme Selection Row */}
      <SettingRow
        title="Interface Theme"
        description="Choose a tuned aesthetic for contrast, daylight readability, and OLED efficiency."
        icon={Palette}
        iconGradient="from-fuchsia-500 to-pink-600"
      >
        <div className="flex items-center p-1 rounded-full bg-muted/60 border border-border/60 shadow-inner dark:bg-white/[0.06] dark:border-white/10">
          {THEMES.map(({ id, label, color }) => {
            const isSelected = settings.activeTheme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting("activeTheme", id);
                }}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors z-10 cursor-pointer select-none",
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeThemePill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-card border border-border/80 shadow-xs dark:bg-white/15 dark:border-white/20 -z-10 pointer-events-none"
                  />
                )}
                <span
                  className="w-2 h-2 rounded-full border border-border/60 dark:border-white/30"
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </SettingRow>

      {/* Study View Style Segmented Control */}
      <SettingRow
        title="Study View Layout"
        description="Choose how syllabus units and chapters are arranged on topic feeds."
        icon={LayoutGrid}
        iconGradient="from-blue-500 to-cyan-600"
      >
        <div className="flex items-center p-1 rounded-full bg-muted/60 border border-border/60 shadow-inner dark:bg-white/[0.06] dark:border-white/10">
          {[
            { id: "carousel", label: "Carousel" },
            { id: "grid", label: "Grid" },
          ].map(({ id, label }) => {
            const isSelected = settings.viewStyle === id;
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting("viewStyle", id as "carousel" | "grid");
                }}
                className={cn(
                  "relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors z-10 cursor-pointer select-none",
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeViewStylePill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-card border border-border/80 shadow-xs dark:bg-white/15 dark:border-white/20 -z-10 pointer-events-none"
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </SettingRow>

      {/* Detail View Presentation Segmented Control */}
      <SettingRow
        title="Detail View Presentation"
        description="Pick between an immersive full-screen page or a rapid modal sheet."
        icon={Maximize2}
        iconGradient="from-violet-500 to-purple-600"
      >
        <div className="flex items-center p-1 rounded-full bg-muted/60 border border-border/60 shadow-inner dark:bg-white/[0.06] dark:border-white/10">
          {[
            { id: "page", label: "Full Page" },
            { id: "modal", label: "Modal Sheet" },
          ].map(({ id, label }) => {
            const isSelected = settings.detailType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting("detailType", id as "page" | "modal");
                }}
                className={cn(
                  "relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors z-10 cursor-pointer select-none",
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeDetailTypePill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-card border border-border/80 shadow-xs dark:bg-white/15 dark:border-white/20 -z-10 pointer-events-none"
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </SettingRow>

      {/* Image Formula Anchors Toggle */}
      <SettingRow
        title="Formula Anchor Cards"
        description="Render high-yield equation sheets and memory anchors directly in previews."
        icon={Sparkles}
        iconGradient="from-amber-500 to-orange-500"
      >
        <PremiumSwitch
          checked={settings.useFormulas}
          onChange={(checked) => updateSetting("useFormulas", checked)}
          ariaLabel="Toggle formula anchors"
        />
      </SettingRow>

      {/* Solution Previews Toggle */}
      <SettingRow
        title="Interactive Video Previews"
        description="Stream step-by-step video solutions and animations upon hover."
        icon={Film}
        iconGradient="from-rose-500 to-red-600"
        isLast
      >
        <PremiumSwitch
          checked={settings.autoAudio}
          onChange={(checked) => updateSetting("autoAudio", checked)}
          ariaLabel="Toggle video solutions preview"
        />
      </SettingRow>
    </GlassSection>
  );
}
