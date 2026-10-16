"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  color?: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[] | SegmentedOption<T>[];
  layoutId: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex items-center p-1 rounded-lg bg-[#141923] border border-[#2B3342]/80", className)}>
      {options.map(({ id, label, color }) => {
        const isSelected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all select-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#78A9FF]",
              isSelected ? "text-[#F5F7FB] font-semibold" : "text-[#A4ADBB] hover:text-[#F5F7FB]"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-md bg-[#222938] border border-[#78A9FF]/30 shadow-xs pointer-events-none"
              />
            )}
            {color && (
              <span
                className="relative z-10 w-2 h-2 rounded-full border border-black/40 shrink-0"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
