import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  iconColor?: string;
  iconBg?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconColor = "text-amber-400",
  iconBg = "bg-amber-500/10",
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
            </p>
          )}
        </div>
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>

      {/* Subtle highlight gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
    </div>
  );
}
