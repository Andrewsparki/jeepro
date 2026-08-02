"use client";

import { ReactNode } from "react";
import { DashboardCard } from "./dashboard-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
}

export function StatCard({ title, value, icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <DashboardCard delay={delay} className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-muted/10 rounded-lg text-muted-foreground">
          {icon}
        </div>
      </div>
      
      <div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-1 font-medium", trend.isPositive ? "text-green-500" : "text-red-500")}>
            {trend.isPositive ? "+" : "-"}{trend.value} <span className="text-muted-foreground font-normal">from last week</span>
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
