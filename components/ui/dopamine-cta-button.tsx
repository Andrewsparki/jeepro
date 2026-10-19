"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface DopamineCTAButtonProps {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "aurora" | "electric-white" | "neon-glass";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function DopamineCTAButton({
  href,
  children,
  size = "md",
  variant = "aurora",
  className,
  onClick,
}: DopamineCTAButtonProps) {
  const sizeClasses = {
    sm: "h-9 px-4 text-xs gap-2",
    md: "h-11 px-6 text-sm gap-2.5",
    lg: "h-13 px-8 text-base gap-3",
  }[size];

  const isSecondary = variant === "neon-glass";

  return (
    <div className="relative inline-flex items-center justify-center group w-full sm:w-auto">
      {/* Subtle Ambient Backlight - Refined & Non-distracting */}
      {variant === "aurora" && (
        <div
          aria-hidden="true"
          className="absolute -inset-0.5 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300 bg-gradient-to-r from-accent to-secondary-accent -z-10 pointer-events-none"
        />
      )}
      {variant === "electric-white" && (
        <div
          aria-hidden="true"
          className="absolute -inset-0.5 rounded-full blur-md opacity-25 group-hover:opacity-50 transition-opacity duration-300 bg-white -z-10 pointer-events-none"
        />
      )}

      {/* Main Interactive Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-full sm:w-auto inline-flex"
      >
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "relative w-full sm:w-auto inline-flex items-center justify-center rounded-full font-semibold select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            sizeClasses,
            // Primary Gradient: Dynamic Theme Accent
            variant === "aurora" && [
              "bg-accent hover:bg-accent-hover text-accent-foreground font-bold",
              "border border-accent/60 hover:border-accent",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_12px_var(--accent-glow)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_22px_var(--accent-glow)]",
            ],
            // Solid Warm White Variant: Crisp, ultra-clean high-contrast
            variant === "electric-white" && [
              "bg-foreground hover:bg-foreground/90 text-background font-semibold",
              "border border-foreground/90",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_12px_var(--accent-glow)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_20px_var(--accent-glow)]",
            ],
            // Secondary Dark Glass: Crisp smoked acrylic glass with subtle top highlight
            variant === "neon-glass" && [
              "bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground",
              "border border-border hover:border-white/20 backdrop-blur-xl",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.3)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]",
            ],
            className
          )}
        >
          {/* Button Text */}
          <span className="relative z-10 tracking-[-0.01em]">{children}</span>

          {/* Micro-Icon */}
          {isSecondary ? (
            <Compass className="relative z-10 w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
          ) : (
            <ArrowRight
              className={cn(
                "relative z-10 w-3.5 h-3.5 stroke-[2.2] group-hover:translate-x-0.5 transition-transform duration-200",
                variant === "aurora" || variant === "electric-white" ? "text-accent-foreground" : "text-foreground"
              )}
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
}
