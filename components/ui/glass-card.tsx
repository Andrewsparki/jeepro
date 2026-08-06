"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLighting } from "./lighting-provider";
import { usePerformance } from "@/lib/performance-context";

export type HoverTint = "blue" | "emerald" | "amber" | "orange" | "purple" | "yellow" | "none";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
  hoverTint?: HoverTint;
}

const tintClassMap: Record<string, string> = {
  blue: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/20",
  emerald: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/20",
  amber: "hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:border-amber-500/20",
  orange: "hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] hover:border-orange-500/20",
  purple: "hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:border-purple-500/20",
  yellow: "hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)] hover:border-yellow-500/20",
  none: "hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]",
};

export const GlassCard = React.memo(function GlassCard({
  children,
  className,
  interactive,
  hoverTint,
  style,
  ...props
}: GlassCardProps) {
  const tintClass = hoverTint && hoverTint !== "none" ? tintClassMap[hoverTint] : "hover:shadow-[0_8px_30px_rgba(var(--accent),0.1)] hover:border-white/10";

  return (
    <motion.div
      whileHover={interactive || hoverTint !== "none" ? { y: -4 } : {}}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative premium-card overflow-hidden transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        tintClass,
        className
      )}
      style={style}
      {...props}
    >
      {/* Content */}
      {children}
    </motion.div>
  );
});
