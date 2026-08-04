"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLighting } from "./lighting-provider";
import { usePerformance } from "@/lib/performance-context";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const GlassCard = React.memo(function GlassCard({
  children,
  className,
  interactive = false,
  style,
  ...props
}: GlassCardProps) {
  const { isTouch } = useLighting();
  const { enableMouseLighting, enableEntryAnimations } = usePerformance();

  const shouldAnimate = interactive && !isTouch && enableEntryAnimations;

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl bg-glass-strong",
        "shadow-medium",
        "overflow-hidden",
        className
      )}
      style={{
        ...(shouldAnimate ? { willChange: "transform" } : {}),
        ...style,
      }}
      whileHover={
        shouldAnimate
          ? {
              y: -2,
              rotateX: 0,
              rotateY: 0,
              boxShadow: "var(--shadow-strong)",
              transition: { type: "spring", stiffness: 400, damping: 30 }
            }
          : undefined
      }
      {...props}
    >
      {/* Mouse-following highlight using CSS vars from LightingProvider */}
      {!isTouch && enableMouseLighting && (
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%) fixed`,
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});
