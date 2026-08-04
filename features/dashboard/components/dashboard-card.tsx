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
        className="min-h-full w-full p-6 flex flex-col"
      >
        {children}
      </motion.div>
    </TiltWrapper>
  );
});
