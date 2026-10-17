"use client";

import { useSyncExternalStore } from "react";
import { XPDetails } from "@/features/gamification/services/gamification";
import { Trophy, Star, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

interface LevelProgressChartProps {
  xpDetails: XPDetails;
  achievementsCount?: number;
}

export function LevelProgressChart({ xpDetails, achievementsCount }: LevelProgressChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const percentage = Math.min(Math.max(xpDetails.progressPercentage, 0), 100);

  // SVG Geometry
  const size = 210;
  const strokeWidth = 14;
  const radius = (size - strokeWidth - 14) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const xpRemaining = Math.max(0, xpDetails.nextLevelXP - xpDetails.currentXP);

  return (
    <GlassCard 
      hoverTint="amber" 
      className="p-6 flex flex-col justify-between h-[420px] relative overflow-hidden border-t border-t-amber-500/20 shadow-sm"
    >
      {/* ── Cinematic Ambient Spotlight Behind Ring (Podium Style) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="w-64 h-64 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.035) 50%, transparent 75%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <span>Level Milestone</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
            </h3>
            <p className="text-xs font-medium text-muted-foreground font-mono">
              Tier {Math.ceil(xpDetails.currentLevel / 5)} Candidate
            </p>
          </div>
        </div>

        {typeof achievementsCount === "number" && achievementsCount > 0 && (
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            {achievementsCount} Badges
          </span>
        )}
      </div>

      {/* Radial Progress Ring */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 select-none py-2">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90 relative z-10 overflow-visible">
            <defs>
              <linearGradient id="levelProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity={1} />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity={1} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={1} />
              </linearGradient>

              <filter id="levelGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              className="text-black/5 dark:text-white/5"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Actual Progress Arc */}
            {mounted && percentage > 0 && (
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                stroke="url(#levelProgressGradient)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                filter="url(#levelGlow)"
              />
            )}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Trophy className="w-7 h-7 text-amber-500 dark:text-amber-400 mb-0.5 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] mx-auto" />
            </motion.div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Rank Level</span>
            <h2 className="text-4xl font-black tracking-tight text-foreground leading-none my-0.5">
              {xpDetails.currentLevel}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {percentage.toFixed(0)}% to Lvl {xpDetails.currentLevel + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Milestone Telemetry */}
      <div className="relative z-10 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-white/[0.02] p-2 rounded-lg border border-border/40">
          <p className="text-[10px] text-muted-foreground uppercase">Next Milestone</p>
          <p className="font-bold text-foreground truncate mt-0.5">
            {xpRemaining.toLocaleString()} <span className="text-muted-foreground text-[10px]">XP left</span>
          </p>
        </div>
        <div className="bg-white/[0.02] p-2 rounded-lg border border-border/40">
          <p className="text-[10px] text-muted-foreground uppercase">Lifetime Earned</p>
          <p className="font-bold text-foreground truncate mt-0.5">
            {xpDetails.totalXP.toLocaleString()} <span className="text-muted-foreground text-[10px]">XP</span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export function LevelProgressChartSkeleton() {
  return (
    <GlassCard hoverTint="amber" className="p-6 flex flex-col h-[420px]">
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
    </GlassCard>
  );
}
