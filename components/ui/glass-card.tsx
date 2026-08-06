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
  blue: "from-blue-500/10",
  emerald: "from-emerald-500/10",
  amber: "from-amber-500/10",
  orange: "from-orange-500/10",
  purple: "from-purple-500/10",
  yellow: "from-yellow-500/10",
  none: "",
};

export const GlassCard = React.memo(function GlassCard({
  children,
  className,
  interactive,
  hoverTint,
  style,
  ...props
}: GlassCardProps) {
  const tintClass = hoverTint && hoverTint !== "none" ? tintClassMap[hoverTint] : "from-accent/10";

  return (
    <motion.div
      className={cn(
        "relative premium-card overflow-hidden group",
        className
      )}
      style={style}
      {...props}
    >
      {/* Universal Hover Tint */}
      {hoverTint !== "none" && (
        <div 
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0",
            tintClass
          )}
        />
      )}
      
      {/* Content */}
      {children}
    </motion.div>
  );
});
