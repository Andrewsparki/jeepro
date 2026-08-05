"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: "circle" | "rounded";
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, variant = "circle", className, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onCheckedChange?.(!checked);
        }}
        className={cn(
          "w-5 h-5 flex items-center justify-center border transition-all duration-200 cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          variant === "circle" ? "rounded-full" : "rounded-lg",
          checked
            ? "bg-accent border-accent text-white shadow-[0_0_12px_rgba(79,70,229,0.4)] scale-105"
            : "bg-white/5 border-white/20 hover:border-white/40 text-transparent hover:bg-white/10",
          className
        )}
        {...props}
      >
        <Check className={cn("w-3.5 h-3.5 stroke-[3] transition-transform duration-200", checked ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";
