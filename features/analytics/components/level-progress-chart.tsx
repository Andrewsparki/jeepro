"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { XPDetails } from "@/features/gamification/services/gamification";
import { Trophy, Star } from "lucide-react";


import { ProgressRing } from "@/features/dashboard/components/progress-ring";

interface LevelProgressChartProps {
  xpDetails: XPDetails;
}

export function LevelProgressChart({ xpDetails }: LevelProgressChartProps) {
  const percentage = useMemo(() => {
    // Current level XP threshold = level^2 * 100
    const currentLevelXP = Math.pow(xpDetails.currentLevel, 2) * 100;
    const nextLevelXP = Math.pow(xpDetails.currentLevel + 1, 2) * 100;
    const xpInCurrentLevel = xpDetails.totalXP - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));
  }, [xpDetails]);

  return (
    <div className="premium-card p-6 flex flex-col h-[400px] group transition-all duration-500 hover:scale-[1.01]">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Star className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Level Progress</h3>
          <p className="text-sm font-medium text-muted-foreground">Journey to Level {xpDetails.currentLevel + 1}</p>
        </div>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center relative z-10">
        <ProgressRing 
          progress={percentage} 
          size={230} 
          strokeWidth={14} 
          showValue={false}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mb-1 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-transform duration-500 group-hover:scale-110" />
            <h2 className="text-5xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              {xpDetails.currentLevel}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Current Level</p>
          </div>
        </ProgressRing>
      </div>
    </div>
  );
}

export function LevelProgressChartSkeleton() {
  return (
    <div className="premium-card p-6 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted/20 animate-pulse shrink-0" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
          <div className="h-4 w-24 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
         <div className="w-48 h-48 rounded-full border-8 border-muted/10 animate-pulse" />
      </div>
    </div>
  );
}
