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
import { format, subDays, startOfDay } from "date-fns";
import { CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { useReducedMotion } from "framer-motion";

interface SessionsBarChartProps {
  sessions: StudySession[];
}

type TimeRange = "7D" | "30D";

export function SessionsBarChart({ sessions }: SessionsBarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = timeRange === "7D" ? 7 : 30;

    const dateMap = new Map<string, { date: Date; displayDate: string; count: number }>();
    const chartData: { date: Date; displayDate: string; count: number }[] = [];

    // Pre-populate time series
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const item = {
        date,
        displayDate: format(date, timeRange === "7D" ? "EEE" : "MMM d"),
        count: 0,
      };
      dateMap.set(format(date, "yyyy-MM-dd"), item);
      chartData.push(item);
    }

    // Populate data with O(1) map indexing
    for (const session of sessions) {
      if (session.started_at) {
        const key = format(new Date(session.started_at), "yyyy-MM-dd");
        const entry = dateMap.get(key);
        if (entry) {
          entry.count += 1;
        }
      }
    }

    return chartData;
  }, [sessions, timeRange]);

  const shouldReduceMotion = useReducedMotion();
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const peakDay = useMemo(() => {
    return data.reduce((peak, d) => (d.count > peak.count ? d : peak), { displayDate: "", count: 0 });
  }, [data]);

  return (
    <GlassCard hoverTint="emerald" className="flex flex-col h-[420px] relative overflow-hidden border-t border-t-emerald-500/20 shadow-sm">
      <div className="flex items-center justify-between mb-4 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(120,169,255,0.2)] border border-accent/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl tracking-tight text-foreground">Sessions Per Day</h3>
              {peakDay.count > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Peak: {peakDay.count} sessions
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">Daily study session velocity</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50 shadow-sm">
          {(["7D", "30D"] as TimeRange[]).map((range) => (
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
                    <div className="bg-popover/95 border border-border/70 text-popover-foreground p-3 rounded-xl shadow-strong z-50 min-w-[130px] backdrop-blur-md">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                        {payload[0].payload.displayDate}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                          <span className="text-xs font-semibold text-foreground">Sessions</span>
                        </div>
                        <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>{payload[0]?.value}</span>
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
              barSize={timeRange === "7D" ? 38 : 12}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={850}
              animationEasing="ease-out"
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
