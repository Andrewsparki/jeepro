"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface LoopingCTAButtonProps {
  href: string;
  variant?: "gradient" | "white" | "glass";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: LucideIcon | "arrow" | "compass" | null;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function LoopingCTAButton({
  href,
  variant = "gradient",
  size = "md",
  children,
  icon = "arrow",
  className,
  onClick,
}: LoopingCTAButtonProps) {
  const sizeClasses = {
    sm: "h-10 px-5 text-xs",
    md: "h-12 px-7 text-sm",
    lg: "h-14 px-9 text-base",
  }[size];

  const renderIcon = () => {
    if (icon === "arrow") {
      return (
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="inline-flex items-center"
        >
          <ArrowRight className={cn(size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", variant === "white" ? "text-black stroke-[2.5]" : "text-white")} />
        </motion.span>
      );
    }

    if (icon === "compass") {
      return (
        <motion.span
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-flex items-center text-cyan-400"
        >
          <Compass className={cn(size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </motion.span>
      );
    }

    if (typeof icon === "function") {
      const CustomIcon = icon;
      return <CustomIcon className={cn(size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />;
    }

    return null;
  };

  return (
    <div className="relative inline-flex items-center justify-center group w-full sm:w-auto">
      {/* 1. Continuous Breathing Backlight Aura Halo */}
      {variant === "gradient" && (
        <motion.div
          animate={{
            scale: [1, 1.14, 1],
            opacity: [0.45, 0.8, 0.45],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.2,
            ease: "easeInOut",
          }}
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#C958FF] blur-xl -z-10 pointer-events-none"
        />
      )}

      {variant === "white" && (
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.2,
            ease: "easeInOut",
          }}
          className="absolute -inset-1 rounded-full bg-white/50 blur-xl -z-10 pointer-events-none"
        />
      )}

      {variant === "glass" && (
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-lg -z-10 pointer-events-none"
        />
      )}

      {/* 2. Interactive Physical Button Capsule */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className="w-full sm:w-auto inline-flex"
      >
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full font-bold select-none overflow-hidden transition-all duration-300",
            sizeClasses,
            variant === "gradient" && "bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#7257FF] text-white shadow-[0_0_30px_rgba(30,167,255,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_45px_rgba(114,87,255,0.7)] border border-white/20",
            variant === "white" && "bg-white hover:bg-slate-50 text-black shadow-[0_0_30px_rgba(255,255,255,0.4),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:shadow-[0_0_45px_rgba(255,255,255,0.7)] border border-white",
            variant === "glass" && "bg-white/[0.07] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/[0.16] hover:border-white/30 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]",
            className
          )}
        >
          {/* 3. Continuous Diagonal Surface Light Sheen Glint */}
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-250%", "350%"] }}
            transition={{
              repeat: Infinity,
              repeatDelay: 2.2,
              duration: 1.9,
              ease: "easeInOut",
            }}
            className={cn(
              "absolute top-0 bottom-0 w-24 skew-x-12 pointer-events-none -z-0",
              variant === "white"
                ? "bg-gradient-to-r from-transparent via-black/10 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/35 to-transparent"
            )}
          />

          {/* Text Content */}
          <span className="relative z-10">{children}</span>

          {/* Animated Icon */}
          <span className="relative z-10">{renderIcon()}</span>
        </Link>
      </motion.div>
    </div>
  );
}
