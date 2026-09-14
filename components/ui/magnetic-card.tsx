"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltAmount?: number;
}

export function MagneticCard({
  children,
  className,
  glowColor = "rgba(14, 165, 233, 0.18)",
  tiltAmount = 6,
  ...props
}: MagneticCardProps) {
  // Static container ref for stable, non-deforming bounding box measurements
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position normalized (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Pixel coordinates for radial spotlight (scaled to internal CSS pixels)
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);

  // Smooth spring physics for 120 FPS buttery tilt
  const springConfig = { damping: 22, stiffness: 220, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Account for CSS zoom (e.g. html { zoom: 77% }) or browser scaling
    const offsetW = containerRef.current.offsetWidth || rect.width || 1;
    const offsetH = containerRef.current.offsetHeight || rect.height || 1;
    const scaleX = rect.width / offsetW;
    const scaleY = rect.height / offsetH;

    // Calculate unscaled internal CSS pixel coordinates for spotlight
    const x = (e.clientX - rect.left) / (scaleX || 1);
    const y = (e.clientY - rect.top) / (scaleY || 1);

    spotX.set(x);
    spotY.set(y);

    // Calculate normalized coordinate (-0.5 to 0.5) for 3D tilt
    const normX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
    const normY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
    
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full [perspective:1000px]"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative w-full h-full rounded-[32px] overflow-hidden transition-shadow duration-300 transform-gpu",
          className
        )}
        {...(props as any)}
      >
        {/* 1. Dynamic Magnetic Cursor Spotlight (Zoom-Corrected) */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[32px] transition-opacity duration-200 z-30"
          style={{
            opacity: isHovered ? 1 : 0,
            background: useTransform(
              [spotX, spotY],
              ([x, y]) =>
                `radial-gradient(450px circle at ${x}px ${y}px, ${glowColor}, transparent 75%)`
            ),
          }}
        />

        {/* 2. Magnetic Specular Border Glare (Zoom-Corrected) */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[32px] transition-opacity duration-200 z-30"
          style={{
            opacity: isHovered ? 1 : 0,
            background: useTransform(
              [spotX, spotY],
              ([x, y]) =>
                `radial-gradient(320px circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 60%)`
            ),
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        {/* 3. Card Inner Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
