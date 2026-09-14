"use client";

import { useMemo, useState } from "react";
import { StudySession } from "@/features/study/services/progress";
import { 
  ComposedChart, 
  Line,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface TrendChartProps {
  sessions: StudySession[];
}

type TimeRange = "7D" | "30D" | "ALL";

export function TrendChart({ sessions }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90; // Limit ALL to 90 days for performance
    
    const chartData: { date: Date; displayDate: string; hours: number; rawDuration: number }[] = [];
    
    // Generate dates
    for (let i = days - 1; i >= 0; i--) {
      chartData.push({
        date: subDays(today, i),
        displayDate: format(subDays(today, i), timeRange === "7D" ? "EEE" : "MMM d"),
        hours: 0,
        rawDuration: 0
      });
    }

    // Populate data
    sessions.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = chartData.find(d => isSameDay(d.date, sessionDate));
      if (dayData) {
        dayData.rawDuration += session.duration_seconds;
        dayData.hours = Number((dayData.rawDuration / 3600).toFixed(1));
      }
    });

    return chartData;
  }, [sessions, timeRange]);

  const maxHours = Math.max(...data.map(d => d.hours), 1); // Avoid 0 domain

  return (
    <GlassCard hoverTint="blue" className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)] border border-accent/20">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Study Trend</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50 shadow-sm">
          {(["7D", "30D", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 tracking-wider",
                timeRange === range 
                  ? "bg-foreground text-background shadow-md scale-100" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative z-10 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <filter id="neonGlowAccent" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="colorHoursTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="displayDate" 
              stroke="var(--muted-foreground)" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--muted-foreground)" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
              domain={[0, Math.ceil(maxHours + 1)]}
              dx={-5}
            />
            <Tooltip 
               cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 30 }}
               content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   return (
                     <div className="bg-[#0a0a0c]/95 border border-white/5 backdrop-blur-xl p-3 rounded-xl shadow-2xl z-50 min-w-[120px]">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                         {payload[0].payload.displayDate}
                       </p>
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                           <span className="text-xs font-semibold text-white">Study Time</span>
                         </div>
                         <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{payload[0]?.value}h</span>
                       </div>
                     </div>
                   );
                 }
                 return null;
               }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="none" 
              fillOpacity={1}
              fill="url(#colorHoursTrend)"
              isAnimationActive={true}
            />
            <Line 
               type="monotone" 
               dataKey="hours" 
               stroke="var(--accent)" 
               strokeWidth={2.5} 
               dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: 'var(--accent)' }} 
               activeDot={{ r: 5, fill: '#fff', stroke: 'var(--accent)', strokeWidth: 2, style: { filter: 'url(#neonGlowAccent)' } }} 
               style={{ filter: 'url(#neonGlowAccent)' }} 
               isAnimationActive={true}
               animationDuration={1500}
               animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function TrendChartSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-muted/20 rounded-xl animate-pulse" />
      </div>
      <div className="flex-1 w-full bg-muted/10 rounded-2xl animate-pulse" />
    </div>
  );
}
