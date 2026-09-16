"use client";

import React, { useRef, useState, useCallback } from "react";
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
  glowColor = "rgba(14, 165, 233, 0.22)",
  tiltAmount = 5,
  ...props
}: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--spot-x", `${Math.round(x)}px`);
    cardRef.current.style.setProperty("--spot-y", `${Math.round(y)}px`);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const normX = (x / rect.width) - 0.5;
      const normY = (y / rect.height) - 0.5;
      const rotX = -normY * tiltAmount;
      const rotY = normX * tiltAmount;
      setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`);
    });
  }, [tiltAmount]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
        willChange: isHovered ? "transform" : "auto",
      }}
      className={cn(
        "relative w-full h-full rounded-[32px] overflow-hidden transform-gpu",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight via native GPU radial shader */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(420px circle at var(--spot-x, -500px) var(--spot-y, -500px), ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Card Inner Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
