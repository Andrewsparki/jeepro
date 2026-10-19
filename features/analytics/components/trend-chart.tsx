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
import { format, subDays, startOfDay } from "date-fns";
import { Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { useReducedMotion } from "framer-motion";

interface TrendChartProps {
  sessions: StudySession[];
}

type TimeRange = "7D" | "30D" | "ALL";

export function TrendChart({ sessions }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const shouldReduceMotion = useReducedMotion();

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;

    const chartData = new Map<string, { date: Date; displayDate: string; hours: number; rawDuration: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      chartData.set(date.toISOString(), {
        date,
        displayDate: format(date, timeRange === "7D" ? "EEE" : "MMM d"),
        hours: 0,
        rawDuration: 0,
      });
    }

    for (const session of sessions) {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = chartData.get(sessionDate.toISOString());
      if (!dayData) continue;
      dayData.rawDuration += session.duration_seconds;
      dayData.hours = Number((dayData.rawDuration / 3600).toFixed(1));
    }

    return Array.from(chartData.values());
  }, [sessions, timeRange]);

  const maxHours = Math.max(...data.map(d => d.hours), 1); // Avoid 0 domain
  const peakDay = useMemo(() => {
    return data.reduce((peak, d) => (d.hours > peak.hours ? d : peak), { displayDate: "", hours: 0 });
  }, [data]);

  return (
    <GlassCard hoverTint="blue" className="flex flex-col h-[420px] relative overflow-hidden border-t border-t-[#78A9FF]/20 shadow-sm">
      <div className="flex items-center justify-between mb-4 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(120,169,255,0.2)] border border-accent/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl tracking-tight text-foreground">Study Trend</h3>
              {peakDay.hours > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 shadow-[0_0_10px_rgba(120,169,255,0.15)]">
                  <Sparkles className="w-3 h-3 text-[#78A9FF]" />
                  Peak: {peakDay.hours}h ({peakDay.displayDate})
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">Daily focus cadence across timeline</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50 shadow-sm">
          {(["7D", "30D", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 tracking-wider font-mono",
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

      <div className="flex-1 w-full min-h-[300px] relative z-10 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="colorHoursTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
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
              cursor={{ stroke: 'rgba(120,169,255,0.15)', strokeWidth: 28 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover/95 border border-border/70 text-popover-foreground p-3 rounded-xl shadow-strong z-50 min-w-[130px] backdrop-blur-md">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                        {payload[0].payload.displayDate}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                          <span className="text-xs font-semibold text-foreground">Study Time</span>
                        </div>
                        <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>{payload[0]?.value}h</span>
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
              isAnimationActive={!shouldReduceMotion}
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0B0D12', strokeWidth: 1.5, stroke: 'var(--accent)' }}
              activeDot={{ r: 5, fill: '#fff', stroke: 'var(--accent)', strokeWidth: 2 }}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={900}
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
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[420px]">
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
