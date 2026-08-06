"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { subDays, format, isSameDay, startOfDay, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Flame, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

interface StudyHeatmapProps {
  sessions: StudySession[];
  weeksCount?: number;
}

export function StudyHeatmap({ sessions, weeksCount = 22 }: StudyHeatmapProps) {
  const daysTotal = weeksCount * 7;

  const { heatmapData, monthLabels, stats } = useMemo(() => {
    const today = startOfDay(new Date());
    const data: { date: Date; duration: number; level: number; dayOfWeek: number }[] = [];

    // Initialize array of dates for the specified weeks
    for (let i = daysTotal - 1; i >= 0; i--) {
      const date = subDays(today, i);
      data.push({
        date,
        duration: 0,
        level: 0,
        dayOfWeek: getDay(date)
      });
    }

    let totalDurationSeconds = 0;
    let activeDaysCount = 0;

    // Populate with session durations
    sessions.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = data.find(d => isSameDay(d.date, sessionDate));
      if (dayData) {
        dayData.duration += session.duration_seconds;
      }
    });

    // Calculate levels and stats
    data.forEach(d => {
      totalDurationSeconds += d.duration;
      const hours = d.duration / 3600;
      if (hours === 0) d.level = 0;
      else {
        activeDaysCount++;
        if (hours < 1) d.level = 1;
        else if (hours < 2.5) d.level = 2;
        else if (hours < 4.5) d.level = 3;
        else d.level = 4;
      }
    });

    // Calculate Month labels placement across columns
    const months: { label: string; columnIndex: number }[] = [];
    let lastMonth = "";

    data.forEach((d, index) => {
      const colIndex = Math.floor(index / 7);
      const monthName = format(d.date, "MMM");
      if (monthName !== lastMonth && d.dayOfWeek === 0) {
        months.push({ label: monthName, columnIndex: colIndex });
        lastMonth = monthName;
      }
    });

    return {
      heatmapData: data,
      monthLabels: months,
      stats: {
        totalHours: Math.round(totalDurationSeconds / 3600),
        activeDays: activeDaysCount
      }
    };
  }, [sessions, daysTotal]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return "bg-white/[0.03] border-white/[0.04] hover:border-white/30";
      case 1: return "bg-blue-950/80 border-blue-500/30 text-blue-400 hover:border-blue-400 hover:brightness-125";
      case 2: return "bg-blue-600/70 border-blue-400/40 text-white shadow-[0_0_8px_rgba(59,130,246,0.3)] hover:border-blue-300 hover:brightness-125";
      case 3: return "bg-blue-500 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:border-white hover:brightness-125";
      case 4: return "bg-sky-400 border-white shadow-[0_0_16px_rgba(56,189,248,0.8)] hover:border-white hover:brightness-125";
      default: return "bg-white/[0.03] border-white/[0.04]";
    }
  };

  const getTooltipText = (date: Date, duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const dateStr = format(date, "EEE, MMM d, yyyy");
    
    if (duration === 0) return `No study activity on ${dateStr}`;
    if (hours === 0) return `${minutes}m study time on ${dateStr}`;
    return `${hours}h ${minutes}m study time on ${dateStr}`;
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <GlassCard hoverTint="orange" className="flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-6 pt-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)] border border-orange-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl tracking-tight text-foreground">Study Activity Heatmap</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Visualizing your daily focus consistency over time</p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/60 border border-white/5 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-foreground">{stats.activeDays}</span>
            <span className="text-muted-foreground font-normal">Active Days</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/60 border border-white/5 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-foreground">{stats.totalHours}h</span>
            <span className="text-muted-foreground font-normal">Logged</span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 overflow-x-auto pb-4">
        
        <div className="min-w-max mx-auto flex flex-col gap-2">
          
          {/* Month Header Row */}
          <div className="flex items-center pl-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 h-5 relative">
            {monthLabels.map((m, idx) => (
              <span 
                key={idx} 
                className="absolute transition-colors hover:text-foreground select-none"
                style={{ left: `${m.columnIndex * 17.5 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid + Day Labels */}
          <div className="flex items-start gap-2">
            
            {/* Day Labels Column */}
            <div className="flex flex-col gap-[3.5px] pr-2 text-[10px] font-semibold text-muted-foreground/50 uppercase select-none pt-0.5">
              {dayLabels.map((day, i) => (
                <span key={i} className="h-[14px] flex items-center leading-none">
                  {i % 2 === 1 ? day : ""}
                </span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[3.5px]">
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-[14px] h-[14px] rounded-[3px] border transition-all duration-200 cursor-pointer relative group/cell",
                    getColorClass(day.level)
                  )}
                >
                  {/* Crisp Tooltip without backdrop filter blur artifacts */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-max shadow-2xl rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground bg-[#0a0a0c] border border-white/10">
                    {getTooltipText(day.date, day.duration)}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 px-6 pb-6 pt-2 border-t border-white/[0.03] relative z-10">
        <span className="text-muted-foreground/50">Past {weeksCount} Weeks Activity</span>

        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-3 h-3 rounded-[3px] bg-white/[0.03] border border-white/[0.04]" />
            <div className="w-3 h-3 rounded-[3px] bg-blue-950/80 border border-blue-500/30" />
            <div className="w-3 h-3 rounded-[3px] bg-blue-600/70 border border-blue-400/40 shadow-[0_0_6px_rgba(59,130,246,0.3)]" />
            <div className="w-3 h-3 rounded-[3px] bg-blue-500 border border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="w-3 h-3 rounded-[3px] bg-sky-400 border border-white shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </GlassCard>
  );
}

export function StudyHeatmapSkeleton() {
  return (
    <GlassCard hoverTint="orange" className="flex flex-col h-[320px] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-7 w-40 rounded-md" />
      </div>
      <div className="flex-1 flex items-center justify-center opacity-50">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {Array.from({length: 154}).map((_, i) => (
            <Skeleton key={i} className="w-[14px] h-[14px] rounded-[3px]" />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
