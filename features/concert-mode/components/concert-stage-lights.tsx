"use client";

import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types/themes";
import { AudioFrequencySnapshot } from "../hooks/use-concert-audio";

interface ConcertStageLightsProps {
  getFrequencySnapshot?: () => AudioFrequencySnapshot;
  isPlaying?: boolean;
  reducedMotion?: boolean;
  theme: ThemeConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;       // Base drift velocity X
  vy: number;       // Base drift velocity Y
  size: number;
  baseAlpha: number;
  phase: number;
  pulseSpeed: number;
  colorIndex: 0 | 1 | 2;
  instrumentRole: 0 | 1 | 2 | 3;
}

// High-contrast, theme-synchronized particle palettes matching each Stage Atmosphere vibe
// 0: Primary vibe accent, 1: Secondary electric tone, 2: Crisp brilliant highlight
const THEME_PARTICLE_PALETTES: Record<string, readonly [string, string, string]> = {
  obsidian: [
    "120, 169, 255", // #78A9FF Signature Electric Blue
    "180, 215, 255", // #B4D7FF Crisp Electric Ice
    "235, 245, 255", // #EBF5FF Pure Icy Starlight
  ],
  cyberpunk: [
    "255, 42, 133",  // #FF2A85 High-Voltage Neon Pink
    "0, 240, 255",   // #00F0FF Acid Cyan
    "255, 255, 255", // Pure Starlight White
  ],
  midnight: [
    "157, 123, 255", // #9D7BFF Ultraviolet Neon
    "88, 86, 214",   // #5856D6 Deep Indigo Mist
    "230, 220, 255", // #E6DCFF Soft Cosmic Violet
  ],
  "neon-arena": [
    "0, 245, 160",   // #00F5A0 Stadium Emerald Laser
    "0, 217, 245",   // #00D9F5 Electric Aqua
    "240, 255, 250", // #F0FFFA Crisp Mint Starlight
  ],
  "minimal-wave": [
    "255, 255, 255", // Pure Starlight White Highlight
    "163, 163, 163", // Neutral Silver Grey
    "80, 80, 80",    // Deep Charcoal Mist
  ],
};

