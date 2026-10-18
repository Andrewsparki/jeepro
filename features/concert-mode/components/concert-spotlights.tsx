"use client";

import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types/themes";

interface ConcertSpotlightsProps {
  theme: ThemeConfig;
  reducedMotion?: boolean;
}

interface SpotlightBeam {
  originXRatio: number; // 0 to 1 along the top ceiling
  baseAngle: number;    // Radian offset from pure vertical (PI/2)
  sweepSpeed: number;   // Angular oscillation speed
  sweepAmplitude: number; // Max swing in radians (~0.12 - 0.22)
  phase: number;        // Independent timing offset
  topWidth: number;     // Width at source emitter (px)
  bottomSpread: number; // Cone spread multiplier (~2.8 - 4.2)
  baseAlpha: number;    // Peak translucent atmospheric alpha (0.07 - 0.14)
  colorIndex: 0 | 1;    // 0 = primary theme beam, 1 = secondary/accent beam
}

/**
 * Stage Atmosphere Spotlight Palettes:
 * - Obsidian Blue: Icy blue & cool electric sapphire
 * - Cyberpunk: High-voltage neon pink & acid cyan
 * - Midnight: Ethereal ultraviolet & royal indigo mist
 * - Neon Arena: Stadium emerald laser & electric teal
 * - Minimal Wave: STRICT MONOCHROME (soft silver white & neutral translucent charcoal)
 */
const SPOTLIGHT_PALETTES: Record<string, [string, string]> = {
  obsidian: [
    "120, 169, 255", // Icy Blue
    "79, 128, 226",  // Cool Sapphire
  ],
  cyberpunk: [
    "255, 42, 133",  // Neon Pink
    "0, 240, 255",   // Acid Cyan
  ],
  midnight: [
    "157, 123, 255", // Ultraviolet
    "88, 86, 214",   // Royal Indigo
  ],
  "neon-arena": [
    "0, 245, 160",   // Stadium Emerald
    "0, 217, 245",   // Electric Aqua/Teal
  ],
  "minimal-wave": [
    "240, 240, 240", // Pure Monochrome Soft White
    "160, 160, 160", // Neutral Medium Silver Grey
  ],
};

/**
 * 4 Cinematic EDM Stage Spotlight Beams:
 * - Placed across the ceiling truss (left-outer, left-inner, right-inner, right-outer)
 * - Sweeping smoothly across the stage with criss-crossing diagonals
 */
const BEAMS_CONFIG: SpotlightBeam[] = [
  {
    originXRatio: 0.18,
    baseAngle: 0.22, // Angled toward right-center
    sweepSpeed: 0.00048,
    sweepAmplitude: 0.14,
    phase: 0.0,
    topWidth: 28,
    bottomSpread: 3.4,
    baseAlpha: 0.09,
    colorIndex: 0,
  },
  {
    originXRatio: 0.38,
    baseAngle: 0.08, // Angled slightly inward
    sweepSpeed: 0.00035,
    sweepAmplitude: 0.18,
    phase: 1.8,
    topWidth: 36,
    bottomSpread: 3.8,
    baseAlpha: 0.11,
    colorIndex: 1,
  },
  {
    originXRatio: 0.62,
    baseAngle: -0.08, // Angled slightly inward
    sweepSpeed: 0.00039,
    sweepAmplitude: 0.17,
    phase: 3.4,
    topWidth: 36,
    bottomSpread: 3.8,
    baseAlpha: 0.11,
    colorIndex: 0,
  },
  {
    originXRatio: 0.82,
    baseAngle: -0.22, // Angled toward left-center
    sweepSpeed: 0.00052,
    sweepAmplitude: 0.15,
    phase: 4.9,
    topWidth: 28,
    bottomSpread: 3.4,
    baseAlpha: 0.09,
    colorIndex: 1,
  },
];

