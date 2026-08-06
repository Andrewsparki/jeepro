"use client";

import React, { ReactNode } from "react";
import { DashboardCard } from "./dashboard-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HoverTint } from "@/components/ui/glass-card";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  iconContainerClassName?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
  hoverTint?: HoverTint;
}

export const StatCard = React.memo(function StatCard({ title, value, icon, iconContainerClassName, trend, delay = 0, className, hoverTint }: StatCardProps) {
  return (
    <DashboardCard delay={delay} hoverTint={hoverTint} className={cn("flex flex-col gap-5 overflow-hidden relative cursor-default", className)}>
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "p-2 rounded-xl border",
            iconContainerClassName || "p-2 bg-accent/10 border-accent/20 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)]"
          )}
        >
          {icon}
        </motion.div>
      </div>
      
      <div className="relative z-10 mt-auto">
        <div className="text-3xl sm:text-4xl font-bold tracking-tighter text-foreground">{value}</div>
        {trend && (
          <p className={cn("text-[11px] mt-1.5 font-semibold flex items-center gap-1", trend.isPositive ? "text-success" : "text-danger")}>
            <span className={cn("px-1 rounded-sm", trend.isPositive ? "bg-success/15" : "bg-danger/15")}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-muted-foreground font-medium">vs last week</span>
          </p>
        )}
      </div>
    </DashboardCard>
  );
});
