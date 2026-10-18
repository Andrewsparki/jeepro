"use client";

import { Palette, LayoutGrid, Maximize2, Sparkles, Film, Eye } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { SegmentedControl } from "../ui/segmented-control";
import { useSettings } from "@/providers/settings-provider";

import { VisualThemeId, VISUAL_THEMES } from "@/types/theme";

const THEMES = [
  { id: "obsidian", label: "Obsidian Blue", color: VISUAL_THEMES.obsidian.primaryAccent },
  { id: "cyberpunk", label: "Cyberpunk", color: VISUAL_THEMES.cyberpunk.primaryAccent },
  { id: "midnight", label: "Midnight", color: VISUAL_THEMES.midnight.primaryAccent },
  { id: "neon-arena", label: "Neon Arena", color: VISUAL_THEMES["neon-arena"].primaryAccent },
  { id: "minimal-wave", label: "Minimal Wave", color: VISUAL_THEMES["minimal-wave"].primaryAccent },
] as const;

const VIEW_STYLES = [
  { id: "carousel", label: "Carousel" },
  { id: "grid", label: "Grid" },
] as const;

const DETAIL_TYPES = [
  { id: "page", label: "Full Page" },
  { id: "modal", label: "Modal Sheet" },
] as const;

export function AppearanceSection() {
  const { settings, updateSetting } = useSettings();

  return (
    <div id="appearance" className="space-y-6">
      {/* ── 1. Color Theme & Display Palette ──────────────────────────────── */}
      <GlassSection
        title="Interface Theme"
        icon={Palette}
        badge="Display"
        description="Choose a high-contrast palette calibrated for eye strain reduction during long problem sets."
      >
        <SettingRow
          title="Active Theme"
          description="Adjust surface dark levels, text contrast, and chromatic saturation."
          icon={Palette}
        >
          <SegmentedControl
            value={settings.activeTheme}
            onChange={(id) => updateSetting("activeTheme", id)}
            options={THEMES}
            layoutId="activeThemePill"
          />
        </SettingRow>

        <SettingRow
          title="Spatial Ambient Glow"
          description="Render subtle background lighting and atmospheric specular reflections."
          icon={Eye}
        >
          <PremiumSwitch
            checked={settings.ambientEffects}
            onChange={(checked) => updateSetting("ambientEffects", checked)}
            ariaLabel="Toggle spatial ambient glow"
          />
        </SettingRow>

        <SettingRow
          title="Ambient Particles"
          description="Display drifting micro-particles softly glowing in Obsidian + Electric Blue across the canvas."
          icon={Sparkles}
        >
          <PremiumSwitch
            checked={settings.ambientParticles}
            onChange={(checked) => updateSetting("ambientParticles", checked)}
            ariaLabel="Toggle ambient particles"
          />
        </SettingRow>
      </GlassSection>

      {/* ── 2. Study Viewports & Content Layout ────────────────────────────── */}
      <GlassSection
        title="Study Workspace Layout"
        icon={LayoutGrid}
        badge="Workspace"
        description="Configure how formulas, chapters, and problem explanations are presented."
      >
        <SettingRow
          title="Topic Feed Layout"
          description="Choose how chapters and syllabus checkpoints are displayed."
          icon={LayoutGrid}
        >
          <SegmentedControl
            value={settings.viewStyle}
            onChange={(id) => updateSetting("viewStyle", id)}
            options={VIEW_STYLES}
            layoutId="activeViewStylePill"
          />
        </SettingRow>

        <SettingRow
          title="Detail View Presentation"
          description="Select between an immersive full-screen study page or a rapid modal sheet."
          icon={Maximize2}
        >
          <SegmentedControl
            value={settings.detailType}
            onChange={(id) => updateSetting("detailType", id)}
            options={DETAIL_TYPES}
            layoutId="activeDetailTypePill"
          />
        </SettingRow>

        <SettingRow
          title="Formula Anchor Cards"
          description="Render quick high-yield equation sheets and memory anchors directly in chapter overviews."
          icon={Sparkles}
        >
          <PremiumSwitch
            checked={settings.useFormulas}
            onChange={(checked) => updateSetting("useFormulas", checked)}
            ariaLabel="Toggle formula anchors"
          />
        </SettingRow>

        <SettingRow
          title="Interactive Video Previews"
          description="Auto-preview animated derivations and video solutions upon hovering problem cards."
          icon={Film}
        >
          <PremiumSwitch
            checked={settings.autoAudio}
            onChange={(checked) => updateSetting("autoAudio", checked)}
            ariaLabel="Toggle video solutions preview"
          />
        </SettingRow>
      </GlassSection>
    </div>
  );
}
