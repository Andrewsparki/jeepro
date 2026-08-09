"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyMission } from "../services/missions.service";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { CheckCircle2, Circle, Target, Clock, Flag, LayoutList, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyMissionsCardProps {
  missions: DailyMission[];
  delay?: number;
}

export function DailyMissionsCard({ missions, delay = 0 }: DailyMissionsCardProps) {
  const completedCount = useMemo(() => missions.filter(m => m.completed).length, [missions]);
  const isAllComplete = missions.length > 0 && completedCount === missions.length;

  return (
    <DashboardCard 
      delay={delay} 
      className={cn(
        "min-h-[240px] relative transition-colors duration-500",
        isAllComplete && "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Daily Missions
            {isAllComplete && (
              <motion.span 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="text-emerald-500"
              >
                <Trophy className="w-4 h-4" />
              </motion.span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete all 3 for a bonus XP reward
          </p>
        </div>
        <div className="flex items-baseline gap-1 text-2xl font-light tabular-nums">
          <span className={cn("transition-colors", isAllComplete ? "text-emerald-500 font-medium" : "text-foreground")}>
            {completedCount}
          </span>
          <span className="text-sm text-muted-foreground">/{missions.length || 3}</span>
        </div>
      </div>

      <div className="space-y-4">
        {missions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Generating your personalized missions...
          </div>
        ) : (
          missions.map((mission, idx) => (
            <MissionItem key={mission.id} mission={mission} index={idx} />
          ))
        )}
      </div>
    </DashboardCard>
  );
}

function MissionItem({ mission, index }: { mission: DailyMission; index: number }) {
  const Icon = useMemo(() => {
    switch (mission.mission_type) {
      case "study_duration": return Clock;
      case "focus_sessions": return Target;
      case "chapter_completion": return Flag;
      case "planner_completion": return LayoutList;
      default: return Target;
    }
  }, [mission.mission_type]);

  const progressPercentage = Math.min(100, Math.max(0, (mission.current_value / mission.target_value) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (index * 0.1), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-glass-border hover:bg-white/5 transition-all"
    >
      {/* Icon Area */}
      <div className="mt-0.5 shrink-0 relative">
        <AnimatePresence mode="popLayout">
          {mission.completed ? (
            <motion.div
              key="completed"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </motion.div>
          ) : (
            <motion.div
              key="incomplete"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h4 className={cn(
            "text-sm font-medium transition-colors",
            mission.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground"
          )}>
            {mission.title}
          </h4>
          <span className="text-xs font-medium text-emerald-500/80 bg-emerald-500/10 px-2 rounded-md whitespace-nowrap">
            +{mission.reward_xp} XP
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "absolute top-0 left-0 bottom-0 rounded-full transition-colors",
              mission.completed ? "bg-emerald-500" : "bg-blue-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
