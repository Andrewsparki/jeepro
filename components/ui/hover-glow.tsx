"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLighting } from "./lighting-provider";

export const HoverGlow = React.memo(function HoverGlow({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { isTouch } = useLighting();

  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover="hover"
    >
      {/* Pre-blurred gradient bg — only animate opacity, not blur */}
      <motion.div
        className="absolute -inset-1 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-[0.25]"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)",
        }}
        variants={{
          hover: { opacity: 0.25, scale: 1.05 }
        }}
      />
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
});
