"use client";

import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types/themes";
import { AudioFrequencySnapshot } from "../hooks/use-concert-audio";

interface SpectrumCanvasProps {
  getFrequencySnapshot: () => AudioFrequencySnapshot;
  isPlaying: boolean;
  reducedMotion: boolean;
  theme: ThemeConfig;
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

export function SpectrumCanvas({
  getFrequencySnapshot,
  isPlaying,
  reducedMotion,
  theme,
}: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Responsive Canvas setup with capped DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    // Dynamic smoothing arrays for flowing organic motion
    const SPECTRUM_POINTS = 64;
    const currentPoints = new Float32Array(SPECTRUM_POINTS).fill(0);
    const wavePoints = new Float32Array(SPECTRUM_POINTS).fill(0);

    // Circular center reactor smoothing
    let reactorRadius = 0;
    let reactorPulse = 0;
    let rotationAngle = 0;

    // Ambient floating embers & frequency embers
    const PARTICLE_COUNT = reducedMotion ? 0 : 28;
    const particles: AmbientParticle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        radius: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let timeStep = 0;

    const render = () => {
      if (!isTabVisible) {
        animationFrameId = 0;
        return;
      }

      timeStep += 0.016;
      ctx.clearRect(0, 0, width, height);

      const snapshot = getFrequencySnapshot();
      const freq = snapshot.freqArray;
      const timeData = snapshot.timeArray;
      const bass = snapshot.bass;
      const mid = snapshot.mid;
      const treble = snapshot.treble;
      const overall = snapshot.overall;

      // Base idle movement keeps scene atmospheric even when paused or in quiet parts
      const idleEnergy = Math.sin(timeStep * 1.5) * 0.05 + 0.06;
      const activeBass = isPlaying ? Math.max(bass, idleEnergy) : idleEnergy;
      const activeMid = isPlaying ? Math.max(mid, idleEnergy * 0.7) : idleEnergy * 0.7;
      const activeTreble = isPlaying ? Math.max(treble, idleEnergy * 0.5) : idleEnergy * 0.5;

      const centerX = width * 0.5;
      const centerY = height * 0.54;
      const horizonY = height * 0.74;

      // ========================================================
      // 1. CENTER CONCERT REACTOR & SHOCKWAVE PULSES
      // ========================================================
      const targetRadius = Math.min(width, height) * 0.14 * (1 + activeBass * 0.4);
      reactorRadius += (targetRadius - reactorRadius) * 0.25;

      // Shockwave ring on heavy bass kicks
      if (activeBass > 0.45 && !reducedMotion) {
        reactorPulse = Math.min(1.0, reactorPulse + 0.35);
      } else {
        reactorPulse = Math.max(0, reactorPulse - 0.035);
      }

      if (reactorPulse > 0.01) {
        const shockRadius = reactorRadius + reactorPulse * 90;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.primaryAccent;
        ctx.lineWidth = 2 * (1 - reactorPulse);
        ctx.globalAlpha = reactorPulse * 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Orbital Audio Flower / Light Rings around Reactor
      if (!reducedMotion) {
        rotationAngle += 0.008 + activeMid * 0.03;
        const ringSegments = 48;
        ctx.beginPath();

        for (let i = 0; i <= ringSegments; i++) {
          const theta = (i / ringSegments) * Math.PI * 2 + rotationAngle;
          let rOffset = 0;
          if (freq && isPlaying) {
            const freqIdx = (i % 24) * 2;
            rOffset = (freq[freqIdx] / 255) * 36 * (1 + activeBass * 0.5);
          } else {
            rOffset = Math.sin(theta * 6 + timeStep * 3) * 6;
          }
          const currentR = reactorRadius + rOffset;
          const px = centerX + Math.cos(theta) * currentR;
          const py = centerY + Math.sin(theta) * currentR;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.strokeStyle = theme.primaryAccent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3 + activeBass * 0.45;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // ========================================================
      // 2. LAYERED FLOWING HORIZON SPECTRUM RIBBONS (Dual Sine Waves)
      // ========================================================
      // Interpolate points smoothly
      for (let i = 0; i < SPECTRUM_POINTS; i++) {
        let rawVal = 0;
        if (freq && isPlaying) {
          // Symmetric distribution: center is bass/mids, edges are highs
          const distFromCenter = Math.abs(i - SPECTRUM_POINTS / 2) / (SPECTRUM_POINTS / 2);
          const binIdx = Math.min(freq.length - 1, Math.floor((1 - distFromCenter * 0.7) * (freq.length * 0.6)));
          rawVal = (freq[binIdx] / 255) * (1 - distFromCenter * 0.25);
        } else {
          rawVal = Math.sin(timeStep * 2 + i * 0.2) * 0.08 + 0.05;
        }

        const targetY = rawVal * (height * 0.28) * (1 + activeBass * 0.3);
        currentPoints[i] += (targetY - currentPoints[i]) * 0.32;

        // Waveform secondary ribbon
        let waveVal = 0;
        if (timeData && isPlaying) {
          const tIdx = Math.floor((i / SPECTRUM_POINTS) * (timeData.length - 1));
          waveVal = ((timeData[tIdx] - 128) / 128) * (height * 0.12) * (1 + activeMid * 0.5);
        } else {
          waveVal = Math.cos(timeStep * 2.5 + i * 0.3) * 12;
        }
        wavePoints[i] += (waveVal - wavePoints[i]) * 0.4;
      }

      // --- Ribbon Layer A: Backing Glow Wave (Secondary Accent) ---
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let i = 0; i < SPECTRUM_POINTS; i++) {
        const x = (i / (SPECTRUM_POINTS - 1)) * width;
        const y = horizonY - currentPoints[i] * 0.7 + wavePoints[i] * 0.8;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = ((i - 1) / (SPECTRUM_POINTS - 1)) * width;
          const prevY = horizonY - currentPoints[i - 1] * 0.7 + wavePoints[i - 1] * 0.8;
          const cx = (prevX + x) / 2;
          const cy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, cy);
        }
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();

      const backGrad = ctx.createLinearGradient(0, horizonY - height * 0.25, 0, horizonY);
      backGrad.addColorStop(0, `${theme.secondaryAccent}55`);
      backGrad.addColorStop(1, "transparent");
      ctx.fillStyle = backGrad;
      ctx.fill();

      // --- Ribbon Layer B: Primary Audio Crest Wave (Primary Accent) ---
      ctx.beginPath();
      for (let i = 0; i < SPECTRUM_POINTS; i++) {
        const x = (i / (SPECTRUM_POINTS - 1)) * width;
        const y = horizonY - currentPoints[i] - wavePoints[i];
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = ((i - 1) / (SPECTRUM_POINTS - 1)) * width;
          const prevY = horizonY - currentPoints[i - 1] - wavePoints[i - 1];
          const cx = (prevX + x) / 2;
          const cy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, cy);
        }
      }
      ctx.lineTo(width, horizonY + 40);
      ctx.lineTo(0, horizonY + 40);
      ctx.closePath();

      const crestGrad = ctx.createLinearGradient(0, horizonY - height * 0.35, 0, horizonY + 30);
      crestGrad.addColorStop(0, `${theme.primaryAccent}ee`);
      crestGrad.addColorStop(0.35, `${theme.primaryAccent}66`);
      crestGrad.addColorStop(1, "transparent");
      ctx.fillStyle = crestGrad;
      ctx.fill();

      // Luminous Highlight Edge Line on crest
      ctx.beginPath();
      for (let i = 0; i < SPECTRUM_POINTS; i++) {
        const x = (i / (SPECTRUM_POINTS - 1)) * width;
        const y = horizonY - currentPoints[i] - wavePoints[i];
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = ((i - 1) / (SPECTRUM_POINTS - 1)) * width;
          const prevY = horizonY - currentPoints[i - 1] - wavePoints[i - 1];
          const cx = (prevX + x) / 2;
          const cy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, cy);
        }
      }
      ctx.strokeStyle = theme.highlightColor;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // ========================================================
      // 3. REFLECTIVE STAGE FLOOR GRID & LIGHT BEAMS
      // ========================================================
      // Mirror reflection of the audio crest below horizon
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < SPECTRUM_POINTS; i++) {
        const x = (i / (SPECTRUM_POINTS - 1)) * width;
        const reflY = horizonY + (currentPoints[i] + wavePoints[i]) * 0.45;
        if (i === 0) ctx.moveTo(x, reflY);
        else {
          const prevX = ((i - 1) / (SPECTRUM_POINTS - 1)) * width;
          const prevReflY = horizonY + (currentPoints[i - 1] + wavePoints[i - 1]) * 0.45;
          const cx = (prevX + x) / 2;
          const cy = (prevReflY + reflY) / 2;
          ctx.quadraticCurveTo(prevX, prevReflY, cx, cy);
        }
      }
      ctx.lineTo(width, horizonY);
      ctx.lineTo(0, horizonY);
      ctx.closePath();

      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + height * 0.18);
      floorGrad.addColorStop(0, `${theme.primaryAccent}40`);
      floorGrad.addColorStop(1, "transparent");
      ctx.fillStyle = floorGrad;
      ctx.fill();
      ctx.restore();

      // ========================================================
      // 4. FLOATING FREQUENCY EMBERS & LIGHT TRAILS
      // ========================================================
      if (PARTICLE_COUNT > 0) {
        ctx.fillStyle = theme.primaryAccent;
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          const speed = (isPlaying ? 1 + activeBass * 2.8 : 0.8);
          pt.y += pt.vy * speed;
          pt.x += pt.vx + Math.sin(timeStep * 2 + pt.phase) * 0.6;

          // Wrap boundaries
          if (pt.y < centerY - 160) {
            pt.y = horizonY + Math.random() * 60;
            pt.x = centerX + (Math.random() - 0.5) * (width * 0.7);
          }

          const currentAlpha = pt.alpha * (0.3 + (isPlaying ? overall : 0.1) * 0.7);
          ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius * (1 + activeTreble * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
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
  }, [getFrequencySnapshot, isPlaying, reducedMotion, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
