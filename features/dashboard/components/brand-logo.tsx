"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

/**
 * Clean, Ultra-Minimalist Precision Brandmark
 * Designed like Linear, Vercel, Raycast, and Stripe:
 * - Monolithic dark square with sharp hairline border
 * - Pure, minimal geometric J mark in crisp white
 * - Clean sans-serif typography "JEE PRO" with zero flashy effects
 */
export function BrandLogo({
  className,
  size = "md",
  showText = true,
}: BrandLogoProps) {
  const shouldReduceMotion = useReducedMotion();

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { opacity: 0.85 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={cn("flex items-center gap-2.5 select-none cursor-pointer", className)}
    >
      {/* Minimal Monochrome Monogram */}
      <div
        className={cn(
          "rounded-md bg-foreground text-background flex items-center justify-center shrink-0 font-black tracking-tight",
          iconSizes[size]
        )}
      >
        <span className="text-[13px] leading-none select-none font-bold">J</span>
      </div>

      {/* Clean, Simple, Confident Brand Text */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-[14px] tracking-tight text-foreground">
            JEE PRO
          </span>
        </div>
      )}
    </motion.div>
  );
}
