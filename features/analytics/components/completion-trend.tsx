"use client";

import { useMemo, useState } from "react";
import { UserTopicProgress } from "@/features/study/services/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionTrendProps {
  progress: UserTopicProgress[];
}

type TimeRange = "30D" | "ALL";

export function CompletionTrend({ progress }: CompletionTrendProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "30D" ? 30 : 90;
    
    // Filter only mastered topics with completed_at
    const mastered = progress.filter(p => p.status === "Mastered" && p.completed_at);
    
    // Sort ascending by completion date
    mastered.sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());

    const chartData: { date: Date; displayDate: string; count: number }[] = [];
    let cumulativeCount = 0;
    
    // Find baseline cumulative count (topics mastered before the window)
    const cutoffDate = subDays(today, days - 1);
    cumulativeCount = mastered.filter(p => new Date(p.completed_at!) < cutoffDate).length;

    // Generate dates
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      
      // Count topics mastered on this specific day
      const masteredToday = mastered.filter(p => isSameDay(new Date(p.completed_at!), date)).length;
      cumulativeCount += masteredToday;

      chartData.push({
        date,
        displayDate: format(date, "MMM d"),
        count: cumulativeCount
      });
    }

    return chartData;
  }, [progress, timeRange]);

  const maxCount = data.length > 0 ? data[data.length - 1].count : 10;

  return (
    <div className="premium-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] border border-green-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Completion Trend</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50 shadow-sm">
          {(["30D", "ALL"] as TimeRange[]).map((range) => (
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
      
      <div className={cn("flex-1 w-full min-h-0 relative z-10 pb-4 px-4", data.length === 0 || maxCount === 0 ? "flex items-center justify-center" : "")}>
        {data.length === 0 || maxCount === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">No topics mastered yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                stroke="var(--muted-foreground)" 
                fontSize={11} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false}
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={11} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false}
                domain={[0, Math.ceil(maxCount * 1.1)]}
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
                cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Topics Mastered"
                stroke="#22C55E" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#22C55E", stroke: "hsl(var(--background))", strokeWidth: 3 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function CompletionTrendSkeleton() {
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
