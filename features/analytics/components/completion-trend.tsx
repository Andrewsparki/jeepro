"use client";

import { useMemo, useState } from "react";
import { UserTopicProgress } from "@/features/study/services/progress";
import { 
  ComposedChart, 
  Area,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface CompletionTrendProps {
  progress: UserTopicProgress[];
}

type TimeRange = "30D" | "ALL";

export function CompletionTrend({ progress }: CompletionTrendProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "30D" ? 30 : 90;
    const cutoffDate = subDays(today, days - 1);

    // Pre-bucket completions by date string in a single O(N) pass
    const countByDay = new Map<string, number>();
    let cumulativeCount = 0;

    for (const p of progress) {
      if (p.status === "Mastered" && p.completed_at) {
        const completedDate = new Date(p.completed_at);
        if (completedDate < cutoffDate) {
          cumulativeCount++;
        } else {
          const key = format(completedDate, "yyyy-MM-dd");
          countByDay.set(key, (countByDay.get(key) || 0) + 1);
        }
      }
    }

    const chartData: { date: Date; displayDate: string; count: number }[] = [];

    // Generate chronological series in O(days)
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const key = format(date, "yyyy-MM-dd");
      cumulativeCount += countByDay.get(key) || 0;

      chartData.push({
        date,
        displayDate: format(date, "MMM d"),
        count: cumulativeCount,
      });
    }

    return chartData;
  }, [progress, timeRange]);

  const maxCount = data.length > 0 ? data[data.length - 1].count : 10;

  return (
    <GlassCard hoverTint="emerald" className="flex flex-col h-[400px]">
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
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-100" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className={cn("flex-1 w-full min-h-[290px] relative z-10 pb-4 px-4", data.length === 0 || maxCount === 0 ? "flex items-center justify-center" : "")}>
        {data.length === 0 || maxCount === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">No topics mastered yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={290}>
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success, #22C55E)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--success, #22C55E)" stopOpacity={0} />
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
                 cursor={{ stroke: 'rgba(100,116,139,0.1)', strokeWidth: 30 }}
                 content={({ active, payload }) => {
                   if (active && payload && payload.length) {
                     return (
                       <div className="bg-popover/95 border border-border/70 text-popover-foreground p-3 rounded-xl shadow-strong z-50 min-w-[120px] backdrop-blur-md">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                           {payload[0].payload.displayDate}
                         </p>
                         <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success, #22C55E)', boxShadow: '0 0 8px var(--success, #22C55E)' }} />
                             <span className="text-xs font-semibold text-foreground">Topics</span>
                           </div>
                           <span className="text-xs font-bold font-mono text-foreground">{payload[0]?.value}</span>
                         </div>
                       </div>
                     );
                   }
                   return null;
                 }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="none" 
                fillOpacity={1} 
                fill="url(#colorCompletion)" 
                isAnimationActive={true}
              />
              <Line 
                 type="monotone" 
                 dataKey="count" 
                 stroke="var(--success, #22C55E)" 
                 strokeWidth={2.5} 
                 dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: 'var(--success, #22C55E)' }} 
                 activeDot={{ r: 5, fill: '#fff', stroke: 'var(--success, #22C55E)', strokeWidth: 2 }} 
                 isAnimationActive={true}
                 animationDuration={800}
                 animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
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
