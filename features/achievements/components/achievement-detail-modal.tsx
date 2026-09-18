"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Calendar,
  Layers,
} from "lucide-react";
import { AchievementItem, AchievementTier } from "../types/achievement.types";
import { MilestoneProgressBar } from "./milestone-progress-bar";
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

const TIER_COLORS: Record<AchievementTier, { text: string; bg: string; border: string; glow: string; label: string }> = {
  bronze: {
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_rgba(217,119,6,0.25)]",
    label: "Bronze Tier",
  },
  silver: {
    text: "text-slate-200",
    bg: "bg-slate-400/15",
    border: "border-slate-400/30",
    glow: "shadow-[0_0_30px_rgba(203,213,225,0.2)]",
    label: "Silver Tier",
  },
  gold: {
    text: "text-yellow-300",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_35px_rgba(234,179,8,0.3)]",
    label: "Gold Tier",
  },
  platinum: {
    text: "text-purple-300",
    bg: "bg-purple-500/15",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_35px_rgba(168,85,247,0.35)]",
    label: "Platinum Tier",
  },
};

interface AchievementDetailModalProps {
  achievement: AchievementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementDetailModal({
  achievement,
  isOpen,
  onClose,
}: AchievementDetailModalProps) {
  if (!achievement) return null;

  const IconComponent = ICON_MAP[achievement.icon] || Award;
  const tierInfo = TIER_COLORS[achievement.tier] || TIER_COLORS.bronze;

  const formatRequirement = () => {
    switch (achievement.requirement_type) {
      case "session_count":
        return `Complete ${achievement.requirement_value} focus study session${achievement.requirement_value > 1 ? "s" : ""}`;
      case "study_hours":
        return `Accumulate ${achievement.requirement_value} total focus study hour${achievement.requirement_value > 1 ? "s" : ""}`;
      case "streak_days":
        return `Maintain a continuous ${achievement.requirement_value}-day daily study streak`;
      case "topics_mastered":
        return `Master ${achievement.requirement_value} topic${achievement.requirement_value > 1 ? "s" : ""} across Physics, Chemistry, or Mathematics`;
      case "chapters_mastered":
        return `Master all topics across ${achievement.requirement_value} syllabus chapter${achievement.requirement_value > 1 ? "s" : ""}`;
      case "total_xp":
        return `Earn ${achievement.requirement_value.toLocaleString()} total experience points (XP)`;
      default:
        return `Reach requirement milestone of ${achievement.requirement_value}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{achievement.title}</DialogTitle>
          <DialogDescription>{achievement.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Radiant Icon Header */}
          <div className="relative">
            <div
              className={cn(
                "w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all",
                achievement.unlocked
                  ? cn(tierInfo.bg, tierInfo.border, tierInfo.glow)
                  : "bg-muted/40 border-border/40 text-muted-foreground"
              )}
            >
              {achievement.unlocked ? (
                <IconComponent className={cn("w-12 h-12", tierInfo.text)} />
              ) : (
                <Lock className="w-10 h-10 text-muted-foreground/70" />
              )}
            </div>

            {/* Status Stamp */}
            {achievement.unlocked && (
              <div className="absolute -bottom-2 -right-2 bg-background px-2 py-0.5 rounded-full border border-emerald-500/40 text-[11px] font-bold text-emerald-400 flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Earned
              </div>
            )}
          </div>

          {/* Title & Tier Badges */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                  tierInfo.bg,
                  tierInfo.border,
                  tierInfo.text
                )}
              >
                {tierInfo.label}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {achievement.category}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {achievement.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 max-w-sm">
              {achievement.description}
            </p>
          </div>

          {/* Requirement & Progress Card */}
          <div className="w-full p-4 rounded-xl bg-surface/50 border border-border/40 text-left space-y-3">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Requirement
              </p>
              <p className="text-xs font-semibold text-foreground leading-snug">
                {formatRequirement()}
              </p>
            </div>

            {/* Live Progress Bar */}
            <MilestoneProgressBar
              progressPercentage={achievement.progress_percentage}
              currentProgress={achievement.current_progress}
              requirementValue={achievement.requirement_value}
              label={`Current Progress (${achievement.current_progress.toLocaleString()} / ${achievement.requirement_value.toLocaleString()})`}
              className="pt-1 border-t border-border/30"
            />
          </div>

          {/* Reward & Unlock Info */}
          <div className="w-full grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-surface/40 border border-border/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                XP Reward
              </span>
              <span className="text-sm font-extrabold text-accent flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                +{achievement.xp_reward} XP
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface/40 border border-border/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {achievement.unlocked ? "Unlocked Date" : "Status"}
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5 truncate">
                {achievement.unlocked ? (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {achievement.unlocked_at
                      ? new Date(achievement.unlocked_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Completed"}
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    Locked
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Close Action */}
          <div className="w-full pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl border-border/50 text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
