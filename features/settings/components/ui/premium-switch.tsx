"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePerformance } from "@/lib/performance-context";

interface PremiumSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function PremiumSwitch({ checked, onChange, disabled = false }: PremiumSwitchProps) {
  const { mode } = usePerformance();
  const reduceMotion = mode === "battery-saver";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary border border-primary/20" : "bg-surface-hover border border-glass-border shadow-inner"
      )}
    >
      {/* Background glow when checked */}
      {!reduceMotion && checked && (
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm" />
      )}
      
      <motion.div
        layout={!reduceMotion}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={cn(
          "pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      >
        {/* Subtle inner detail on the thumb */}
        <div className="absolute inset-0 rounded-full border border-black/5" />
      </motion.div>
    </button>
  );
}
