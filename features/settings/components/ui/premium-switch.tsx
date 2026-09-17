"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function PremiumSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: PremiumSwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={cn(
        "relative flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-[2px]",
        "transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        "disabled:cursor-not-allowed disabled:opacity-40 select-none",
        checked
          ? "bg-[#34C759] shadow-[0_0_16px_rgba(52,199,89,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]"
          : "bg-muted border border-border hover:bg-muted/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:bg-white/[0.12] dark:border-white/10 dark:hover:bg-white/[0.16] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
      )}
    >
      <motion.div
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 35,
        }}
        className={cn(
          "pointer-events-none inline-block h-6 w-6 rounded-full bg-white",
          "shadow-[0_2px_6px_rgba(0,0,0,0.35),0_1px_1px_rgba(0,0,0,0.15)]",
          "border border-black/[0.04]"
        )}
      />
    </motion.button>
  );
}
