"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { subDays, format, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StudyHeatmapProps {
  sessions: StudySession[];
  days?: number;
}

export function StudyHeatmap({ sessions, days = 112 }: StudyHeatmapProps) { // 16 weeks * 7 days = 112 days
  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const data: { date: Date; duration: number; level: number }[] = [];

    // Initialize array of dates
    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: subDays(today, i),
        duration: 0,
        level: 0
      });
    }

    // Populate with session durations
    sessions.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = data.find(d => isSameDay(d.date, sessionDate));
      if (dayData) {
        dayData.duration += session.duration_seconds;
      }
    });

    // Calculate levels based on duration
    data.forEach(d => {
      const hours = d.duration / 3600;
      if (hours === 0) d.level = 0;
      else if (hours < 1) d.level = 1;
      else if (hours < 3) d.level = 2;
      else if (hours < 5) d.level = 3;
      else d.level = 4;
    });

    return data;
  }, [sessions, days]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return "bg-muted/30 border-transparent";
      case 1: return "bg-accent/30 border-accent/20";
      case 2: return "bg-accent/60 border-accent/30";
      case 3: return "bg-accent/80 border-accent/40 shadow-[0_0_10px_rgba(79,70,229,0.3)]";
      case 4: return "bg-accent border-accent shadow-[0_0_15px_rgba(79,70,229,0.5)]";
      default: return "bg-muted/30 border-transparent";
    }
  };

  const getTooltipText = (date: Date, duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const dateStr = format(date, "MMM d, yyyy");
    
    if (duration === 0) return `No study sessions on ${dateStr}`;
    if (hours === 0) return `${minutes}m on ${dateStr}`;
    return `${hours}h ${minutes}m on ${dateStr}`;
  };

  return (
    <div className="premium-card flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 px-6 pt-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)] border border-accent/20">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Study Heatmap</h3>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
          Last {Math.floor(days/7)} Weeks
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center overflow-x-auto pb-2 px-6 relative z-10">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
          {heatmapData.map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-[14px] h-[14px] rounded-[4px] border transition-all duration-300 hover:scale-125 cursor-pointer relative group/cell",
                getColorClass(day.level)
              )}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-50 w-max"
                   style={{
                     backgroundColor: 'rgba(10, 10, 10, 0.85)', 
                     borderColor: 'rgba(255,255,255,0.1)',
                     borderRadius: '12px',
                     backdropFilter: 'blur(16px)',
                     WebkitBackdropFilter: 'blur(16px)',
                     boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                     padding: '8px 12px',
                     border: '1px solid rgba(255,255,255,0.1)',
                     color: 'hsl(var(--foreground))',
                     fontSize: '12px',
                     fontWeight: 600,
                     letterSpacing: '0.02em'
                   }}
              >
                {getTooltipText(day.date, day.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-6 pb-6 relative z-10">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-[3px] bg-muted/30 border border-transparent" />
          <div className="w-3 h-3 rounded-[3px] bg-accent/30 border border-accent/20" />
          <div className="w-3 h-3 rounded-[3px] bg-accent/60 border border-accent/30" />
          <div className="w-3 h-3 rounded-[3px] bg-accent/80 border border-accent/40 shadow-[0_0_5px_rgba(79,70,229,0.3)]" />
          <div className="w-3 h-3 rounded-[3px] bg-accent border border-accent shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export function StudyHeatmapSkeleton() {
  return (
    <div className="premium-card flex flex-col h-[300px] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-7 w-40 rounded-md" />
      </div>
      <div className="flex-1 flex items-center justify-center opacity-50">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {Array.from({length: 112}).map((_, i) => (
            <Skeleton key={i} className="w-[14px] h-[14px] rounded-[4px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
