"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AuthBackground() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-precision mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 35, stiffness: 85, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches) return;
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const normalizedY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      mouseX.set(normalizedX * 8);
      mouseY.set(normalizedY * 6);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // High-DPI Microscopic floating particle canvas
  useEffect(() => {
    if (isReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    let displayWidth = window.innerWidth;
    let displayHeight = window.innerHeight;

    const setupCanvas = () => {
      if (!canvas || !ctx) return;
      displayWidth = window.innerWidth;
      displayHeight = window.innerHeight;
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    setupCanvas();

    window.addEventListener("resize", setupCanvas);

    const particleCount = 30;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * displayWidth,
      y: Math.random() * displayHeight,
      size: Math.random() * 1.4 + 0.6,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: (Math.random() - 0.5) * 0.12,
      opacity: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.5 ? "rgba(56, 189, 248," : "rgba(192, 132, 252,",
    }));

    const render = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = displayWidth;
        if (p.x > displayWidth) p.x = 0;
        if (p.y < 0) p.y = displayHeight;
        if (p.y > displayHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color.includes("56, 189, 248") ? "#38bdf8" : "#c084fc";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [isReducedMotion]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none transform-gpu will-change-transform">
      {/* 1. Main Raw-Resolution 3D Glass Artwork (Uncompressed & Pixel-Sharp) */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute inset-[-1.5%] w-[103%] h-[103%] transform-gpu"
      >
        <Image
          src="/images/auth/auth-bg-ultra-v3.jpg"
          alt="JEE Pro 3D Glass Environment"
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="object-cover object-center scale-[1.01] brightness-[1.03] contrast-[1.04] transition-transform duration-700 ease-out"
        />
      </motion.div>

      {/* 2. Microscopic High-DPI Floating Particles Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none"
      />

      {/* 3. Anti-Banding Optical Film Grain */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.022] pointer-events-none z-20 mix-blend-overlay">
        <filter id="crispGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#crispGrain)" />
      </svg>
    </div>
  );
}
