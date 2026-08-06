"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { StudySession } from "@/features/study/services/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ComposedChart, Area, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { format } from "date-fns";

interface WeeklyProgressProps {
  hoursCompleted: number;
  weeklyGoalHours?: number;
  sessions?: StudySession[];
}

export const WeeklyProgress = React.memo(function WeeklyProgress({ 
  hoursCompleted, 
  weeklyGoalHours = 20,
  sessions = []
}: WeeklyProgressProps) {
  
  const progressPercentage = Math.min(100, (hoursCompleted / weeklyGoalHours) * 100);
  const isGoalMet = hoursCompleted >= weeklyGoalHours;
  
  // Real consistency data for the mini graph (last 7 days)
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - i));
      dayDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.started_at);
        return sessionDate >= dayDate && sessionDate < nextDay;
      });

      const seconds = daySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
      const hours = seconds / 3600;
      
      return {
        name: days[dayDate.getDay()],
        fullDate: format(dayDate, "MMM d"),
        actual: Number(hours.toFixed(1)),
        target: Number((weeklyGoalHours / 7).toFixed(1))
      };
    });
  }, [sessions, weeklyGoalHours]);

  return (
    <div className="flex flex-col h-full justify-between relative group">
      
      {/* Header section */}
      <div className="relative z-10 px-1 pt-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-sky-400 tracking-[0.2em] uppercase">Weekly Target</p>
          {isGoalMet && (
            <div className="flex items-center gap-1.5 text-sky-300 text-[10px] font-bold bg-sky-950/40 border border-sky-500/20 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(56,189,248,0.15)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Goal Met
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-4xl font-bold tracking-tighter text-foreground flex items-baseline drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <AnimatedNumber value={hoursCompleted} />
              <span className="text-2xl ml-0.5 text-sky-400">h</span>
            </h2>
            <p className="text-lg text-muted-foreground pb-0.5 font-medium">/ {weeklyGoalHours}h</p>
          </div>
          
          <div className="text-right">
             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Progress</p>
             <p className="text-lg font-bold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
               <AnimatedNumber value={Math.round(progressPercentage)} />%
             </p>
          </div>
        </div>
      </div>

      {/* Futuristic Glowing Chart */}
      <div className="flex-1 mt-4 w-[calc(100%+32px)] -mx-4 relative min-h-[140px] select-none pointer-events-auto">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <filter id="neonGlowCyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              <filter id="neonGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              
              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis 
               dataKey="name" 
               axisLine={false} 
               tickLine={false} 
               tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} 
               dy={10}
            />
            
            {/* Custom Tooltip matching the premium dark aesthetic */}
            <Tooltip 
               cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 30 }}
               content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   return (
                     <div className="bg-[#0a0a0c]/95 border border-white/5 backdrop-blur-xl p-3 rounded-xl shadow-2xl z-50 min-w-[120px]">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                         {payload[0].payload.fullDate}
                       </p>
                       <div className="space-y-1.5">
                         <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                             <span className="text-xs font-semibold text-white">Actual</span>
                           </div>
                           <span className="text-xs font-bold text-sky-400">{payload[1]?.value}h</span>
                         </div>
                         <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                             <span className="text-xs font-semibold text-white">Target</span>
                           </div>
                           <span className="text-xs font-bold text-purple-400">{payload[0]?.value}h</span>
                         </div>
                       </div>
                     </div>
                   );
                 }
                 return null;
               }}
            />
            
            <Area 
              type="monotone" 
              dataKey="target" 
              stroke="none" 
              fill="url(#gradPurple)" 
              isAnimationActive={true} 
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="none" 
              fill="url(#gradCyan)" 
              isAnimationActive={true} 
            />
            
            <Line 
               type="monotone" 
               dataKey="target" 
               name="Target"
               stroke="#a855f7" 
               strokeWidth={2} 
               dot={false} 
               activeDot={false}
               style={{ filter: 'url(#neonGlowPurple)' }} 
               isAnimationActive={true}
               animationDuration={1500}
            />
            
            <Line 
               type="monotone" 
               dataKey="actual" 
               name="Actual"
               stroke="#38bdf8" 
               strokeWidth={2.5} 
               dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: '#38bdf8' }} 
               activeDot={{ r: 5, fill: '#fff', stroke: '#38bdf8', strokeWidth: 2, style: { filter: 'url(#neonGlowCyan)' } }} 
               style={{ filter: 'url(#neonGlowCyan)' }} 
               isAnimationActive={true}
               animationDuration={2000}
               animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer legend */}
      <div className="flex justify-center items-center gap-6 mt-1 border-t border-white/[0.03] pt-3 relative z-10">
         <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
           <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Actual</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
           <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Target</span>
         </div>
      </div>
    </div>
  );
});
