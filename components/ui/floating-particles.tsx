"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { useSettings } from "@/providers/settings-provider";
import { usePerformance } from "@/lib/performance-context";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  // Palette: 0 = Electric Blue (#78A9FF), 1 = Soft Ice Blue (#A8C5FF), 2 = Moonlight Slate (#C5D6F5)
  colorIndex: 0 | 1 | 2;
}

const PARTICLE_PALETTES = [
  "120, 169, 255", // #78A9FF — Signature Electric Blue
  "168, 197, 255", // #A8C5FF — Secondary Electric Ice
  "197, 214, 245", // #C5D6F5 — Muted Starlight
] as const;

interface FloatingParticlesProps {
  className?: string;
  zIndexClass?: string;
}

const emptySubscribe = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function FloatingParticles({ className, zIndexClass = "-z-40" }: FloatingParticlesProps = {}) {
  const mounted = useSyncExternalStore(emptySubscribe, getMountedSnapshot, getMountedServerSnapshot);
  const { settings } = useSettings();
  const { particles: enableParticles } = usePerformance();
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isEnabled = mounted && settings.ambientParticles && enableParticles && !isReducedMotion;

  useEffect(() => {
    // If disabled or reduced motion, completely abort and destroy canvas resources
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isTabVisible = !document.hidden;

    // Adaptive particle count based on viewport dimensions & device capabilities
    const getTargetParticleCount = (w: number, h: number) => {
      const area = w * h;
      // High-DPI mobile / smaller screens: fewer particles
      if (area < 500000) return 18;      // Mobile phones
      if (area < 1100000) return 28;     // Tablets & small laptops
      return 38;                         // Standard & ultrawide desktop monitors
    };

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = getTargetParticleCount(width, height);
      particles = Array.from({ length: count }, () => {
        const rand = Math.random();
        const colorIndex: 0 | 1 | 2 = rand > 0.65 ? 0 : rand > 0.25 ? 1 : 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.4 + 0.75, // 0.75px to 2.15px
          speedX: (Math.random() - 0.5) * 0.12, // Slow, elegant ambient drift
          speedY: -Math.random() * 0.16 - 0.04, // Gentle upward buoyancy
          baseAlpha: Math.random() * 0.25 + 0.18, // Restrained, non-distracting opacity
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.015 + Math.random() * 0.02,
          colorIndex,
        };
      });
    };

    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-init or clamp existing particles within bounds
      if (particles.length === 0) {
        initParticles();
      } else {
        const targetCount = getTargetParticleCount(width, height);
        if (particles.length !== targetCount) {
          initParticles();
        } else {
          for (const p of particles) {
            if (p.x > width) p.x = Math.random() * width;
            if (p.y > height) p.y = Math.random() * height;
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      if (!isTabVisible) {
        // Tab hidden: do not run animation loop tick
        animationFrameId = null;
        return;
      }

      // Time step normalization (prevents particle leaping on background resume)
      const elapsed = currentTime - lastTime;
      lastTime = currentTime;
      const dt = Math.min(Math.max(elapsed / 16.6667, 0.2), 3);

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Position update
        p.x += p.speedX * dt;
        p.y += p.speedY * dt;
        p.phase += p.phaseSpeed * dt;

        // Wrap around boundaries seamlessly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Breathing softly glowing pulse
        const pulse = 0.8 + 0.3 * Math.sin(p.phase);
        const currentAlpha = Math.max(0, Math.min(1, p.baseAlpha * pulse));
        const colorRgb = PARTICLE_PALETTES[p.colorIndex];

        // Soft outer atmospheric glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha * 0.16})`;
        ctx.fill();

        // Crisp luminous particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause when document is hidden to conserve GPU/CPU, resume when visible
    const handleVisibilityChange = () => {
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start loop
    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isEnabled]);

  // Only render canvas after client-side hydration mount and when enabled
  if (!mounted || !isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className={`fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none ${zIndexClass} ${className || ""}`}
      style={{
        contain: "strict",
      }}
    />
  );
}
