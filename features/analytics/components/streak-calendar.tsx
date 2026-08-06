"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { Calendar, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface StreakCalendarProps {
  sessions: StudySession[];
}

export function StreakCalendar({ sessions }: StreakCalendarProps) {
  const { days, currentStreak, activeDaysSet } = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    
    const days = eachDayOfInterval({ start, end });
    
    const activeDaysSet = new Set(
      sessions.map(s => format(new Date(s.started_at), "yyyy-MM-dd"))
    );

    // Calculate current streak (naive for this visualization, usually from backend)
    let streak = 0;
    let d = today;
    while (activeDaysSet.has(format(d, "yyyy-MM-dd"))) {
      streak++;
      d = new Date(d.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return { days, currentStreak: streak, activeDaysSet };
  }, [sessions]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <GlassCard hoverTint="orange" className="p-6 flex flex-col h-full group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)] border border-orange-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Streak Calendar</h3>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-500">
          <Flame className="w-4 h-4 fill-orange-500" />
          <span className="font-bold text-sm">{currentStreak}</span>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {day.charAt(0)}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-2 gap-x-2">
          {/* Empty cells for offset */}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isActive = activeDaysSet.has(dateStr);
            const isCurrent = isToday(day);
            
            return (
              <div 
                key={dateStr} 
                className="aspect-square flex items-center justify-center relative group/day"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-110" 
                    : isCurrent 
                      ? "border-2 border-orange-500/50 text-orange-400"
                      : "text-muted-foreground hover:bg-muted"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

export function StreakCalendarSkeleton() {
  return (
    <GlassCard hoverTint="orange" className="p-6 h-[400px] flex flex-col">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted/20 animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
       </div>
       <div className="flex-1 w-full bg-muted/10 rounded-xl animate-pulse" />
    </GlassCard>
  );
}
