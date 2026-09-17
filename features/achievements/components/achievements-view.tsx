"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Clock,
  Flame,
  Target,
  Sparkles,
  RefreshCw,
  Search,
  Lock,
  Layers,
  LucideIcon,
} from "lucide-react";
import { useAchievements } from "../hooks/use-achievements";
import { AchievementCard } from "./achievement-card";
import { AchievementDetailModal } from "./achievement-detail-modal";
import {
  AchievementCategory,
  AchievementItem,
} from "../types/achievement.types";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORY_TABS: { id: AchievementCategory; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All", icon: Layers },
  { id: "study", label: "Study", icon: Award },
  { id: "time", label: "Time", icon: Clock },
  { id: "streak", label: "Streak", icon: Flame },
  { id: "progress", label: "Progress", icon: Target },
  { id: "xp", label: "XP", icon: Sparkles },
];

export function AchievementsView() {
  const {
    achievements,
    filteredAchievements,
    stats,
    isLoading,
    isRefreshing,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refresh,
  } = useAchievements();

  const { resize } = useSmoothScroll();

  // Selected achievement for detail modal
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);

  // Synchronize Locomotive Scroll dimensions on dynamic changes
  useEffect(() => {
    resize();
  }, [selectedCategory, filteredAchievements.length, isLoading, resize]);

  // Category counts
  const getCategoryCount = (catId: AchievementCategory) => {
    if (catId === "all") return achievements.length;
    return achievements.filter((a) => a.category === catId).length;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24">
      {/* ── 1. Hero Header & Overview Stats ─────────────────────────────── */}
      <div className="relative rounded-3xl border border-border/40 bg-gradient-to-br from-surface/80 via-surface/40 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Subtle Ambient Laser Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 shadow-md">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Achievements
                  {isRefreshing && (
                    <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Complete focus sessions, build streaks, and unlock prestigious JEE milestones
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Unlocked Metric */}
            <div className="flex-1 sm:flex-none p-3.5 sm:px-5 sm:py-3.5 rounded-2xl bg-surface/60 border border-border/50 backdrop-blur-md min-w-[150px]">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground font-semibold mb-1">
                <span>Progress</span>
                <span className="text-accent font-bold">
                  {stats.unlockedCount} / {stats.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-500"
                  style={{ width: `${stats.overallPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                {stats.overallPercentage}% Unlocked
              </span>
            </div>

            {/* Achievement XP Metric */}
            <div className="flex-1 sm:flex-none p-3.5 sm:px-5 sm:py-3.5 rounded-2xl bg-surface/60 border border-border/50 backdrop-blur-md min-w-[140px]">
              <span className="text-xs text-muted-foreground font-semibold block mb-0.5">
                Prestige XP
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                +{stats.totalXpEarned.toLocaleString()} XP
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                Earned from badges
              </span>
            </div>

            {/* Refresh Action */}
            <button
              onClick={() => refresh()}
              disabled={isLoading || isRefreshing}
              className="p-3 rounded-2xl bg-surface/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-surface/90 transition-all self-stretch flex items-center justify-center cursor-pointer disabled:opacity-50"
              aria-label="Refresh achievements"
              title="Refresh achievements"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  (isLoading || isRefreshing) && "animate-spin text-accent"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Filters & Search Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        {/* Category Pills with Animated Sliding Layout Indicator */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface/50 border border-border/40 overflow-x-auto scrollbar-none relative">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getCategoryCount(tab.id);
            const isActive = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none z-10 select-none",
                  isActive
                    ? "text-white font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAchievementCategory"
                    className="absolute inset-0 bg-accent rounded-xl shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive
                      ? "bg-black/20 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs rounded-xl bg-surface/50 border-border/40 focus:border-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Achievements Grid with View Transition ───────────────────── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AchievementsSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-12 px-6 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3"
          >
            <Award className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">Could not load achievements</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
            <Button size="sm" variant="outline" onClick={() => refresh()}>
              Try Again
            </Button>
          </motion.div>
        ) : filteredAchievements.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="py-16 px-6 rounded-2xl border border-dashed border-border/60 bg-surface/20 text-center space-y-3"
          >
            <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No achievements found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {searchQuery
                ? `No milestones match "${searchQuery}". Try a different keyword.`
                : "No milestones in this category."}
            </p>
            {searchQuery && (
              <Button size="sm" variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onClick={(ach) => setSelectedAchievement(ach)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Reusable Achievement Detail Modal ───────────────────────── */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={Boolean(selectedAchievement)}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-44 rounded-2xl bg-muted/20 border border-border/30 p-5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-muted/40" />
              <div className="w-16 h-5 rounded-full bg-muted/40" />
            </div>
            <div className="w-3/4 h-4 bg-muted/40 rounded" />
            <div className="w-full h-3 bg-muted/30 rounded" />
          </div>
          <div className="w-full h-3 bg-muted/30 rounded-full" />
        </div>
      ))}
    </div>
  );
}
