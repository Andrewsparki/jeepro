"use client";

import { useMemo, useState, useEffect } from "react";
import { XPDetails } from "@/features/gamification/services/gamification";
import { Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

interface LevelProgressChartProps {
  xpDetails: XPDetails;
}

export function LevelProgressChart({ xpDetails }: LevelProgressChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const percentage = useMemo(() => {
    // Current level XP threshold = level^2 * 100
    const currentLevelXP = Math.pow(xpDetails.currentLevel, 2) * 100;
    const nextLevelXP = Math.pow(xpDetails.currentLevel + 1, 2) * 100;
    const xpInCurrentLevel = xpDetails.totalXP - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;
    
    if (xpNeededForNext <= 0) return 0;
    
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));
  }, [xpDetails]);

  // SVG Geometry
  const size = 230;
  const strokeWidth = 14;
  const radius = (size - strokeWidth - 16) / 2; // Extra padding for outer glow
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;
  // If XP is 0%, offset = circumference. If 100%, offset = 0.
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <GlassCard hoverTint="amber" className="p-6 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Star className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Level Progress</h3>
          <p className="text-sm font-medium text-muted-foreground">Journey to Level {xpDetails.currentLevel + 1}</p>
        </div>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center relative z-10 select-none">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          
          <svg width={size} height={size} className="transform -rotate-90 relative z-10 overflow-visible">
            <defs>
              <linearGradient id="levelProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity={1} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={1} />
              </linearGradient>

              {/* Soft golden illuminated glow filter */}
              <filter id="levelGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.65" />
              </filter>
            </defs>

            {/* Dark Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Actual Progress Arc (Only animates once on mount, then remains static) */}
            {mounted && percentage > 0 && (
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                stroke="url(#levelProgressGradient)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                strokeLinecap="round"
                filter="url(#levelGlow)"
              />
            )}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <Trophy className="w-8 h-8 text-amber-400 mb-1 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            <h2 className="text-5xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              {xpDetails.currentLevel}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mt-1">
              {percentage.toFixed(0)}% to Lvl {xpDetails.currentLevel + 1}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function LevelProgressChartSkeleton() {
  return (
    <GlassCard hoverTint="amber" className="p-6 flex flex-col h-[400px]">
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
