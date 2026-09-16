"use client";

import { useMemo, useState } from "react";
import { StudySession } from "@/features/study/services/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface SessionsBarChartProps {
  sessions: StudySession[];
}

type TimeRange = "7D" | "30D";

export function SessionsBarChart({ sessions }: SessionsBarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "7D" ? 7 : 30;
    
    const chartData: { date: Date; displayDate: string; count: number }[] = [];
    
    // Generate dates
    for (let i = days - 1; i >= 0; i--) {
      chartData.push({
        date: subDays(today, i),
        displayDate: format(subDays(today, i), timeRange === "7D" ? "EEE" : "MMM d"),
        count: 0
      });
    }

    // Populate data
    sessions.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = chartData.find(d => isSameDay(d.date, sessionDate));
      if (dayData) {
        dayData.count += 1;
      }
    });

    return chartData;
  }, [sessions, timeRange]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <GlassCard hoverTint="purple" className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)] border border-accent/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Sessions Per Day</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50 shadow-sm">
          {(["7D", "30D"] as TimeRange[]).map((range) => (
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
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.2} />
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
              domain={[0, Math.ceil(maxCount + 1)]}
              dx={-5}
            />
            <Tooltip 
               cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
               content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   return (
                     <div className="bg-[#0a0a0c]/95 border border-white/5 p-3 rounded-xl shadow-2xl z-50 min-w-[120px]">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                         {payload[0].payload.displayDate}
                       </p>
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                           <span className="text-xs font-semibold text-white">Sessions</span>
                         </div>
                         <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{payload[0]?.value}</span>
                       </div>
                     </div>
                   );
                 }
                 return null;
               }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#colorSessions)" 
              radius={[6, 6, 0, 0]} 
              barSize={timeRange === "7D" ? 40 : 12}
              animationDuration={1500}
              animationEasing="ease-out"
              style={{ filter: 'url(#neonGlowBar)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function SessionsBarChartSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-muted/20 rounded-xl animate-pulse" />
      </div>
      <div className="flex-1 w-full bg-muted/10 rounded-2xl animate-pulse" />
    </div>
  );
}
