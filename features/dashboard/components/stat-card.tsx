"use client";

import React, { ReactNode } from "react";
import { DashboardCard } from "./dashboard-card";
import { cn } from "@/lib/utils";
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
  const widgetId = title.toLowerCase().includes("time")
    ? "stat-time"
    : title.toLowerCase().includes("topic")
      ? "stat-topics"
      : title.toLowerCase().includes("streak")
        ? "stat-streak"
        : "stat-level";

  return (
    <DashboardCard
      delay={delay}
      hoverTint={hoverTint}
      className={cn("h-full cursor-default rounded-2xl bg-[#090C15] border border-white/[0.08]", className)}
      contentClassName="p-4 sm:p-5 h-full flex flex-col justify-between"
      data-context-target="dashboard-widget"
      data-context-id={widgetId}
      data-context-title={title}
      data-context-data={JSON.stringify({ widget: widgetId })}
    >
      <div className="flex items-start justify-between gap-2.5 relative z-10 min-h-[40px]">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 line-clamp-2 leading-snug">
          {title}
        </h3>
        <div
          className={cn(
            "w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 flex items-center justify-center shrink-0",
            iconContainerClassName
          )}
        >
          {icon}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-2">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-baseline">
          {value}
        </div>
        {trend && (
          <p className={cn("text-[11px] font-mono mt-1.5 font-medium flex items-center gap-1", trend.isPositive ? "text-emerald-400" : "text-rose-400")}>
            <span className={cn("px-1.5 py-0.5 rounded", trend.isPositive ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20")}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-zinc-400">vs last week</span>
          </p>
        )}
      </div>
    </DashboardCard>
  );
});
