"use client";

import { useEffect, useRef, useState } from "react";
import { usePerformance } from "@/lib/performance-context";
import { useLighting } from "@/components/ui/lighting-provider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function FloatingParticles() {
  const { enableParticles, particleCount } = usePerformance();
  const { mouseRef } = useLighting();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for reduced motion
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) return;

    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    // Initialize particles
    particles.current = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let lastTime = 0;
    const isLowEnd = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
    // Low-end devices: skip frames if less than ~32ms elapsed (cap at ~30fps)
    const MIN_FRAME_MS = isLowEnd ? 32 : 0;

    const render = (time: number) => {
      requestRef.current = requestAnimationFrame(render);

      if (document.hidden) return; // Pause rendering if tab is hidden

      const dt = lastTime ? time - lastTime : 16.67;
      if (dt < MIN_FRAME_MS) return; // Throttle on low-end by time, not frame count
      lastTime = time;

      // Normalize velocity to be consistent across refresh rates
      // vx/vy were authored for ~60fps (16.67ms per frame)
      const dtFactor = dt / 16.67;

      ctx.clearRect(0, 0, width, height);

      // Read mouse position from shared ref (no duplicate listener!)
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.current.forEach((p) => {
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction (slight repulsion)
        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 22500) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const force = (150 - dist) / 150;
            p.x -= (dx / dist) * force * 0.5 * dtFactor;
            p.y -= (dy / dist) * force * 0.5 * dtFactor;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [mounted, particleCount, mouseRef]);

  if (!mounted || !enableParticles) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-40"
      style={{ opacity: 0.8 }}
    />
  );
}
