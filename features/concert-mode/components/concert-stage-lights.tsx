"use client";

import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types/themes";
import { AudioFrequencySnapshot } from "../hooks/use-concert-audio";

interface ConcertStageLightsProps {
  getFrequencySnapshot: () => AudioFrequencySnapshot;
  isPlaying: boolean;
  reducedMotion: boolean;
  theme: ThemeConfig;
}

export function ConcertStageLights({
  getFrequencySnapshot,
  isPlaying,
  reducedMotion,
  theme,
}: ConcertStageLightsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Spotlights and strobes refs (direct transform-gpu manipulation without React state)
  const spotLeftRef = useRef<HTMLDivElement | null>(null);
  const spotCenterRef = useRef<HTMLDivElement | null>(null);
  const spotRightRef = useRef<HTMLDivElement | null>(null);
  const ambientPulseRef = useRef<HTMLDivElement | null>(null);
  const stageFloorGlowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let animId: number;
    let angle = 0;
    let isTabVisible = !document.hidden;

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animId) {
        animId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const tick = () => {
      if (!isTabVisible) {
        animId = 0;
        return;
      }

      const snap = getFrequencySnapshot();
      const bass = isPlaying ? snap.bass : 0;
      const treble = isPlaying ? snap.treble : 0;
      const mid = isPlaying ? snap.mid : 0;

      angle += 0.02 + mid * 0.03;

      // Bass punch pulse on GPU transform
      if (ambientPulseRef.current) {
        const pulseScale = 1 + bass * 0.18;
        const pulseOpacity = 0.15 + bass * 0.45;
        ambientPulseRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${pulseScale})`;
        ambientPulseRef.current.style.opacity = `${pulseOpacity}`;
      }

      // Stage floor backlight
      if (stageFloorGlowRef.current) {
        const floorOpacity = 0.25 + bass * 0.55;
        stageFloorGlowRef.current.style.opacity = `${floorOpacity}`;
      }

      // Moving light beams synchronized to music via GPU-accelerated rotation
      const leftAngle = -25 + Math.sin(angle * 1.1) * 18;
      const rightAngle = 25 - Math.sin(angle * 1.1) * 18;
      const centerAngle = Math.cos(angle * 0.75) * 12;

      if (spotLeftRef.current) {
        spotLeftRef.current.style.transform = `rotate(${leftAngle}deg)`;
        spotLeftRef.current.style.opacity = `${0.3 + treble * 0.5}`;
      }
      if (spotRightRef.current) {
        spotRightRef.current.style.transform = `rotate(${rightAngle}deg)`;
        spotRightRef.current.style.opacity = `${0.3 + treble * 0.5}`;
      }
      if (spotCenterRef.current) {
        spotCenterRef.current.style.transform = `translate3d(-50%, 0, 0) rotate(${centerAngle}deg)`;
        spotCenterRef.current.style.opacity = `${0.4 + bass * 0.45}`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [getFrequencySnapshot, isPlaying, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 transition-colors duration-500"
      style={{ backgroundColor: theme.bgBase }}
    >
      {/* Light grid texture without excessive SVG filters */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.gridColor} 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Center Stage Bass Reactor (Expanding Radial Glow) */}
      <div
        ref={ambientPulseRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full will-change-transform transform-gpu"
        style={{
          background: `radial-gradient(circle, ${theme.primaryAccent}55 0%, ${theme.secondaryAccent}18 45%, transparent 70%)`,
        }}
      />

      {/* Left Laser Beam */}
      <div
        ref={spotLeftRef}
        className="absolute top-0 left-1/4 w-[140px] h-[140vh] origin-top will-change-transform transform-gpu"
        style={{
          background: `linear-gradient(180deg, ${theme.beamColor1} 0%, ${theme.secondaryAccent}25 40%, transparent 100%)`,
          clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Center Main Stage Spotlight */}
      <div
        ref={spotCenterRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] h-[140vh] origin-top will-change-transform transform-gpu"
        style={{
          background: `linear-gradient(180deg, ${theme.highlightColor} 0%, ${theme.primaryAccent}35 50%, transparent 100%)`,
          clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Right Laser Beam */}
      <div
        ref={spotRightRef}
        className="absolute top-0 right-1/4 w-[140px] h-[140vh] origin-top will-change-transform transform-gpu"
        style={{
          background: `linear-gradient(180deg, ${theme.beamColor2} 0%, ${theme.secondaryAccent}25 40%, transparent 100%)`,
          clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Stage Floor Horizon & Reflection Surface */}
      <div
        ref={stageFloorGlowRef}
        className="absolute bottom-0 inset-x-0 h-[36vh] will-change-opacity pointer-events-none transform-gpu"
        style={{
          background: theme.floorGlow,
        }}
      />

      {/* Top stage shadow */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${theme.bgBase} 0%, transparent 100%)`,
        }}
      />

      {/* Perimeter Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
}
