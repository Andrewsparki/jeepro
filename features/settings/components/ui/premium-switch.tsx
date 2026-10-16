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
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D12]",
        "disabled:cursor-not-allowed disabled:opacity-40 select-none",
        checked
          ? "bg-[#78A9FF] shadow-[0_0_12px_rgba(120,169,255,0.35)]"
          : "bg-[#171D28] border border-[#2B3342] hover:bg-[#1C2331]"
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
            ? "bg-[#0B0D12] shadow-sm"
            : "bg-[#A4ADBB]"
        )}
      />
    </motion.button>
  );
}
