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
    <TiltWrapper className={cn("premium-card transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-medium group", className)}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className="min-h-full w-full p-6 flex flex-col relative z-10"
      >
        {children}
      </motion.div>
    </TiltWrapper>
  );
});
