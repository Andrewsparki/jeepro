"use client";

import React, { ReactNode } from "react";
import { HTMLMotionProps } from "framer-motion";
import { GlassCard, HoverTint } from "@/components/ui/glass-card";

interface DashboardCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverTint?: HoverTint;
}

export const DashboardCard = React.memo(function DashboardCard({ children, className, hoverTint, ...props }: DashboardCardProps) {
  return (
    <GlassCard hoverTint={hoverTint} className={className} {...props}>
      <div className="min-h-full w-full p-6 flex flex-col relative z-10">
        {children}
      </div>
    </GlassCard>
  );
});
