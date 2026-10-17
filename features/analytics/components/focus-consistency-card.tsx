"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { GlassCard } from "@/components/ui/glass-card";
import { Zap, Target, Clock, ShieldCheck, Flame } from "lucide-react";

interface FocusConsistencyCardProps {
  sessions: StudySession[];
}

export function FocusConsistencyCard({ sessions }: FocusConsistencyCardProps) {
  const metrics = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        averageDurationMinutes: 0,
        deepFocusRatio: 0,
        mostProductiveHour: "N/A",
        completionRate: 0,
      };
    }

    let totalDuration = 0;
    let deepSessions = 0;
    const hourHistogram = new Array(24).fill(0);

    sessions.forEach((s) => {
      totalDuration += s.duration_seconds;
      const mins = s.duration_seconds / 60;
      if (mins >= 45) {
        deepSessions++;
      }

      if (s.started_at) {
        const hour = new Date(s.started_at).getHours();
        hourHistogram[hour]++;
      }
    });

    const averageDurationMinutes = Math.round(totalDuration / sessions.length / 60);
    const deepFocusRatio = Math.round((deepSessions / sessions.length) * 100);

    let maxHourIdx = 0;
    let maxHourCount = 0;
    hourHistogram.forEach((count, idx) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        maxHourIdx = idx;
      }
    });

    const formatHour = (hour: number) => {
      const ampm = hour >= 12 ? "PM" : "AM";
      const h = hour % 12 || 12;
      return `${h}:00 ${ampm}`;
    };

    const mostProductiveHour = maxHourCount > 0 ? formatHour(maxHourIdx) : "N/A";

    return {
      totalSessions: sessions.length,
      averageDurationMinutes,
      deepFocusRatio,
      mostProductiveHour,
    };
  }, [sessions]);

  return (
    <GlassCard hoverTint="blue" className="p-6 flex flex-col justify-between h-full group relative overflow-hidden">
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(120,169,255,0.15)]">
            <Zap className="w-5 h-5 text-[#78A9FF]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Study Discipline</h3>
            <p className="text-sm font-medium text-muted-foreground">Session intensity & habits</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {metrics.deepFocusRatio}% Deep Work
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10 my-auto">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5 text-[#78A9FF]" />
            <span>Avg Session</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {metrics.averageDurationMinutes} <span className="text-xs text-muted-foreground font-sans font-normal">mins</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak Activity</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {metrics.mostProductiveHour}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-border/40 relative z-10 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Consistency Index</span>
        </div>
        <span className="font-semibold text-foreground">
          {metrics.deepFocusRatio >= 60 ? "Prime Focus" : metrics.deepFocusRatio >= 30 ? "Steady Rhythm" : "Building Momentum"}
        </span>
      </div>
    </GlassCard>
  );
}
