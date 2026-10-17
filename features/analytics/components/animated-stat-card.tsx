"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { GlassCard, HoverTint } from "@/components/ui/glass-card";
import { ContextMenuTarget } from "@/features/context-menu";
import { motion, useReducedMotion } from "framer-motion";

interface AnimatedStatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  iconColorClass?: string;
  className?: string;
  hoverTint?: HoverTint;
  delay?: number;
  subtext?: string;
  badge?: string;
}

export function AnimatedStatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon,
  iconColorClass = "text-accent bg-accent/10 shadow-[0_0_15px_rgba(120,169,255,0.2)] border-accent/20",
  className,
  hoverTint,
  delay = 0,
  subtext,
  badge
}: AnimatedStatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ContextMenuTarget
      type="analytics-chart"
      id={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
      title={title}
      data={{
        title,
        value: `${prefix}${value}${suffix}`,
      }}
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: shouldReduceMotion ? 0 : delay,
          duration: shouldReduceMotion ? 0.1 : 0.48,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="h-full w-full"
      >
        <GlassCard 
          hoverTint={hoverTint} 
          className={cn(
            "p-5 sm:p-6 flex flex-col justify-between h-[160px] cursor-default relative overflow-hidden border-t border-t-white/10 dark:border-t-white/15 shadow-sm group",
            className
          )}
        >
          {/* Subtle cinematic light-sweep sheen on entrance */}
          {!shouldReduceMotion && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "240%", opacity: [0, 0.45, 0] }}
              transition={{
                delay: delay + 0.35,
                duration: 0.95,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 dark:via-[#78A9FF]/15 to-transparent -skew-x-12 pointer-events-none z-20"
            />
          )}

          {/* Header Row: Icon & Badge */}
          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105", iconColorClass)}>
              {icon}
            </div>
            {badge && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>

          {/* Metric Details */}
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 font-mono flex items-center justify-between">
              <span>{title}</span>
            </p>
            <div className="flex items-baseline text-foreground">
              {prefix && <span className="text-xl font-bold mr-1 text-muted-foreground">{prefix}</span>}
              <h2 className="text-3xl font-extrabold tracking-tight">
                <AnimatedNumber value={value} />
              </h2>
              {suffix && <span className="text-lg font-bold ml-1 text-muted-foreground">{suffix}</span>}
            </div>

            {subtext && (
              <p className="text-xs text-muted-foreground/80 mt-1 truncate font-medium">
                {subtext}
              </p>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </ContextMenuTarget>
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