export function ConcertStageLights({
  getFrequencySnapshot,
  isPlaying = false,
  theme,
  reducedMotion = false,
}: ConcertStageLightsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ThemeConfig>(theme);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const getFrequencySnapshotRef = useRef<(() => AudioFrequencySnapshot) | undefined>(getFrequencySnapshot);

  // Keep refs up-to-date so the single animation loop accesses latest state without re-allocating or re-binding
  useEffect(() => {
    themeRef.current = theme;
    reducedMotionRef.current = reducedMotion;
    isPlayingRef.current = isPlaying;
    getFrequencySnapshotRef.current = getFrequencySnapshot;
  }, [theme, reducedMotion, isPlaying, getFrequencySnapshot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isTabVisible = !document.hidden;

    // Viewport-adaptive particle count: rich, immersive starlight field
    const getTargetCount = (w: number, h: number) => {
      const area = w * h;
      if (area < 500000) return 65;
      if (area < 1100000) return 105;
      return 140;
    };

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let particles: Particle[] = [];

    // Spawns a particle either randomly across the screen (initial) or just outside a screen edge (recycled)
    const createParticle = (spawnOutside = false): Particle => {
      const rand = Math.random();
      const colorIndex: 0 | 1 | 2 = rand > 0.6 ? 0 : rand > 0.25 ? 1 : 2;

      // Assign specialized musical instrument role:
      // 0 = Kick & Bass (25% - largest, deep anchors)
      // 1 = Guitars, Keys & Chords (30% - warm harmonic bloom)
      // 2 = Vocals & Lead Melodies (25% - ethereal, luminous highlights)
      // 3 = Percussion & Hi-Hats (20% - micro-dust crystalline shimmer)
      const roleRand = Math.random();
      const instrumentRole: 0 | 1 | 2 | 3 =
        roleRand < 0.25 ? 0 : roleRand < 0.55 ? 1 : roleRand < 0.80 ? 2 : 3;

      let size = Math.random() * 2.0 + 1.2;
      let driftSpeed = Math.random() * 0.40 + 0.22;
      let baseAlpha = Math.random() * 0.35 + 0.55;

      if (instrumentRole === 0) {
        // Kick & Bass anchors: slightly larger, stately drift
        size = Math.random() * 1.5 + 2.4; // 2.4 - 3.9px
        driftSpeed = Math.random() * 0.25 + 0.18;
        baseAlpha = 0.75;
      } else if (instrumentRole === 3) {
        // Percussion & Hi-Hats: micro-starlight dust, responsive shimmer
        size = Math.random() * 1.0 + 1.0; // 1.0 - 2.0px
        driftSpeed = Math.random() * 0.35 + 0.28;
        baseAlpha = 0.60;
      }

      const angle = Math.random() * Math.PI * 2;
      const pulseSpeed = 0.02 + Math.random() * 0.03;
      const phase = Math.random() * Math.PI * 2;

      let x = Math.random() * (width || 1920);
      let y = Math.random() * (height || 1080);
      let vx = Math.cos(angle) * driftSpeed;
      let vy = Math.sin(angle) * driftSpeed;

      if (spawnOutside && width > 0 && height > 0) {
        // Choose which edge to spawn just outside: 0=top, 1=right, 2=bottom, 3=left
        const edge = Math.floor(Math.random() * 4);
        const margin = 20;

        if (edge === 0) {
          x = Math.random() * width;
          y = -margin;
          const inwardAngle = Math.PI * 0.2 + Math.random() * Math.PI * 0.6;
          vx = Math.cos(inwardAngle) * driftSpeed;
          vy = Math.sin(inwardAngle) * driftSpeed;
        } else if (edge === 1) {
          x = width + margin;
          y = Math.random() * height;
          const inwardAngle = Math.PI * 0.7 + Math.random() * Math.PI * 0.6;
          vx = Math.cos(inwardAngle) * driftSpeed;
          vy = Math.sin(inwardAngle) * driftSpeed;
        } else if (edge === 2) {
          x = Math.random() * width;
          y = height + margin;
          const inwardAngle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
          vx = Math.cos(inwardAngle) * driftSpeed;
          vy = Math.sin(inwardAngle) * driftSpeed;
        } else {
          x = -margin;
          y = Math.random() * height;
          const inwardAngle = -Math.PI * 0.3 + Math.random() * Math.PI * 0.6;
          vx = Math.cos(inwardAngle) * driftSpeed;
          vy = Math.sin(inwardAngle) * driftSpeed;
        }
      }

      return {
        x,
        y,
        vx,
        vy,
        size,
        baseAlpha,
        phase,
        pulseSpeed,
        colorIndex,
        instrumentRole,
      };
    };

    const initParticles = () => {
      const count = getTargetCount(width, height);
      particles = Array.from({ length: count }, () => createParticle(false));
    };

    const updateDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth || document.documentElement.clientWidth || 1920;
      height = window.innerHeight || document.documentElement.clientHeight || 1080;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      } else {
        const target = getTargetCount(width, height);
        if (particles.length !== target) {
          initParticles();
        } else {
          for (const p of particles) {
            if (p.x > width + 30) p.x = Math.random() * width;
            if (p.y > height + 30) p.y = Math.random() * height;
          }
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });

    let lastTime = performance.now();

    // Multi-instrument musical tracking state
    let prevKick = 0;
    let prevGuitar = 0;
    let prevVocal = 0;
    let prevSnare = 0;
    let prevHihat = 0;

    let kickEnergy = 0;     // Sub-bass kicks & 808 drops
    let guitarEnergy = 0;   // Heat Waves chords, guitars, electric piano
    let vocalEnergy = 0;    // Lead vocals, melodic synths
    let snareEnergy = 0;    // Snares & claps
    let hihatEnergy = 0;    // Cymbals, trap hi-hat rolls, shakers
    let stasisFactor = 1.0; // Pre-drop silence freeze
    let lastKickTime = 0;

    const render = (now: number) => {
      if (!isTabVisible) {
        animationFrameId = null;
        return;
      }

      const elapsed = now - lastTime;
      lastTime = now;
      const dt = Math.min(Math.max(elapsed / 16.6667, 0.2), 3);

      ctx.clearRect(0, 0, width, height);

      const isReduced = reducedMotionRef.current;
      const isPlayingAudio = isPlayingRef.current;
      const getSnap = getFrequencySnapshotRef.current;

      // Extract Multi-Instrument Audio Layers
      if (isPlayingAudio && getSnap && !isReduced) {
        const snap = getSnap();
        const freq = snap.freqArray;
        const overall = snap.overall || 0;
        const rawBass = snap.bass || 0;

        // 1. Pre-Drop Silence & Stasis Freeze
        const isQuietOrCut = overall < 0.045 && rawBass < 0.05;
        if (isQuietOrCut) {
          stasisFactor = Math.max(0.04, stasisFactor - 0.12 * dt); // Freeze motion in mid-air
        } else {
          stasisFactor = Math.min(1.0, stasisFactor + 0.25 * dt); // Fluid release
        }

        if (freq && freq.length >= 70) {
          // 2. KICK & 808 BASS (Bins 0 - 2: ~30 - 120Hz)
          const kickRaw = (freq[0] * 0.45 + freq[1] * 0.40 + freq[2] * 0.15) / 255;
          const kickFlux = Math.max(0, kickRaw - prevKick);
          prevKick = kickRaw;
          const timeSinceKick = now - lastKickTime;
          if (kickFlux > 0.07 && kickRaw > 0.26 && timeSinceKick > 160) {
            kickEnergy = Math.max(kickEnergy, Math.min(1.0, 0.45 + kickFlux * 2.6 + kickRaw * 0.35));
            lastKickTime = now;
          }

          // 3. GUITARS, KEYS & CHORDS (Bins 4 - 12: ~200 - 1000Hz)
          let guitarSum = 0;
          for (let b = 4; b <= 12; b++) guitarSum += freq[b];
          const guitarRaw = guitarSum / (9 * 255);
          const guitarFlux = Math.max(0, guitarRaw - prevGuitar);
          prevGuitar = guitarRaw;
          if (guitarFlux > 0.04 || guitarRaw > 0.32) {
            guitarEnergy = Math.max(guitarEnergy, Math.min(1.0, guitarRaw * 0.95 + guitarFlux * 1.8));
          }

          // 4. LEAD VOCALS & SYNTH MELODIES (Bins 13 - 32: ~1000 - 3200Hz)
          let vocalSum = 0;
          for (let b = 13; b <= 32; b++) vocalSum += freq[b];
          const vocalRaw = vocalSum / (20 * 255);
          const vocalFlux = Math.max(0, vocalRaw - prevVocal);
          prevVocal = vocalRaw;
          if (vocalFlux > 0.05 || vocalRaw > 0.28) {
            vocalEnergy = Math.max(vocalEnergy, Math.min(1.0, vocalRaw * 0.9 + vocalFlux * 1.6));
          }

          // 5. SNARES & CLAPS (Bins 33 - 55: ~3200 - 7000Hz)
          let snareSum = 0;
          for (let b = 33; b <= 55; b++) snareSum += freq[b];
          const snareRaw = snareSum / (23 * 255);
          const snareFlux = Math.max(0, snareRaw - prevSnare);
          prevSnare = snareRaw;
          if (snareFlux > 0.08) {
            snareEnergy = Math.max(snareEnergy, Math.min(1.0, 0.4 + snareFlux * 2.8));
          }

          // 6. HI-HATS, SHAKERS & CYMBALS (Bins 56 - 90: ~7000 - 16000Hz)
          let hihatSum = 0;
          for (let b = 56; b <= 90; b++) hihatSum += freq[b];
          const hihatRaw = hihatSum / (35 * 255);
          const hihatFlux = Math.max(0, hihatRaw - prevHihat);
          prevHihat = hihatRaw;
          if (hihatFlux > 0.05 || hihatRaw > 0.24) {
            hihatEnergy = Math.max(hihatEnergy, Math.min(1.0, hihatRaw * 0.9 + hihatFlux * 1.8));
          }
        } else {
          kickEnergy = snap.bass || 0;
          guitarEnergy = snap.mid || 0;
          vocalEnergy = snap.mid || 0;
          hihatEnergy = snap.treble || 0;
          snareEnergy = snap.treble || 0;
        }

        // Exponential decay rates calibrated per instrument
        kickEnergy *= Math.pow(0.85, dt);
        guitarEnergy *= Math.pow(0.91, dt);
        vocalEnergy *= Math.pow(0.88, dt);
        snareEnergy *= Math.pow(0.80, dt);
        hihatEnergy *= Math.pow(0.82, dt);

        if (kickEnergy < 0.005) kickEnergy = 0;
        if (guitarEnergy < 0.005) guitarEnergy = 0;
        if (vocalEnergy < 0.005) vocalEnergy = 0;
        if (snareEnergy < 0.005) snareEnergy = 0;
        if (hihatEnergy < 0.005) hihatEnergy = 0;
      } else {
        kickEnergy *= Math.pow(0.8, dt);
        guitarEnergy *= Math.pow(0.8, dt);
        vocalEnergy *= Math.pow(0.8, dt);
        snareEnergy *= Math.pow(0.8, dt);
        hihatEnergy *= Math.pow(0.8, dt);
        stasisFactor = 1.0;
        prevKick = 0;
        prevGuitar = 0;
        prevVocal = 0;
        prevSnare = 0;
        prevHihat = 0;
      }

      const margin = 32;
      const currentThemeId = themeRef.current?.id || "obsidian";
      const activePalette = THEME_PARTICLE_PALETTES[currentThemeId] || THEME_PARTICLE_PALETTES.obsidian;

      // Base tidal breath modulated by beat kicks and frozen during silences
      const globalBreathFactor = isReduced ? 0.35 : (0.85 + kickEnergy * 0.22) * stasisFactor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const role = p.instrumentRole;

        // Specialized instrument dynamics:
        let roleBreath = globalBreathFactor;
        let roleSizeScale = 1.0;
        let roleGlowScale = 2.2;
        let roleAlphaBoost = 0;

        if (role === 0) {
          // Deep Kick / Bass drums: responds with deep tidal breath & size expansion (+25%)
          roleBreath = isReduced ? 0.35 : (0.85 + kickEnergy * 0.32) * stasisFactor;
          roleSizeScale = 1.0 + kickEnergy * 0.24;
          roleGlowScale = 2.4 + kickEnergy * 0.8;
          roleAlphaBoost = kickEnergy * 0.25;
        } else if (role === 1) {
          // Heat Waves Guitars / Chords: expands warm atmospheric aura
          roleSizeScale = 1.0 + guitarEnergy * 0.12;
          roleGlowScale = 2.2 + guitarEnergy * 1.2;
          roleAlphaBoost = guitarEnergy * 0.22;
        } else if (role === 2) {
          // Vocals & Melodic Synths: crisp starlight luminosity
          roleSizeScale = 1.0 + vocalEnergy * 0.15;
          roleGlowScale = 2.3 + vocalEnergy * 0.9;
          roleAlphaBoost = vocalEnergy * 0.28;
        } else {
          // Hi-Hats, Snares & Percussion: snappy snare pop & fast sparkle
          roleSizeScale = 1.0 + snareEnergy * 0.20;
          roleGlowScale = 2.1 + snareEnergy * 0.6;
          roleAlphaBoost = snareEnergy * 0.35 + hihatEnergy * 0.18;
          p.phase += (hihatEnergy * 0.06 + snareEnergy * 0.08) * dt;
        }

        // Fluid drift along natural trajectory (freezes if music cuts out)
        p.x += p.vx * roleBreath * dt;
        p.y += p.vy * roleBreath * dt;

        // Intrinsic twinkle phase
        p.phase += p.pulseSpeed * dt;

        // Seamless boundary recycling
        const isOutOfBounds =
          p.x < -margin ||
          p.x > width + margin ||
          p.y < -margin ||
          p.y > height + margin;

        if (isOutOfBounds) {
          particles[i] = createParticle(true);
          continue;
        }

        // Appearance rendered strictly with active theme palette
        const twinkle = 0.82 + 0.18 * Math.sin(p.phase);
        const currentAlpha = Math.max(
          0.35,
          Math.min(1.0, (p.baseAlpha * twinkle + roleAlphaBoost) * Math.max(0.3, stasisFactor))
        );
        const colorRgb = activePalette[p.colorIndex] || activePalette[0];
        const currentSize = p.size * roleSizeScale;

        // Soft outer atmospheric glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * roleGlowScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha * (0.24 + roleAlphaBoost * 0.3)})`;
        ctx.fill();

        // Crisp luminous particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
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
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-[1] transition-colors duration-500"
      style={{ backgroundColor: theme.bgBase }}
    >
      {/* Light grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.gridColor} 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Subtle ambient floor glow */}
      <div
        className="absolute bottom-0 inset-x-0 h-[28vh] pointer-events-none z-[1]"
        style={{
          background: theme.floorGlow,
          opacity: 0.25,
        }}
      />

      {/* Top stage shadow */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(180deg, ${theme.bgBase} 0%, transparent 100%)`,
        }}
      />

      {/* Perimeter Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-[1]" />

      {/* Full-screen music-reactive ambient background particles (z-[5] over shadows and vignette) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      />
    </div>
  );
}
