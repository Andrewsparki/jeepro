"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}

export function BorderBeam({
  className,
  duration = 8,
  colorFrom = "#38bdf8",
  colorTo = "#c084fc",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div 
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden -z-0", className)}
      style={{ padding: `${borderWidth}px` }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
        }}
        className="absolute -top-[150%] -left-[150%] w-[400%] h-[400%]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 290deg, ${colorFrom} 330deg, ${colorTo} 355deg, transparent 360deg)`,
        }}
      />
      {/* Inner Mask that ensures the card body remains dark & frosted */}
      <div 
        className="absolute inset-[1.5px] rounded-[inherit] bg-[#070E1E]/90 backdrop-blur-2xl -z-10" 
      />
    </div>
  );
}
