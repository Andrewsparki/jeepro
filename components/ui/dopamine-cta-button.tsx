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
    sm: "h-10 px-5 text-xs",
    md: "h-12 px-7 text-sm",
    lg: "h-14 px-9 text-base",
  }[size];

  const isSecondary = variant === "neon-glass";

  return (
    <div className="relative inline-flex items-center justify-center group w-full sm:w-auto">
      {/* 1. Ultra-Refined Soft Ambient Backlight Glow (Tasteful & Non-Cheap) */}
      {!isSecondary && (
        <motion.div
          animate={{
            opacity: [0.35, 0.55, 0.35],
            scale: [0.98, 1.04, 0.98],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute -inset-1 rounded-full blur-xl -z-10 pointer-events-none transition-opacity duration-500",
            variant === "aurora" && "bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-purple-500/40",
            variant === "electric-white" && "bg-white/40"
          )}
        />
      )}

      {/* 2. Main Physical Pill Button */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 450, damping: 26 }}
        className="w-full sm:w-auto inline-flex"
      >
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full font-bold select-none overflow-hidden transition-all duration-300",
            sizeClasses,
            // Primary Gradient Variant (Deep Electric Indigo/Cyan gradient with precision top specular edge)
            variant === "aurora" && [
              "bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#7257FF] text-white",
              "border border-white/20",
              "shadow-[0_4px_24px_rgba(30,167,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]",
              "hover:shadow-[0_6px_32px_rgba(114,87,255,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.6)]",
            ],
            // Solid White Variant (Apple / Linear style pure white physical capsule)
            variant === "electric-white" && [
              "bg-white hover:bg-slate-100 text-black font-extrabold",
              "border border-white",
              "shadow-[0_4px_24px_rgba(255,255,255,0.3),inset_0_1.5px_1px_rgba(255,255,255,1)]",
              "hover:shadow-[0_6px_36px_rgba(255,255,255,0.55)]",
            ],
            // Secondary Smoked Glass Variant (VisionOS style dark glass)
            variant === "neon-glass" && [
              "bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white",
              "border border-white/15 hover:border-white/25 backdrop-blur-2xl",
              "shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]",
            ],
            className
          )}
        >
          {/* 3. Subtle, Premium Glass Sheen Glint Sweep (Every 3.8s) */}
          <motion.div
            aria-hidden="true"
            animate={{
              x: ["-250%", "350%"],
            }}
            transition={{
              repeat: Infinity,
              repeatDelay: 2.5,
              duration: 1.8,
              ease: "easeInOut",
            }}
            className={cn(
              "absolute top-0 bottom-0 w-24 -skew-x-20 pointer-events-none -z-0",
              variant === "electric-white"
                ? "bg-gradient-to-r from-transparent via-black/[0.08] to-transparent"
                : "bg-gradient-to-r from-transparent via-white/25 to-transparent"
            )}
          />

          {/* Text Content */}
          <span className="relative z-10">{children}</span>

          {/* 4. Smooth Micro-Arrow or Compass */}
          {isSecondary ? (
            <Compass className="relative z-10 w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative z-10 inline-flex items-center group-hover:translate-x-0.5 transition-transform"
            >
              <ArrowRight className={cn("w-4 h-4 stroke-[2.5]", variant === "electric-white" ? "text-black" : "text-white")} />
            </motion.span>
          )}
        </Link>
      </motion.div>
    </div>
  );
}
