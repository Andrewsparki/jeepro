"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TiltWrapper } from "@/components/ui/tilt-wrapper";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const DashboardCard = React.memo(function DashboardCard({ children, className, delay = 0 }: DashboardCardProps) {
  return (
    <TiltWrapper className={cn("tilt-card glass", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-border/40 bg-[#0a0a0a]/80 p-6 shadow-sm transition-[border-color] hover:border-border/60",
          // any additional className already applied via TiltWrapper
        )}
      >
        {children}
      </motion.div>
    </TiltWrapper>
  );
});
