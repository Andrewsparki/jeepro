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
        "relative premium-card overflow-hidden transition-all duration-200 ease-out",
        className
      )}
      style={{
        ...(shouldAnimate ? { willChange: "transform, border-color, box-shadow" } : {}),
        ...style,
      }}
      whileHover={
        shouldAnimate
          ? {
              y: -2,
              borderColor: "rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 12px 32px rgba(0,0,0,0.4)",
              transition: { type: "tween", duration: 0.2, ease: "easeOut" }
            }
          : undefined
      }
      {...props}
    >
      {/* Ultra-soft mouse-following highlight */}
      {!isTouch && enableMouseLighting && (
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.03), transparent 40%) fixed`,
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
