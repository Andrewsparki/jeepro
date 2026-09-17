"use client";

import React from "react";
import {
  Play,
  Flame,
  Award,
  Trophy,
  Clock,
  Zap,
  Star,
  BookOpen,
  Target,
  CheckCircle2,
  Sparkles,
  Crown,
  Lock,
  LucideIcon,
} from "lucide-react";
import { AchievementItem, AchievementTier } from "../types/achievement.types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  play: Play,
  flame: Flame,
  award: Award,
  trophy: Trophy,
  clock: Clock,
  zap: Zap,
  star: Star,
  "book-open": BookOpen,
  target: Target,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
  crown: Crown,
};

const TIER_STYLES: Record<
  AchievementTier,
  {
    border: string;
    bg: string;
    text: string;
    glow: string;
    badge: string;
    label: string;
  }
> = {
  bronze: {
    border: "border-amber-600/30 group-hover:border-amber-500/60",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-[0_0_20px_rgba(217,119,6,0.15)]",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    label: "Bronze",
  },
  silver: {
    border: "border-slate-400/30 group-hover:border-slate-300/60",
    bg: "bg-slate-400/10",
    text: "text-slate-700 dark:text-slate-200",
    glow: "shadow-[0_0_20px_rgba(203,213,225,0.15)]",
    badge: "bg-slate-400/15 text-slate-700 dark:text-slate-200 border-slate-400/30",
    label: "Silver",
  },
  gold: {
    border: "border-yellow-500/35 group-hover:border-yellow-400/70",
    bg: "bg-yellow-500/10",
    text: "text-amber-600 dark:text-yellow-400",
    glow: "shadow-[0_0_25px_rgba(234,179,8,0.2)]",
    badge: "bg-yellow-500/15 text-amber-700 dark:text-yellow-300 border-yellow-500/30",
    label: "Gold",
  },
  platinum: {
    border: "border-purple-500/35 group-hover:border-purple-400/70",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-300",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.25)]",
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    label: "Platinum",
  },
};

interface AchievementCardProps {
  achievement: AchievementItem;
  onClick: (achievement: AchievementItem) => void;
}

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Award;
  const tierStyle = TIER_STYLES[achievement.tier] || TIER_STYLES.bronze;

  const formatProgressLabel = () => {
    switch (achievement.requirement_type) {
      case "session_count":
        return `${achievement.current_progress} / ${achievement.requirement_value} sessions`;
      case "study_hours":
        return `${achievement.current_progress} / ${achievement.requirement_value} hrs`;
      case "streak_days":
        return `${achievement.current_progress} / ${achievement.requirement_value} days`;
      case "topics_mastered":
        return `${achievement.current_progress} / ${achievement.requirement_value} topics`;
      case "chapters_mastered":
        return `${achievement.current_progress} / ${achievement.requirement_value} chapters`;
      case "total_xp":
        return `${achievement.current_progress.toLocaleString()} / ${achievement.requirement_value.toLocaleString()} XP`;
      default:
        return `${achievement.current_progress} / ${achievement.requirement_value}`;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(achievement)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(achievement);
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        achievement.unlocked
          ? cn("bg-surface/60 hover:bg-surface/90 hover:-translate-y-1 backdrop-blur-md", tierStyle.border, tierStyle.glow)
          : "bg-surface/30 border-border/40 hover:border-border/70 hover:bg-surface/50 opacity-80 hover:opacity-100"
      )}
    >
      {/* Ambient Radial Gradient Accent */}
      {achievement.unlocked && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none -z-10",
            tierStyle.bg
          )}
        />
      )}

      {/* Top Row: Icon, Tier Badge, Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Icon Badge */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105",
              achievement.unlocked
                ? cn(tierStyle.bg, tierStyle.text, tierStyle.border)
                : "bg-muted/40 text-muted-foreground border-border/40"
            )}
          >
            {achievement.unlocked ? (
              <IconComponent className="w-6 h-6" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground/70" />
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Tier Pill */}
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                tierStyle.badge
              )}
            >
              {tierStyle.label}
            </span>

            {/* XP Reward */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
              +{achievement.xp_reward} XP
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3
          className={cn(
            "text-sm sm:text-base font-bold tracking-tight mb-1 truncate",
            achievement.unlocked ? "text-foreground" : "text-foreground/80"
          )}
        >
          {achievement.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {achievement.description}
        </p>
      </div>

      {/* Bottom Section: Progress Bar or Unlock Timestamp */}
      <div className="mt-auto pt-2 border-t border-border/30">
        {achievement.unlocked ? (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
            <span>
              {achievement.unlocked_at
                ? new Date(achievement.unlocked_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unlocked"}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
              <span>{formatProgressLabel()}</span>
              <span>{Math.round(achievement.progress_percentage)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, achievement.progress_percentage))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
