"use client";

export type VisualThemeId = "obsidian" | "cyberpunk" | "midnight" | "neon-arena" | "minimal-wave";

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
    tagline: "Studio Monolith // Monochromatic Phosphor",
    bgBase: "#0A0A0C",
    primaryAccent: "#E1E7F0",
    secondaryAccent: "#8A94A6",
    highlightColor: "rgba(255, 255, 255, 1)",
    beamColor1: "rgba(225, 231, 240, 0.6)",
    beamColor2: "rgba(138, 148, 166, 0.4)",
    floorGlow: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(225, 231, 240, 0.25) 0%, rgba(20, 22, 28, 0.8) 60%, transparent 100%)",
    gridColor: "#8A94A6",
    vibe: "minimal",
  },
};
