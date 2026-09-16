"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

function subscribeReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function AuthBackground() {
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-precision mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 90, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (isReducedMotion) return;

    let rafMouseId: number | null = null;
    let pendingX = 0;
    let pendingY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      pendingX = ((e.clientX / innerWidth) - 0.5) * 16;
      pendingY = ((e.clientY / innerHeight) - 0.5) * 12;

      if (!rafMouseId) {
        rafMouseId = requestAnimationFrame(() => {
          mouseX.set(pendingX);
          mouseY.set(pendingY);
          rafMouseId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafMouseId) cancelAnimationFrame(rafMouseId);
    };
  }, [mouseX, mouseY, isReducedMotion]);

  // High-Performance Microscopic floating particle canvas (Zero software blur)
  useEffect(() => {
    if (isReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    let displayWidth = window.innerWidth;
    let displayHeight = window.innerHeight;

    const setupCanvas = () => {
      if (!canvas || !ctx) return;
      displayWidth = window.innerWidth;
      displayHeight = window.innerHeight;
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvas();

    window.addEventListener("resize", setupCanvas, { passive: true });

    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * displayWidth,
      y: Math.random() * displayHeight,
      size: Math.random() * 1.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.4 + 0.2,
      isCyan: Math.random() > 0.5,
    }));

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.6667, 3);
      lastTime = currentTime;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.speedX * dt;
        p.y += p.speedY * dt;

        if (p.x < 0) p.x = displayWidth;
        if (p.x > displayWidth) p.x = 0;
        if (p.y < 0) p.y = displayHeight;
        if (p.y > displayHeight) p.y = 0;

        const baseColor = p.isCyan ? "56, 189, 248" : "192, 132, 252";

        // Outer ambient glow (fast dual-pass circle instead of slow CPU shadowBlur)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity * 0.25})`;
        ctx.fill();

        // Core bright pin-point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [isReducedMotion]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none transform-gpu will-change-transform">
      {/* 1. Main Raw-Resolution 3D Glass Artwork with Silk Parallax */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute inset-[-2%] w-[104%] h-[104%] transform-gpu will-change-transform"
      >
        <Image
          src="/images/auth/auth-bg-ultra-v3.jpg"
          alt="JEE Pro 3D Glass Environment"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.01] brightness-[1.03] contrast-[1.04]"
        />
      </motion.div>

      {/* 2. Microscopic Floating Particles Canvas (Zero Blending Penalty) */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0 w-full h-full opacity-70 pointer-events-none"
      />

      {/* 3. Anti-Banding Optical Film Grain (Zero-Cost GPU Cached Texture Tile) */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 w-full h-full opacity-[0.035] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
