"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface StatusBadgeProps {
  status: "online" | "maintenance" | "offline";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG = {
  online: {
    label: "Online",
    dotColor: "bg-emerald-400",
    pingColor: "bg-emerald-400/40",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.12)]",
  },
  maintenance: {
    label: "Maintenance",
    dotColor: "bg-amber-400",
    pingColor: "bg-amber-400/40",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]",
  },
  offline: {
    label: "Offline",
    dotColor: "bg-rose-400",
    pingColor: "bg-rose-400/40",
    textColor: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.15)]",
  },
};

const SIZE_CONFIG = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-xs font-semibold",
};

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full font-medium border select-none transition-colors duration-200",
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.glow,
        SIZE_CONFIG[size],
        className
      )}
    >
      {/* Precision Dual-Ring Live Radar Indicator */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        {!shouldReduceMotion && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full animate-ping opacity-75",
              config.pingColor
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5 shadow-sm",
            config.dotColor
          )}
        />
      </span>

      <span className="tracking-wide">{config.label}</span>
    </motion.span>
  );
}
