"use client";

import { motion } from "framer-motion";
import { XPDetails } from "../services/gamification";
import { Trophy } from "lucide-react";

import { AnimatedNumber } from "@/components/ui/animated-number";

interface XPProgressProps {
  xpDetails: XPDetails;
}

export function XPProgress({ xpDetails }: XPProgressProps) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl border border-accent/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Level</p>
            <h3 className="text-2xl font-bold">Level <AnimatedNumber value={xpDetails.currentLevel} /></h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total XP</p>
          <p className="text-2xl font-bold text-accent"><AnimatedNumber value={xpDetails.currentXP} /></p>
        </div>
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span><AnimatedNumber value={xpDetails.progressPercentage} />% to Level {xpDetails.currentLevel + 1}</span>
          <span><AnimatedNumber value={xpDetails.nextLevelXP} /> XP needed</span>
        </div>
        
        <style>{`
          @keyframes xp-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpDetails.progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-accent rounded-full relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div 
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" 
              style={{ animation: 'xp-shimmer 2s linear infinite' }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
