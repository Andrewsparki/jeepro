"use client";

import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types/themes";
import { AudioFrequencySnapshot } from "../hooks/use-concert-audio";
import { usePerformance } from "@/lib/performance-context";

interface SpectrumCanvasProps {
  getFrequencySnapshot: () => AudioFrequencySnapshot;
  isPlaying: boolean;
  reducedMotion: boolean;
  theme: ThemeConfig;
}

/**
 * High-Performance Classic NCS Circular Audio Visualizer
 *
 * Visual design:
 * - Thick, luminous, organically pulsing circular ring with layered icy-blue and white glow
 * - Interior filled with a clearly visible, fine dotted mesh forming smooth, flowing, warped waves
 * - Perfectly centered in the viewport between header/title and the bottom player controls
 * - Zero stray horizontal lines, zero spotlight beams, zero clipping
 *
 * Performance architecture:
 * - Single 2D canvas with batch rendering passes
 * - Pre-allocated Float32Array buffers for zero per-frame garbage collection
 * - Capped DPR (1.0 - 1.25) to avoid expensive fillrate overhead
 * - Single animation loop with visibility detection and clean shutdown
 */
export function SpectrumCanvas({
  getFrequencySnapshot,
  isPlaying,
  reducedMotion,
  theme,
}: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { concertVisualComplexity } = usePerformance();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Keep DPR capped to 1.25 max (or 1.0 for low-end mode)
    const maxDpr = concertVisualComplexity ? 1.25 : 1.0;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      const clientW = canvas.parentElement.clientWidth;
      const clientH = canvas.parentElement.clientHeight;
      width = clientW;
      height = clientH;
      canvas.width = Math.floor(clientW * dpr);
      canvas.height = Math.floor(clientH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Number of perimeter nodes forming the organic pulsing NCS ring
    const RING_POINTS = 96;
    const ringWaveBuffer = new Float32Array(RING_POINTS).fill(0);

    // High-density fine dotted mesh inside the ring
    // 21x21 grid on full, 17x17 on low-end
    const GRID_SIZE = concertVisualComplexity ? 21 : 17;

    let smoothBass = 0;
    let smoothMid = 0;
    let smoothTreble = 0;
    let rotationAngle = 0;
    let timeStep = 0;
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      if (!isTabVisible) {
        animationFrameId = 0;
        return;
      }

      const dt = Math.min(0.05, (now - lastFrameTime) * 0.001);
      lastFrameTime = now;
      timeStep += dt;

      ctx.clearRect(0, 0, width, height);

      const snapshot = getFrequencySnapshot();
      const freq = snapshot.freqArray;
      const timeData = snapshot.timeArray;
      const rawBass = snapshot.bass;
      const rawMid = snapshot.mid;
      const rawTreble = snapshot.treble;

      // When paused or reduced motion, settle audio energy smoothly
      const targetBass = isPlaying && !reducedMotion ? rawBass : 0;
      const targetMid = isPlaying && !reducedMotion ? rawMid : 0;
      const targetTreble = isPlaying && !reducedMotion ? rawTreble : 0;

      smoothBass += (targetBass - smoothBass) * 0.28;
      smoothMid += (targetMid - smoothMid) * 0.22;
      smoothTreble += (targetTreble - smoothTreble) * 0.22;

      // Perfectly center the circle between the top title (ends ~y=140px)
      // and the bottom controls (starts ~y=height-130px)
      const centerX = width * 0.5;
      const topBoundary = 135;
      const bottomBoundary = height - 130;
      const availableH = Math.max(200, bottomBoundary - topBoundary);
      const centerY = topBoundary + availableH * 0.5;

      // Calculate base radius so visualizer fits comfortably with ample breathing room
      const maxAvailableD = Math.min(width * 0.85, availableH * 0.85);
      const baseRadius = Math.max(60, Math.min(160, maxAvailableD * 0.38));
      const currentRadius = baseRadius * (1 + smoothBass * 0.16);

      if (!reducedMotion) {
        rotationAngle += 0.004 + smoothBass * 0.008;
      }

      // =========================================================================
      // 1. CLEARLY VISIBLE FINE DOTTED MESH (Inside the Ring)
      // =========================================================================
      // Dark circular interior disc
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius - 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(8, 11, 18, 0.85)";
      ctx.fill();

      // Mask strictly inside inner ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius - 4, 0, Math.PI * 2);
      ctx.clip();

      const halfGrid = (GRID_SIZE - 1) * 0.5;
      const gridSpacing = ((currentRadius - 8) * 2) / (GRID_SIZE - 1);
      const flowTime = timeStep * (isPlaying ? 2.5 : 1.0);

      // Single-pass batch drawing for all interior mesh dots
      ctx.beginPath();

      for (let r = 0; r < GRID_SIZE; r++) {
        const ny = (r - halfGrid) / halfGrid; // -1.0 to 1.0
        for (let c = 0; c < GRID_SIZE; c++) {
          const nx = (c - halfGrid) / halfGrid; // -1.0 to 1.0
          const distSq = nx * nx + ny * ny;

          if (distSq <= 0.96) {
            const dist = Math.sqrt(distSq);

            // Multi-frequency smooth warping waves
            const wave1 = Math.sin(flowTime + nx * 2.8 + ny * 2.0);
            const wave2 = Math.cos(flowTime * 1.3 - nx * 2.2 + ny * 1.8);
            const waveIntensity = (isPlaying ? 1.0 : 0.4) * (smoothBass * 0.65 + smoothMid * 0.45);

            const warpX = (wave1 * 5.0 + wave2 * 3.0) * (0.8 + waveIntensity * 1.8);
            const warpY = (wave2 * 5.0 - wave1 * 3.0) * (0.8 + waveIntensity * 1.8);

            const dotX = centerX + (c - halfGrid) * gridSpacing + warpX;
            const dotY = centerY + (r - halfGrid) * gridSpacing + warpY;

            // Audio waveform reactive displacement
            let audioOffset = 0;
            if (timeData && isPlaying) {
              const sampleIdx = Math.floor(Math.abs(nx * 0.6 + ny * 0.4 + 1) * 45) % timeData.length;
              audioOffset = Math.abs(timeData[sampleIdx] - 128) / 128;
            }

            // High-contrast, fine dot sizing (1.0px to 2.8px)
            const dotSize = Math.max(
              0.9,
              (1.2 + (1.0 - dist) * 0.8 + audioOffset * 1.6) * (1.0 + smoothBass * 0.35)
            );

            ctx.moveTo(dotX + dotSize, dotY);
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          }
        }
      }

      // Fill all dots in crisp luminous electric-blue / white
      ctx.fillStyle = theme.primaryAccent;
      ctx.globalAlpha = 0.55 + smoothBass * 0.4;
      ctx.fill();

      // Center bright core dots pass
      ctx.globalAlpha = 1.0;
      ctx.restore();

      // =========================================================================
      // 2. THICK, LUMINOUS, ORGANICALLY PULSING CIRCULAR RING (Classic NCS)
      // =========================================================================
      // Compute organic wave offsets along the circumference
      const maxWaveAmp = baseRadius * 0.42;

      for (let i = 0; i < RING_POINTS; i++) {
        // Mirrored symmetry across the circle
        const halfPoints = RING_POINTS / 2;
        const distFromBase = i < halfPoints ? i : RING_POINTS - i;
        const norm = distFromBase / halfPoints; // 0 (bass) to 1 (treble)

        let targetAmp = 0;
        if (freq && isPlaying) {
          const binIdx = Math.min(
            freq.length - 1,
            Math.floor(Math.pow(norm, 1.25) * (freq.length * 0.72))
          );
          const rawAmp = freq[binIdx] / 255;
          targetAmp = Math.pow(rawAmp, 1.2) * maxWaveAmp;
        } else {
          targetAmp = Math.sin(timeStep * 2.2 + i * 0.25) * 4.0;
        }

        ringWaveBuffer[i] += (targetAmp - ringWaveBuffer[i]) * 0.32;
      }

      // Soft ambient radial bloom around ring
      const bloomRadius = currentRadius + maxWaveAmp + 28;
      const bloomGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.max(10, currentRadius - 15),
        centerX,
        centerY,
        bloomRadius
      );
      bloomGrad.addColorStop(0, `${theme.primaryAccent}35`);
      bloomGrad.addColorStop(0.5, `${theme.secondaryAccent}14`);
      bloomGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(centerX, centerY, bloomRadius, 0, Math.PI * 2);
      ctx.fillStyle = bloomGrad;
      ctx.fill();

      // Build smooth closed spline for the organic pulsing outer ring
      const stepAngle = (Math.PI * 2) / RING_POINTS;

      // Helper to compute node (x, y) with wave offset
      const getNode = (idx: number, multiplier = 1.0) => {
        const wrappedIdx = ((idx % RING_POINTS) + RING_POINTS) % RING_POINTS;
        const angle = wrappedIdx * stepAngle + rotationAngle - Math.PI / 2;
        const r = currentRadius + ringWaveBuffer[wrappedIdx] * multiplier;
        return {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
        };
      };

      // Draw smooth continuous organic wave ring using quadratic beziers
      const drawRingPath = (mult = 1.0) => {
        ctx.beginPath();
        const first = getNode(0, mult);
        const last = getNode(RING_POINTS - 1, mult);
        const startMid = { x: (first.x + last.x) * 0.5, y: (first.y + last.y) * 0.5 };
        ctx.moveTo(startMid.x, startMid.y);

        for (let i = 0; i < RING_POINTS; i++) {
          const curr = getNode(i, mult);
          const next = getNode((i + 1) % RING_POINTS, mult);
          const midX = (curr.x + next.x) * 0.5;
          const midY = (curr.y + next.y) * 0.5;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();
      };

      // Outer Thick Electric Glow Ring (Stroke 1: Luminous theme color)
      drawRingPath(1.0);
      ctx.lineWidth = 4.5 + smoothBass * 3.5;
      ctx.strokeStyle = theme.primaryAccent;
      ctx.globalAlpha = 0.5 + smoothBass * 0.35;
      ctx.stroke();

      // Core Pure Bright Ring (Stroke 2: Pure icy-white highlight)
      drawRingPath(1.0);
      ctx.lineWidth = 2.2 + smoothBass * 1.5;
      ctx.strokeStyle = theme.highlightColor;
      ctx.globalAlpha = 0.92;
      ctx.stroke();

      // Sharp Inner Base Circle (gives the iconic crisp NCS circular boundary)
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();

      ctx.globalAlpha = 1.0;

      // =========================================================================
      // 3. SUBTLE BASS SHOCKWAVE PULSE ON HEAVY DROP
      // =========================================================================
      if (smoothBass > 0.68 && !reducedMotion) {
        const shockProgress = (smoothBass - 0.68) / 0.32;
        const shockRadius = currentRadius + 12 + shockProgress * 55;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.highlightColor;
        ctx.lineWidth = 1.5 * (1 - shockProgress);
        ctx.globalAlpha = 0.4 * (1 - shockProgress);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateDimensions);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getFrequencySnapshot, isPlaying, reducedMotion, theme, concertVisualComplexity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
