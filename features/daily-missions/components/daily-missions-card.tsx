"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyMission } from "../types/mission.types";
import { getTodayMissions, generateMissionsForToday } from "../services/missions.service";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { CheckCircle2, Circle, RotateCw, Sparkles, AlertCircle, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { playHapticSound } from "@/lib/sound-effects";
import { useOptionalDashboardData } from "@/features/dashboard/context/dashboard-data-context";

interface DailyMissionsCardProps {
  missions?: DailyMission[];
  delay?: number;
  isLoading?: boolean;
}

export function DailyMissionsCard({ missions: initialMissions, delay = 0, isLoading: propIsLoading = false }: DailyMissionsCardProps) {
  const [localMissions, setLocalMissions] = useState<DailyMission[] | null>(null);
  const [prevInitialMissions, setPrevInitialMissions] = useState(initialMissions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  const dashboardData = useOptionalDashboardData();

  // Synchronize local state when parent initialMissions change during render
  if (initialMissions !== prevInitialMissions) {
    setPrevInitialMissions(initialMissions);
    setLocalMissions(null);
  }

  const missions = localMissions ?? initialMissions ?? [];

  const refreshMissions = async (forceGenerate = false) => {
    playHapticSound("click");
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      let freshMissions = forceGenerate ? null : await getTodayMissions();
      if (!freshMissions || freshMissions.length === 0) {
        freshMissions = await generateMissionsForToday();
      }

      if (freshMissions && freshMissions.length > 0) {
        setLocalMissions(freshMissions);
        playHapticSound("success");
        dashboardData?.refreshMetrics().catch(() => {});
      } else {
        setErrorMessage(
          forceGenerate
            ? "Could not generate missions right now. Try again later."
            : "Failed to refresh missions. Please try again."
        );
      }
    } catch (err: unknown) {
      console.error("[DailyMissions] Update error:", err);
      setErrorMessage("An error occurred while updating missions.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => refreshMissions(false);
  const handleGenerate = () => refreshMissions(true);

  const isLoading = propIsLoading || isRefreshing;
  const completedCount = missions.filter((m) => m.completed).length;
  const allCompleted = missions.length === 3 && completedCount === 3;
  
  // Verify if all 3 rewards have actually been awarded from real mission data
  const allRewardsAwarded = allCompleted && missions.every((m) => m.reward_xp > 0 && m.completed);
  const totalAwardedXP = allRewardsAwarded ? missions.reduce((sum, m) => sum + (m.reward_xp || 0), 0) : 0;

  return (
    <DashboardCard delay={delay} className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {allCompleted ? "Daily Missions Complete" : "Daily Missions"}
            </h3>
            {allCompleted && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="flex items-center justify-center w-3 h-3 rounded-full bg-accent/20 text-accent"
                >
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                </motion.span>
                Complete
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {missions.length > 0 ? `${completedCount} of ${missions.length} completed` : "Personalized daily goals"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh daily missions"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover/30 active:scale-95 transition-all disabled:opacity-40"
        >
          <RotateCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-accent")} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3">
        {/* Loading State */}
        {isLoading && missions.length === 0 && (
          <div className="space-y-2.5 py-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/60 animate-pulse"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-1/3 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && missions.length === 0 && (
          <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-danger font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && missions.length === 0 && (
          <div className="p-5 rounded-xl border border-border bg-secondary/50 text-center space-y-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">No Active Missions Today</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Generate tailored daily challenges based on your study rhythm to earn bonus XP.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-foreground transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Missions
            </button>
          </div>
        )}

        {/* Fully Completed Summary State */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-4 rounded-xl border border-accent/25 bg-secondary/90 space-y-3.5"
          >
            {/* Top row: Status & Animated Checkmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent"
                >
                  <motion.svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                    />
                  </motion.svg>
                </motion.div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">All Goals Mastered</h4>
                  <p className="text-[11px] text-muted-foreground">3 of 3 completed today</p>
                </div>
              </div>

              {allRewardsAwarded && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold font-mono">
                  <span>+{totalAwardedXP} XP</span>
                  <span className="text-[10px] text-muted-foreground font-sans font-normal ml-0.5">Awarded</span>
                </div>
              )}
            </div>

            {/* Overall Progress Track Animated to 100% */}
            <div className="space-y-1">
              <div className="relative h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border/50">
                <motion.div
                  className="absolute top-0 left-0 bottom-0 rounded-full bg-accent"
                  initial={{ width: "66%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Daily Target</span>
                <span className="font-medium text-accent">100%</span>
              </div>
            </div>

            {/* Collapsible / Reduced prominence completed missions */}
            <div className="pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={() => {
                  playHapticSound("click");
                  setShowCompletedList((prev) => !prev);
                }}
                className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground py-1 transition-colors"
              >
                <span>{showCompletedList ? "Hide completed missions" : "Review completed missions (3)"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showCompletedList && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showCompletedList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pt-2"
                  >
                    {missions.map((mission, idx) => (
                      <MissionItem key={mission.id} mission={mission} index={idx} isCompact={true} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Standard Incomplete / Active Missions State */}
        {!allCompleted && missions.length > 0 && (
          missions.map((mission, idx) => (
            <MissionItem key={mission.id} mission={mission} index={idx} />
          ))
        )}
      </div>
    </DashboardCard>
  );
}

function getMissionUnitLabel(type: string, current: number, target: number, completed?: boolean) {
  const boundedCurrent = completed ? target : Math.min(current, target);
  switch (type) {
    case "study_duration":
      return `${boundedCurrent}/${target} min`;
    case "focus_sessions":
      return `${boundedCurrent}/${target} session${target > 1 ? "s" : ""}`;
    case "chapter_completion":
      return `${boundedCurrent}/${target} chapter${target > 1 ? "s" : ""}`;
    default:
      return `${boundedCurrent}/${target}`;
  }
}

function MissionItem({ mission, index, isCompact = false }: { mission: DailyMission; index: number; isCompact?: boolean }) {
  const progressPercentage = mission.completed
    ? 100
    : Math.min(
        100,
        Math.max(0, (mission.current_value / mission.target_value) * 100)
      );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border transition-all",
        isCompact ? "p-2.5 bg-secondary/30 border-border/40" : (
          mission.completed
            ? "p-3 border-border/60 bg-secondary/40"
            : "p-3 border-border bg-secondary/80 hover:bg-surface-hover hover:border-accent/30"
        )
      )}
    >
      {/* Icon Area */}
      <div className="mt-0.5 shrink-0 relative">
        <AnimatePresence mode="popLayout">
          {mission.completed ? (
            <motion.div
              key="completed"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <CheckCircle2 className="w-4 h-4 text-accent" />
            </motion.div>
          ) : (
            <motion.div
              key="incomplete"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4
            className={cn(
              "text-xs font-medium transition-colors truncate",
              mission.completed
                ? "text-muted-foreground/70 line-through"
                : "text-foreground"
            )}
          >
            {mission.title}
          </h4>
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap",
              mission.completed
                ? "text-accent/80 bg-accent/5 border-accent/15"
                : "text-accent bg-accent/10 border-accent/20"
            )}
          >
            +{mission.reward_xp} XP
          </span>
        </div>

        {/* Progress Bar & Numerical Readout */}
        <div className="space-y-1">
          <div className="relative h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border/40">
            <motion.div
              className="absolute top-0 left-0 bottom-0 rounded-full transition-colors bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
            <span>{getMissionUnitLabel(mission.mission_type, mission.current_value, mission.target_value, mission.completed)}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
