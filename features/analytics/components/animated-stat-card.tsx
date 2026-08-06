"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { GlassCard, HoverTint } from "@/components/ui/glass-card";

interface AnimatedStatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  iconColorClass?: string;
  className?: string;
  hoverTint?: HoverTint;
}

export function AnimatedStatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon,
  iconColorClass = "text-accent bg-accent/10 shadow-[0_0_15px_rgba(79,70,229,0.15)] border-accent/20",
  className,
  hoverTint
}: AnimatedStatCardProps) {
  return (
    <GlassCard hoverTint={hoverTint} className={cn("p-6 flex flex-col justify-between h-[150px] cursor-default", className)}>
      <div className={cn("relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mb-4", iconColorClass)}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline text-foreground">
          {prefix && <span className="text-xl font-bold mr-1">{prefix}</span>}
          <h2 className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={value} />
          </h2>
          {suffix && <span className="text-xl font-bold ml-1">{suffix}</span>}
        </div>
      </div>
    </GlassCard>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="premium-card p-6 flex flex-col justify-between h-[150px]">
      <div className="w-10 h-10 rounded-xl bg-muted/20 animate-pulse shrink-0 mb-4" />
      <div className="space-y-2">
        <div className="h-3.5 w-24 bg-muted/20 rounded animate-pulse" />
        <div className="h-7 w-16 bg-muted/20 rounded animate-pulse" />
      </div>
    </div>
  );
}
