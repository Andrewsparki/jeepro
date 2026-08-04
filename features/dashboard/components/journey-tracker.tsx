"use client";

import React from "react";
import { Achievement, XPDetails } from "@/features/gamification/services/gamification";
import { Trophy, Star, CheckCircle2, Lock } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface JourneyTrackerProps {
  xpDetails: XPDetails;
  achievements: Achievement[];
}

export const JourneyTracker = React.memo(function JourneyTracker({ xpDetails, achievements }: JourneyTrackerProps) {
  
  // Sort to show unlocked first, then locked
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });

  const nextUnlock = sortedAchievements.find(a => !a.unlocked);

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Current Level Info */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10">
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-pulse" />
          <div className="absolute inset-1 bg-accent/20 rounded-full" />
          <Trophy className="w-5 h-5 text-accent relative z-10" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Current Level</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold leading-none">Lvl <AnimatedNumber value={xpDetails.currentLevel} /></h3>
            <span className="text-sm font-medium text-accent pb-0.5"><AnimatedNumber value={xpDetails.currentXP} /> XP</span>
          </div>
        </div>
      </div>

      {/* Next Unlock Highlight */}
      {nextUnlock && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">Next Milestone</h4>
            <span className="text-xs font-medium text-muted-foreground">Level {xpDetails.currentLevel + 1}</span>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{nextUnlock.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{nextUnlock.description}</p>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                    <span>Progress</span>
                    <span>{xpDetails.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground rounded-full transition-all duration-1000"
                      style={{ width: `${xpDetails.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Unlocks Mini List */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-foreground mb-3">Recent Unlocks</h4>
        <div className="space-y-3">
          {sortedAchievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
            <div key={achievement.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Star className="w-4 h-4 fill-accent/20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{achievement.title}</p>
                <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 opacity-50" />
            </div>
          ))}
          {sortedAchievements.filter(a => a.unlocked).length === 0 && (
            <p className="text-xs text-muted-foreground italic">Complete sessions to unlock achievements.</p>
          )}
        </div>
      </div>
      
    </div>
  );
});
