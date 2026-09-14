"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function PremiumSwitch({ checked, onChange, disabled = false }: PremiumSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[#22c55e]" : "bg-white/15 border border-white/10"
      )}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0"
      />
    </button>
  );
}
