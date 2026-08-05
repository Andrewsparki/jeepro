"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface AnimatedStatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  iconColorClass?: string;
  className?: string;
}

export function AnimatedStatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon,
  iconColorClass = "text-accent bg-accent/10 shadow-[0_0_15px_rgba(79,70,229,0.15)] border-accent/20",
  className
}: AnimatedStatCardProps) {
  return (
    <div className={cn("premium-card p-6 flex items-start gap-4 transition-all duration-500 hover:scale-[1.02]", className)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", iconColorClass)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <div className="flex items-baseline mt-1 text-foreground">
          {prefix && <span className="text-xl font-bold mr-1">{prefix}</span>}
          <h2 className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={value} />
          </h2>
          {suffix && <span className="text-xl font-bold ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="premium-card p-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-muted/20 animate-pulse shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 w-24 bg-muted/20 rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted/20 rounded animate-pulse" />
      </div>
    </div>
  );
}
