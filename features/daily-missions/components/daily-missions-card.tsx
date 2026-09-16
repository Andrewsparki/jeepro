"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyMission } from "../services/missions.service";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyMissionsCardProps {
  missions: DailyMission[];
  delay?: number;
}

export function DailyMissionsCard({ missions, delay = 0 }: DailyMissionsCardProps) {
  const completedCount = missions.filter(m => m.completed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;

  return (
    <DashboardCard delay={delay} className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            Daily Missions
            {allCompleted && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Trophy className="w-3.5 h-3.5" />
                All Done!
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount} of {missions.length} completed
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start gap-3">
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
