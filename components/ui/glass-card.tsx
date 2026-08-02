"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLighting } from "./lighting-provider";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function GlassCard({ children, className, interactive = false, ...props }: GlassCardProps) {
  const { isTouch } = useLighting();

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "overflow-hidden",
        className
      )}
      whileHover={
        interactive && !isTouch
          ? {
              y: -4,
              rotateX: 2,
              rotateY: -2,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              transition: { type: "spring", stiffness: 400, damping: 30 }
            }
          : undefined
      }
      {...props}
    >
      {/* 
        This pseudo-element creates the mouse-following highlight.
        Using background-attachment: fixed allows us to position the radial-gradient
        relative to the viewport (using our global --mouse-x/y vars) while it only
        renders inside this card!
      */}
      {!isTouch && (
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%) fixed`,
          }}
        />
      )}
      
      {/* Inner subtle highlight (glass rim) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 mix-blend-overlay z-0" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
