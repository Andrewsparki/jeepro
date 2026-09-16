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
          className="absolute -inset-0.5 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 -z-10 pointer-events-none"
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
            "relative w-full sm:w-auto inline-flex items-center justify-center rounded-full font-semibold select-none transition-all duration-200",
            sizeClasses,
            // Primary Gradient: Deep, rich luxury indigo-blue (Apple/Linear style)
            variant === "aurora" && [
              "bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f46e5] text-white",
              "border border-white/20 hover:border-white/35",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(37,99,235,0.35)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(79,70,229,0.45)]",
            ],
            // Solid White Variant: Crisp, ultra-clean high-contrast
            variant === "electric-white" && [
              "bg-white hover:bg-slate-100 text-slate-950 font-semibold",
              "border border-white/90",
              "shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_12px_rgba(255,255,255,0.2)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_20px_rgba(255,255,255,0.35)]",
            ],
            // Secondary Dark Glass: Crisp smoked acrylic glass with subtle top highlight
            variant === "neon-glass" && [
              "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white",
              "border border-white/[0.12] hover:border-white/[0.22] backdrop-blur-xl",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)]",
            ],
            className
          )}
        >
          {/* Button Text */}
          <span className="relative z-10 tracking-[-0.01em]">{children}</span>

          {/* Micro-Icon */}
          {isSecondary ? (
            <Compass className="relative z-10 w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors duration-200" />
          ) : (
            <ArrowRight
              className={cn(
                "relative z-10 w-3.5 h-3.5 stroke-[2.2] group-hover:translate-x-0.5 transition-transform duration-200",
                variant === "electric-white" ? "text-slate-950" : "text-white"
              )}
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
}
