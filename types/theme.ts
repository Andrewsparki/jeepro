"use client";

export type VisualThemeId = "obsidian" | "cyberpunk" | "midnight" | "neon-arena" | "minimal-wave";
export type ThemeId = VisualThemeId;

export const THEME_IDS: readonly VisualThemeId[] = [
  "obsidian",
  "cyberpunk",
  "midnight",
  "neon-arena",
  "minimal-wave",
] as const;

export const DEFAULT_THEME: VisualThemeId = "obsidian";

export interface ThemeConfig {
  id: VisualThemeId;
  name: string;
  tagline: string;
  bgBase: string; // solid bg
  primaryAccent: string; // hex
  secondaryAccent: string; // hex
  highlightColor: string; // hex / rgba
  beamColor1: string;
  beamColor2: string;
  floorGlow: string;
  gridColor: string;
  vibe: "electric" | "neon" | "deep" | "magenta" | "minimal";
}

export const VISUAL_THEMES: Record<VisualThemeId, ThemeConfig> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian Blue",
    tagline: "JEE Pro Signature // Electric Sapphire",
    bgBase: "#0B0D12",
    primaryAccent: "#78A9FF",
    secondaryAccent: "#4F80E2",
    highlightColor: "rgba(235, 245, 255, 0.98)",
    beamColor1: "rgba(120, 169, 255, 0.8)",
    beamColor2: "rgba(79, 128, 226, 0.6)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(120, 169, 255, 0.35) 0%, rgba(18, 23, 34, 0.8) 60%, transparent 100%)",
    gridColor: "#78A9FF",
    vibe: "electric",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    tagline: "High Voltage // Neon Pink & Acid Cyan",
    bgBase: "#090514",
    primaryAccent: "#FF2A85",
    secondaryAccent: "#00F0FF",
    highlightColor: "rgba(255, 255, 255, 0.98)",
    beamColor1: "rgba(255, 42, 133, 0.85)",
    beamColor2: "rgba(0, 240, 255, 0.75)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(255, 42, 133, 0.4) 0%, rgba(0, 240, 255, 0.25) 45%, transparent 100%)",
    gridColor: "#FF2A85",
    vibe: "magenta",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    tagline: "Deep Space // Ultraviolet & Indigo Mist",
    bgBase: "#05070D",
    primaryAccent: "#9D7BFF",
    secondaryAccent: "#5856D6",
    highlightColor: "rgba(230, 220, 255, 0.98)",
    beamColor1: "rgba(157, 123, 255, 0.75)",
    beamColor2: "rgba(88, 86, 214, 0.6)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(157, 123, 255, 0.3) 0%, rgba(15, 10, 30, 0.8) 60%, transparent 100%)",
    gridColor: "#9D7BFF",
    vibe: "deep",
  },
  "neon-arena": {
    id: "neon-arena",
    name: "Neon Arena",
    tagline: "Stadium Rave // Emerald Laser & Golden Strobes",
    bgBase: "#040D0A",
    primaryAccent: "#00F5A0",
    secondaryAccent: "#00D9F5",
    highlightColor: "rgba(240, 255, 250, 0.98)",
    beamColor1: "rgba(0, 245, 160, 0.85)",
    beamColor2: "rgba(0, 217, 245, 0.7)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(0, 245, 160, 0.35) 0%, rgba(5, 25, 20, 0.8) 60%, transparent 100%)",
    gridColor: "#00F5A0",
    vibe: "neon",
  },
  "minimal-wave": {
    id: "minimal-wave",
    name: "Minimal Wave",
    tagline: "Strict Monochrome // Pure Black, White & Grayscale",
    bgBase: "#080808",
    primaryAccent: "#FFFFFF",
    secondaryAccent: "#A3A3A3",
    highlightColor: "#FFFFFF",
    beamColor1: "rgba(255, 255, 255, 0.4)",
    beamColor2: "rgba(163, 163, 163, 0.25)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(255, 255, 255, 0.12) 0%, rgba(20, 20, 20, 0.8) 60%, transparent 100%)",
    gridColor: "#333333",
    vibe: "minimal",
  },
};

export const THEME_PARTICLE_PALETTES: Record<VisualThemeId, readonly [string, string, string]> = {
  obsidian: [
    "120, 169, 255", // #78A9FF Signature Electric Blue
    "168, 197, 255", // #A8C5FF Secondary Electric Ice
    "197, 214, 245", // #C5D6F5 Muted Starlight
  ],
  cyberpunk: [
    "255, 42, 133",  // #FF2A85 Neon Pink
    "0, 240, 255",   // #00F0FF Acid Cyan
    "255, 130, 190", // Soft Pink Starlight
  ],
  midnight: [
    "157, 123, 255", // #9D7BFF Ultraviolet
    "88, 86, 214",   // #5856D6 Royal Indigo
    "210, 195, 255", // Muted Violet Starlight
  ],
  "neon-arena": [
    "0, 245, 160",   // #00F5A0 Emerald Laser
    "0, 217, 245",   // #00D9F5 Electric Cyan
    "150, 255, 210", // Mint Starlight
  ],
  "minimal-wave": [
    "255, 255, 255", // #FFFFFF Pure Starlight White
    "163, 163, 163", // #A3A3A3 Neutral Silver Grey
    "80, 80, 80",    // #505050 Charcoal Starlight
  ],
};
