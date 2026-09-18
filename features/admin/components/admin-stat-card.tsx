"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Users, Activity, Clock, BookOpen, Shield, Bell, Zap, Flag, LifeBuoy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ADMIN_EASE_FLUID } from "./motion";

export type AdminStatIconKey =
  | "users"
  | "activity"
  | "clock"
  | "book-open"
  | "shield"
  | "bell"
  | "zap"
  | "flag"
  | "life-buoy";

const ICON_MAP: Record<AdminStatIconKey, LucideIcon> = {
  users: Users,
  activity: Activity,
  clock: Clock,
  "book-open": BookOpen,
  shield: Shield,
  bell: Bell,
  zap: Zap,
  flag: Flag,
  "life-buoy": LifeBuoy,
};

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: AdminStatIconKey | LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
  index?: number;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  iconColor = "text-amber-400",
  iconBg = "bg-amber-500/10",
  delay,
  index = 0,
}: AdminStatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const animationDelay = delay !== undefined ? delay : index * 0.05;

  const IconComponent = typeof icon === "string" ? ICON_MAP[icon] || Users : icon;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2, ease: ADMIN_EASE_FLUID } }}
      transition={{
        duration: 0.35,
        delay: shouldReduceMotion ? 0 : animationDelay,
        ease: ADMIN_EASE_FLUID,
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-[border-color,background-color,box-shadow] duration-200 hover:border-white/[0.12] hover:bg-white/[0.035] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] select-none",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-400">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono",
                  trend.value >= 0
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                )}
              >
                {trend.value >= 0 ? "+" : ""}{trend.value}
              </span>
              <span className="text-[11px] text-zinc-400">{trend.label}</span>
            </div>
          )}
        </div>

        {/* Ambient Pulsing Icon Housing */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border border-white/[0.06] transition-transform duration-200 group-hover:scale-105 shrink-0",
            iconBg
          )}
        >
          <IconComponent className={cn("w-5 h-5", iconColor)} />
        </motion.div>
      </div>

      {/* Subtle responsive hover glow gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/[0.015] blur-xl group-hover:bg-white/[0.03] transition-colors duration-300" />
    </motion.div>
  );
}
