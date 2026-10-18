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
        "relative flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full p-[2px]",
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40 select-none",
        checked
          ? "bg-accent shadow-[0_0_12px_var(--accent-glow)]"
          : "bg-surface border border-border hover:bg-surface-hover"
      )}
    >
      <motion.div
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 32,
        }}
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full transition-colors",
          checked
            ? "bg-accent-foreground shadow-sm"
            : "bg-muted-foreground"
        )}
      />
    </motion.button>
  );
}
