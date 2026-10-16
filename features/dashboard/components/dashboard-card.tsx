"use client";

import React, { ReactNode } from "react";
import { HTMLMotionProps } from "framer-motion";
import { GlassCard, HoverTint } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface DashboardCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  hoverTint?: HoverTint;
}

export const DashboardCard = React.memo(function DashboardCard({ children, className, contentClassName, hoverTint, ...props }: DashboardCardProps) {
  return (
    <GlassCard hoverTint={hoverTint} className={className} {...props}>
      <div className={cn("min-h-full w-full p-6 flex flex-col relative z-10", contentClassName)}>
        {children}
      </div>
    </GlassCard>
  );
});