export function ConcertSpotlights({
  theme,
  reducedMotion = false,
}: ConcertSpotlightsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ThemeConfig>(theme);
  const reducedMotionRef = useRef<boolean>(reducedMotion);

  useEffect(() => {
    themeRef.current = theme;
    reducedMotionRef.current = reducedMotion;
  }, [theme, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isTabVisible = !document.hidden;

    let width = 0;
    let height = 0;
    // Cap DPR to 1.0 for the soft atmospheric background spotlight canvas (optimal fillrate)
    const dpr = 1.0;

    const updateDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth || document.documentElement.clientWidth || 1920;
      height = window.innerHeight || document.documentElement.clientHeight || 1080;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });

    let startTime = performance.now();

    const render = (now: number) => {
      if (!isTabVisible) {
        animationFrameId = null;
        return;
      }

      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const isReduced = reducedMotionRef.current;
      const currentThemeId = themeRef.current?.id || "obsidian";
      const palette = SPOTLIGHT_PALETTES[currentThemeId] || SPOTLIGHT_PALETTES.obsidian;

      const beamLength = height * 1.35; // Extends past the floor for soft falloff

      // Render each translucent stage spotlight beam
      for (let i = 0; i < BEAMS_CONFIG.length; i++) {
        const config = BEAMS_CONFIG[i];

        // Smooth sweeping oscillation (paused/constant if reducedMotion is enabled)
        const sweepAngle = isReduced
          ? config.baseAngle
          : config.baseAngle + Math.sin(elapsed * config.sweepSpeed + config.phase) * config.sweepAmplitude;

        const originX = width * config.originXRatio;
        const originY = -12; // Emitter position just above top bezel

        // Direction vector of the beam center
        // An angle of 0 is straight down (PI/2), sweepAngle rotates off vertical
        const dirAngle = Math.PI * 0.5 + sweepAngle;
        const dirX = Math.cos(dirAngle);
        const dirY = Math.sin(dirAngle);

        // Normal perpendicular vector for beam width
        const perpX = -dirY;
        const perpY = dirX;

        // Emitter source geometry (narrow top aperture)
        const halfTop = config.topWidth * 0.5;
        const srcLeftX = originX - perpX * halfTop;
        const srcLeftY = originY - perpY * halfTop;
        const srcRightX = originX + perpX * halfTop;
        const srcRightY = originY + perpY * halfTop;

        // Expanded bottom cone geometry (broad spread)
        const halfBottom = halfTop * (config.bottomSpread + (width > 1600 ? 1.0 : 0.6));
        const endCenterX = originX + dirX * beamLength;
        const endCenterY = originY + dirY * beamLength;

        const dstLeftX = endCenterX - perpX * halfBottom;
        const dstLeftY = endCenterY - perpY * halfBottom;
        const dstRightX = endCenterX + perpX * halfBottom;
        const dstRightY = endCenterY + perpY * halfBottom;

        // Choose theme color for this beam
        const colorStr = palette[config.colorIndex] || palette[0];
        const beamAlpha = config.baseAlpha;

        // 1. Core Translucent Cone with atmospheric vertical falloff
        const coneGrad = ctx.createLinearGradient(originX, originY, endCenterX, endCenterY);
        coneGrad.addColorStop(0.0, `rgba(${colorStr}, ${beamAlpha * 1.5})`);
        coneGrad.addColorStop(0.2, `rgba(${colorStr}, ${beamAlpha * 1.1})`);
        coneGrad.addColorStop(0.55, `rgba(${colorStr}, ${beamAlpha * 0.55})`);
        coneGrad.addColorStop(0.85, `rgba(${colorStr}, ${beamAlpha * 0.15})`);
        coneGrad.addColorStop(1.0, `rgba(${colorStr}, 0.0)`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(srcLeftX, srcLeftY);
        ctx.lineTo(dstLeftX, dstLeftY);
        ctx.lineTo(dstRightX, dstRightY);
        ctx.lineTo(srcRightX, srcRightY);
        ctx.closePath();
        ctx.fillStyle = coneGrad;
        ctx.fill();

        // 2. Soft Luminous Center Shaft for realistic volumetric depth
        const shaftGrad = ctx.createLinearGradient(originX, originY, endCenterX, endCenterY);
        shaftGrad.addColorStop(0.0, `rgba(255, 255, 255, ${beamAlpha * 0.8})`);
        shaftGrad.addColorStop(0.25, `rgba(${colorStr}, ${beamAlpha * 0.6})`);
        shaftGrad.addColorStop(0.7, `rgba(${colorStr}, 0.0)`);

        ctx.beginPath();
        const halfShaftTop = halfTop * 0.35;
        const halfShaftBottom = halfBottom * 0.45;
        ctx.moveTo(originX - perpX * halfShaftTop, originY - perpY * halfShaftTop);
        ctx.lineTo(endCenterX - perpX * halfShaftBottom, endCenterY - perpY * halfShaftBottom);
        ctx.lineTo(endCenterX + perpX * halfShaftBottom, endCenterY + perpY * halfShaftBottom);
        ctx.lineTo(originX + perpX * halfShaftTop, originY + perpY * halfShaftTop);
        ctx.closePath();
        ctx.fillStyle = shaftGrad;
        ctx.fill();

        // 3. Emitter Lens Flare Point at the top ceiling truss
        const lensGrad = ctx.createRadialGradient(originX, 0, 0, originX, 0, config.topWidth * 1.4);
        lensGrad.addColorStop(0.0, `rgba(255, 255, 255, ${beamAlpha * 2.2})`);
        lensGrad.addColorStop(0.4, `rgba(${colorStr}, ${beamAlpha * 1.6})`);
        lensGrad.addColorStop(1.0, `rgba(${colorStr}, 0.0)`);

        ctx.beginPath();
        ctx.arc(originX, 0, config.topWidth * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = lensGrad;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startTime = performance.now() - (performance.now() - startTime);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateDimensions);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-[2]"
      style={{
        // Hardware accelerated compositing with soft atmospheric screen blending
        transform: "translateZ(0)",
      }}
    />
  );
}
