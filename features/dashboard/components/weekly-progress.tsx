"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface WeeklyProgressProps {
  hoursCompleted: number;
  weeklyGoalHours?: number;
}

export const WeeklyProgress = React.memo(function WeeklyProgress({ 
  hoursCompleted, 
  weeklyGoalHours = 20 // Default goal
}: WeeklyProgressProps) {
  
  const progressPercentage = Math.min(100, Math.round((hoursCompleted / weeklyGoalHours) * 100));
  const isGoalMet = hoursCompleted >= weeklyGoalHours;
  
  // Fake consistency data for the mini graph based on progress
  const fakeActivityData = Array.from({ length: 7 }).map((_, i) => {
    // Generate a curve that roughly matches progress
    const base = Math.random() * 0.5;
    const factor = (progressPercentage / 100) * 0.8;
    return Math.min(1, base + factor * (i / 6)); 
  });

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Target</p>
          {isGoalMet && (
            <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> Goal Met
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2 mb-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">{hoursCompleted}h</h2>
          <p className="text-lg text-muted-foreground pb-1">/ {weeklyGoalHours}h</p>
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full relative", isGoalMet ? "bg-green-500" : "bg-accent")}
            >
              <div className="absolute inset-0 bg-white/20" style={{ animation: "pulse 2s infinite" }} />
            </motion.div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-none mb-1">Consistency</p>
              <p className="text-xs text-muted-foreground leading-none">On track this week</p>
            </div>
          </div>
          
          {/* Mini Activity Graph */}
          <div className="flex items-end gap-1 h-8 shrink-0">
            {fakeActivityData.map((val, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn("w-1.5 rounded-t-sm", val > 0.6 ? "bg-accent" : "bg-accent/30")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
