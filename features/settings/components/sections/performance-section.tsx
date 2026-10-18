"use client";

import React from "react";
import {
  Zap,
  BatteryCharging,
  Gauge,
  Sparkles,
  Eye,
  Film,
  Activity,
  MousePointer,
  MonitorPlay,
  Sliders,
  Music,
  RotateCcw,
  Check,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import {
  usePerformance,
  PerformancePreset,
  PerformanceSettings,
} from "@/lib/performance-context";
import { cn } from "@/lib/utils";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface PresetOption {
  id: Exclude<PerformancePreset, "custom">;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

const PRESETS: PresetOption[] = [
  {
    id: "battery-saver",
    label: "Battery Saver / Low-End",
    badge: "Max FPS",
    description: "Disables expensive decorative effects, blur, and canvas loops for budget PCs and low battery.",
    icon: BatteryCharging,
  },
  {
    id: "balanced",
    label: "Balanced",
    badge: "Recommended",
    description: "Preserves UI motion and dashboard charts while trimming heavy blurs and background particles.",
    icon: Gauge,
  },
  {
    id: "full",
    label: "Full Experience",
    badge: "High Fidelity",
    description: "Enables the full visual experience with obsidian glassmorphism, floating particles, and glows.",
    icon: Sparkles,
  },
];

export function PerformanceSection() {
  const {
    preset,
    particles,
    ambientLighting,
    pageTransitions,
    animatedStats,
    smoothScroll,
    heavyBlur,
    microInteractions,
    loadingScreenAnimations,
    concertVisualComplexity,
    isReducedMotion,
    setPreset,
    updateSetting,
    resetToPreset,
  } = usePerformance();

  const handleSelectPreset = (p: Exclude<PerformancePreset, "custom">) => {
    dispatchInteractionSound("ui.tab");
    setPreset(p);
  };

  const handleToggle = (key: keyof PerformanceSettings, value: boolean) => {
    dispatchInteractionSound(value ? "ui.toggleOn" : "ui.toggleOff");
    updateSetting(key, value);
  };

  return (
    <div id="performance" className="space-y-6">
      {/* ── 1. Presets Header & Card Selection ────────────────────────────── */}
      <GlassSection
        title="Performance Presets"
        icon={Zap}
        badge="Graphics Profile"
        description="Quickly calibrate visual fidelity and hardware acceleration according to your device's GPU and battery."
        headerAction={
          preset === "custom" ? (
            <button
              type="button"
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                resetToPreset("balanced");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#1A2232] text-[#78A9FF] border border-[#78A9FF]/30 hover:bg-[#78A9FF]/10 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Balanced</span>
            </button>
          ) : undefined
        }
      >
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = preset === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={cn(
                  "relative flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] group",
                  isSelected
                    ? "bg-[#172030] border-[#78A9FF]/60 shadow-[0_0_20px_rgba(120,169,255,0.15)] ring-1 ring-[#78A9FF]/30"
                    : "bg-[#141923]/60 border-[#2B3342]/80 hover:bg-[#161D2B] hover:border-[#2B3342]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isSelected
                          ? "bg-[#78A9FF]/20 border-[#78A9FF]/40 text-[#78A9FF]"
                          : "bg-[#171D28] border-[#2B3342] text-[#A4ADBB] group-hover:text-[#F5F7FB]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        isSelected
                          ? "bg-[#78A9FF]/15 text-[#78A9FF] border-[#78A9FF]/30 font-bold"
                          : "bg-[#121722] text-[#A4ADBB]/80 border-[#2B3342]/60"
                      )}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#F5F7FB] flex items-center gap-1.5">
                    {p.label}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#78A9FF] stroke-[3]" />
                    )}
                  </h4>

                  <p className="text-xs text-[#A4ADBB] mt-1.5 leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2B3342]/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#A4ADBB]/70">
                    {isSelected ? "Active Preset" : "Click to apply"}
                  </span>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected
                        ? "bg-[#78A9FF] shadow-[0_0_8px_#78A9FF]"
                        : "bg-[#2B3342]"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {preset === "custom" && (
          <div className="mx-4 sm:mx-6 mb-5 px-3.5 py-2.5 rounded-xl bg-[#171D28] border border-[#78A9FF]/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#78A9FF]">
              <Sliders className="w-4 h-4 shrink-0" />
              <span className="font-medium text-[#F5F7FB]">
                Custom Configuration active. Individual overrides applied below.
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A4ADBB]">User Custom</span>
          </div>
        )}
      </GlassSection>

      {/* ── 2. Graphics & Heavy Rendering ─────────────────────────────────── */}
      <GlassSection
        title="Graphics & Heavy Rendering"
        icon={Layers}
        badge="GPU"
        description="Fine-tune graphics shaders, canvas particle loops, and backdrop filters."
      >
        <SettingRow
          title="Global Floating Particles"
          description="Render real-time floating particle field on canvas. Turning off completely stops background animation frames."
          icon={Sparkles}
        >
          <PremiumSwitch
            checked={particles}
            onChange={(checked) => handleToggle("particles", checked)}
            ariaLabel="Toggle global floating particles"
          />
        </SettingRow>

        <SettingRow
          title="Ambient Lighting & Glow"
          description="Diffuse radial specular glows and atmospheric backdrop illumination across dashboards and problem sets."
          icon={Eye}
        >
          <PremiumSwitch
            checked={ambientLighting}
            onChange={(checked) => handleToggle("ambientLighting", checked)}
            ariaLabel="Toggle ambient lighting and glow"
          />
        </SettingRow>

        <SettingRow
          title="Heavy Blur & Specular Shadows"
          description="Real-time CSS backdrop filters and multi-pass glass shadows. Disabling significantly accelerates low-end integrated GPUs."
          icon={Layers}
        >
          <PremiumSwitch
            checked={heavyBlur}
            onChange={(checked) => handleToggle("heavyBlur", checked)}
            ariaLabel="Toggle heavy blur and specular shadows"
          />
        </SettingRow>
      </GlassSection>

      {/* ── 3. Motion & Transitions ───────────────────────────────────────── */}
      <GlassSection
        title="Motion & Transitions"
        icon={Film}
        badge="Animations"
        description="Controls layout reveals, spring mathematics, and component transition states."
      >
        <SettingRow
          title="Page Entrance Animations"
          description="Staggered entrance sequences, coordinate reveals, and scroll-triggered motion when loading routes."
          icon={Film}
        >
          <PremiumSwitch
            checked={pageTransitions}
            onChange={(checked) => handleToggle("pageTransitions", checked)}
            ariaLabel="Toggle page entrance animations"
          />
        </SettingRow>

        <SettingRow
          title="Animated Statistics & Charts"
          description="Real-time number spring counting, weekly progress interpolation, and progressive SVG graph drawing."
          icon={Activity}
        >
          <PremiumSwitch
            checked={animatedStats}
            onChange={(checked) => handleToggle("animatedStats", checked)}
            ariaLabel="Toggle animated statistics and charts"
          />
        </SettingRow>

        <SettingRow
          title="Micro-Interactions & Hover Dynamics"
          description="Card hover lift transforms, tactile button physics, and magnetic cursor attraction."
          icon={MousePointer}
        >
          <PremiumSwitch
            checked={microInteractions}
            onChange={(checked) => handleToggle("microInteractions", checked)}
            ariaLabel="Toggle micro-interactions and hover dynamics"
          />
        </SettingRow>

        <SettingRow
          title="Animated Loading Screen"
          description="Animated SVG logo paths and breathing pulses during initial workspace boot."
          icon={MonitorPlay}
        >
          <PremiumSwitch
            checked={loadingScreenAnimations}
            onChange={(checked) => handleToggle("loadingScreenAnimations", checked)}
            ariaLabel="Toggle animated loading screen"
          />
        </SettingRow>
      </GlassSection>

      {/* ── 4. Scrolling & Complex Media ──────────────────────────────────── */}
      <GlassSection
        title="Scrolling & Complex Audio/Visual"
        icon={Sliders}
        badge="Engine"
        description="Configure hardware-accelerated scroll engines and Concert Mode audio visualizer load."
      >
        <SettingRow
          title="Smooth-Scroll Enhancements"
          description="Locomotive & Lenis momentum scrolling with inertia damping. Reverts immediately to reliable native browser scrolling when disabled."
          icon={Sliders}
        >
          <PremiumSwitch
            checked={smoothScroll}
            onChange={(checked) => handleToggle("smoothScroll", checked)}
            ariaLabel="Toggle smooth-scroll enhancements"
          />
        </SettingRow>

        <SettingRow
          title="Concert Mode Visual Complexity"
          description="High-density audio FFT visualizer particles, 3D rotating stage light sweeps, and real-time spectrum smoothing."
          icon={Music}
        >
          <PremiumSwitch
            checked={concertVisualComplexity}
            onChange={(checked) => handleToggle("concertVisualComplexity", checked)}
            ariaLabel="Toggle Concert Mode visual complexity"
          />
        </SettingRow>
      </GlassSection>

      {/* ── 5. System Accessibility & Status ──────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#121722]/80 border border-[#2B3342]/70 flex items-start gap-3.5 text-xs text-[#A4ADBB]">
        <ShieldCheck className="w-5 h-5 text-[#78A9FF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#F5F7FB]">
            Accessibility & Status Guarantees
          </p>
          <p className="leading-relaxed">
            Essential status feedback, high-contrast focus rings, functional navigation transitions, and timer indicators remain fully functional regardless of the active preset.
            {isReducedMotion && (
              <span className="block mt-1 text-[#78A9FF] font-medium">
                System `prefers-reduced-motion` is active on your device and nonessential movement is automatically minimized.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
