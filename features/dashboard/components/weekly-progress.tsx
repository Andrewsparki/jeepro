"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { StudySession } from "@/features/study/services/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface WeeklyProgressProps {
  hoursCompleted: number;
  weeklyGoalHours?: number;
  sessions?: StudySession[];
}

export const WeeklyProgress = React.memo(function WeeklyProgress({ 
  hoursCompleted, 
  weeklyGoalHours = 20, // Default goal
  sessions = []
}: WeeklyProgressProps) {
  
  const progressPercentage = Math.min(100, (hoursCompleted / weeklyGoalHours) * 100);
  const isGoalMet = hoursCompleted >= weeklyGoalHours;
  
  // Real consistency data for the mini graph (last 7 days)
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i)); // 0 = 6 days ago, 6 = today
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.started_at);
      return sessionDate >= day && sessionDate < nextDay;
    });

    const seconds = daySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const hours = seconds / 3600;
    const dailyGoal = weeklyGoalHours / 7;
    return Math.min(1, hours / dailyGoal);
  });

  return (
    <div className="flex flex-col h-full justify-between gap-5 relative">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-accent tracking-widest uppercase">Weekly Target</p>
          {isGoalMet && (
            <div className="flex items-center gap-1.5 text-success text-[11px] font-bold bg-success/10 border border-success/20 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Goal Met
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-4xl font-bold tracking-tighter text-foreground flex items-baseline">
              <AnimatedNumber value={hoursCompleted} />
              <span className="text-2xl ml-0.5">h</span>
            </h2>
            <p className="text-lg text-muted-foreground pb-0.5 font-medium">/ {weeklyGoalHours}h</p>
          </div>
          {!isGoalMet && (
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                <AnimatedNumber value={weeklyGoalHours - hoursCompleted} />h remaining
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Est. Sun</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 mt-auto">
        <div className="space-y-3">
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Progress</span>
            <span className={isGoalMet ? "text-success" : "text-accent"}><AnimatedNumber value={Math.round(progressPercentage)} />%</span>
          </div>
          
          {/* Premium Capsule Progress Bar */}
          <div className="h-2.5 w-full bg-surface border border-border/50 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className={cn("h-full rounded-full relative overflow-hidden", isGoalMet ? "bg-success" : "bg-accent")}
            >
              {/* Shimmer effect inside the bar */}
              <div 
                className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                style={{ animation: "shimmer 3s infinite linear" }} 
              />
            </motion.div>
            
            {/* Glowing tail/head indicator for the progress bar */}
            <motion.div
              initial={{ left: 0, opacity: 0 }}
              animate={{ left: `calc(${progressPercentage}% - 8px)`, opacity: progressPercentage > 0 ? 1 : 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] border-2 border-accent hidden sm:block"
              style={{ zIndex: 10, borderColor: isGoalMet ? 'var(--success)' : 'var(--accent)' }}
            />
          </div>
          
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(50%); }
            }
          `}</style>
        </div>

        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.1)]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none mb-1.5 tracking-tight">Consistency</p>
              <p className="text-[11px] font-medium text-muted-foreground leading-none uppercase tracking-wider">On track this week</p>
            </div>
          </div>
          
          {/* Mini Activity Graph */}
          <div className="flex items-end gap-1.5 h-10 shrink-0">
            {activityData.map((val, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${Math.max(20, val * 100)}%`, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.05, ease: "easeOut" }}
                className={cn(
                  "w-2 rounded-sm",
                  val > 0.8 ? "bg-accent" : val > 0.3 ? "bg-accent/60" : "bg-surface border border-border/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
