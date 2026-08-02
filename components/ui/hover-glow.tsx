"use client";

import { motion } from "framer-motion";
import { useLighting } from "./lighting-provider";
import { cn } from "@/lib/utils";

export function HoverGlow({ 
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
      <motion.div
        className="absolute -inset-1 rounded-xl opacity-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-lg transition-all duration-500 group-hover:opacity-30"
        variants={{
          hover: { opacity: 0.3, scale: 1.05 }
        }}
      />
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}
