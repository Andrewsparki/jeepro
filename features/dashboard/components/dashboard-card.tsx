"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GlassCard, HoverTint } from "@/components/ui/glass-card";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverTint?: HoverTint;
}

export const DashboardCard = React.memo(function DashboardCard({ children, className, delay = 0, hoverTint }: DashboardCardProps) {
  return (
    <GlassCard hoverTint={hoverTint} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className="min-h-full w-full p-6 flex flex-col relative z-10"
      >
        {children}
      </motion.div>
    </GlassCard>
  );
});
