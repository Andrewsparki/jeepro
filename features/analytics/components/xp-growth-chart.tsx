"use client";

import { useMemo } from "react";
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
import { format, startOfDay, addDays } from "date-fns";
import { Trophy } from "lucide-react";

interface XPGrowthChartProps {
  sessions: StudySession[];
}

export function XPGrowthChart({ sessions }: XPGrowthChartProps) {
  const data = useMemo(() => {
    // Sort sessions by date ascending
    const sorted = [...sessions].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    
    if (sorted.length === 0) return [];

    let cumulativeXP = 0;
    const chartData: { date: Date; displayDate: string; xp: number }[] = [];
    
    // Group by day and accumulate
    sorted.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const xpEarned = session.xp_earned || Math.floor(session.duration_seconds / 60); // fallback 1 XP per min
      
      cumulativeXP += xpEarned;

      // Check if we already have this day
      const existingDay = chartData.find(d => d.date.getTime() === sessionDate.getTime());
      if (existingDay) {
        existingDay.xp = cumulativeXP;
      } else {
        chartData.push({
          date: sessionDate,
          displayDate: format(sessionDate, "MMM d"),
          xp: cumulativeXP
        });
      }
    });

    // If only one day of data, add a previous day starting at 0 for visual curve
    if (chartData.length === 1) {
      chartData.unshift({
        date: addDays(chartData[0].date, -1),
        displayDate: format(addDays(chartData[0].date, -1), "MMM d"),
        xp: 0
      });
    }

    return chartData;
  }, [sessions]);

  const maxXP = data.length > 0 ? data[data.length - 1].xp : 100;

  return (
    <div className="premium-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)] border border-yellow-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">XP Growth</h3>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative z-10 px-4 pb-4">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Trophy className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">Start studying to earn XP</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0.0} />
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
                domain={[0, Math.ceil(maxXP * 1.1)]}
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
                cursor={{ stroke: '#EAB308', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#EAB308" 
                fillOpacity={1} 
                fill="url(#colorXP)" 
                strokeWidth={3}
                activeDot={{ r: 6, fill: "#EAB308", stroke: "hsl(var(--background))", strokeWidth: 3 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function XPGrowthChartSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full bg-muted/10 rounded-2xl animate-pulse" />
    </div>
  );
}
