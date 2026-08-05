"use client";

import React from "react";
import { Achievement, XPDetails } from "@/features/gamification/services/gamification";
import { Trophy, Star, CheckCircle2, Lock } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { motion } from "framer-motion";

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
    <div className="flex flex-col h-full gap-7">
      
      {/* Current Level Info */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border/50 shadow-inner relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md animate-pulse" />
          <div className="absolute inset-0 bg-accent/10 rounded-xl border border-accent/30" />
          <Trophy className="w-6 h-6 text-accent relative z-10" />
        </div>
        
        <div className="flex-1 relative z-10">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Level</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-3xl font-bold tracking-tight leading-none text-foreground flex items-baseline">
              <span className="text-xl text-muted-foreground mr-1 font-medium">Lvl</span> 
              <AnimatedNumber value={xpDetails.currentLevel} />
            </h3>
            <span className="text-xs font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20"><AnimatedNumber value={xpDetails.currentXP} /> XP</span>
          </div>
        </div>
      </div>

      {/* Next Unlock Highlight */}
      {nextUnlock && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Next Milestone</h4>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 rounded bg-muted/50">Level {xpDetails.currentLevel + 1}</span>
          </div>
          <div className="p-4 rounded-xl border border-border/40 bg-surface shadow-sm group hover:border-accent/30 transition-colors duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-accent/10 transition-colors duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0 text-muted-foreground shadow-inner">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-foreground truncate">{nextUnlock.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{nextUnlock.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    <span>Progress</span>
                    <span className="text-accent">{Math.round(xpDetails.progressPercentage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${xpDetails.progressPercentage}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-accent rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                    >
                      <div 
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                        style={{ animation: "shimmer 2s linear infinite" }} 
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Unlocks Mini List */}
      <div className="flex-1 flex flex-col gap-3 mt-1">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Recent Unlocks</h4>
        <div className="space-y-2.5">
          {sortedAchievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
            <div key={achievement.id} className="flex items-center gap-3.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                <Star className="w-3.5 h-3.5 fill-accent/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{achievement.title}</p>
                <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">{achievement.description}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            </div>
          ))}
          {sortedAchievements.filter(a => a.unlocked).length === 0 && (
            <div className="p-4 rounded-xl border border-dashed border-border/40 flex flex-col items-center justify-center text-center gap-2">
              <Star className="w-6 h-6 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Complete sessions to unlock</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
});
