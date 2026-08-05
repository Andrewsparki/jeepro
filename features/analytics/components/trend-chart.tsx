"use client";

import { useMemo, useState } from "react";
import { StudySession } from "@/features/study/services/progress";
import { 
  AreaChart, 
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
    <div className="premium-card flex flex-col h-[400px]">
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="colorHoursTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
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
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 10, 0.85)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                padding: '16px 20px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '16px' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="var(--accent)" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHoursTrend)"
              activeDot={{ r: 6, fill: "var(--accent)", stroke: "hsl(var(--background))", strokeWidth: 3 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
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
