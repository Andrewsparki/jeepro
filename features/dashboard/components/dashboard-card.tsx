"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function DashboardCard({ children, className, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-md hover:border-border/60",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
