"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MilestoneProgressBarProps {
  progressPercentage: number;
  currentProgress?: number;
  requirementValue?: number;
  label?: string;
  showLabels?: boolean;
  className?: string;
}

export function MilestoneProgressBar({
  progressPercentage,
  currentProgress,
  requirementValue,
  label,
  showLabels = true,
  className,
}: MilestoneProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedPercentage = Math.min(100, Math.max(0, progressPercentage));

  // Determine threshold markers if requirementValue is a small integer (e.g. 2 to 10)
  // Otherwise default to 25%, 50%, 75% subtle tick notches
  const thresholdPercentages = React.useMemo(() => {
    if (requirementValue && requirementValue >= 2 && requirementValue <= 10) {
      const step = 100 / requirementValue;
      const markers: number[] = [];
      for (let i = 1; i < requirementValue; i++) {
        markers.push(Math.round(step * i));
      }
      return markers;
    }
    return [25, 50, 75];
  }, [requirementValue]);

  return (
    <div className={cn("space-y-1.5 w-full select-none", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-muted-foreground">
          <span className="truncate">
            {label ||
              (currentProgress !== undefined && requirementValue !== undefined
                ? `${currentProgress.toLocaleString()} / ${requirementValue.toLocaleString()}`
                : "Progress")}
          </span>
          <span className="font-bold text-accent">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}

      {/* Main Track Container */}
      <div className="relative h-2.5 w-full rounded-full bg-background/80 dark:bg-black/40 border border-border/50 shadow-inner overflow-hidden p-[1px]">
        {/* Threshold Markers */}
        <div className="absolute inset-0 flex items-center pointer-events-none z-10 px-0.5">
          {thresholdPercentages.map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-[1.5px] bg-border/40 dark:bg-white/10"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        {/* Animated Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0.1 }
              : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }
          }
          className="relative h-full rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent shadow-[0_0_10px_rgba(79,70,229,0.35)] dark:shadow-[0_0_12px_rgba(99,102,241,0.4)]"
        >
          {/* Polished Leading Edge Finish */}
          {clampedPercentage > 0 && (
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/90 rounded-r-full shadow-[0_0_6px_rgba(255,255,255,0.9)] opacity-90" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
