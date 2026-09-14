"use client";

import { useMemo } from "react";
import { XPEvent } from "@/features/gamification/services/gamification";
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
import { format, startOfDay, addDays } from "date-fns";
import { Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface XPGrowthChartProps {
  events: XPEvent[];
}

export function XPGrowthChart({ events }: XPGrowthChartProps) {
  const data = useMemo(() => {
    // Sort events by date ascending
    const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sorted.length === 0) return [];

    let cumulativeXP = 0;
    const chartData: { date: Date; displayDate: string; xp: number }[] = [];
    
    // Group by day and accumulate
    sorted.forEach(event => {
      const eventDate = startOfDay(new Date(event.timestamp));
      
      cumulativeXP += event.xp;

      // Check if we already have this day
      const existingDay = chartData.find(d => d.date.getTime() === eventDate.getTime());
      if (existingDay) {
        existingDay.xp = cumulativeXP;
      } else {
        chartData.push({
          date: eventDate,
          displayDate: format(eventDate, "MMM d"),
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
  }, [events]);

  const maxXP = data.length > 0 ? data[data.length - 1].xp : 100;

  return (
    <GlassCard hoverTint="amber" className="flex flex-col h-[400px]">
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
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <defs>
                <filter id="neonGlowYellow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EAB308" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity={0} />
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
                             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                             <span className="text-xs font-semibold text-white">XP</span>
                           </div>
                           <span className="text-xs font-bold text-yellow-500">{payload[0]?.value}</span>
                         </div>
                       </div>
                     );
                   }
                   return null;
                 }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="none" 
                fillOpacity={1} 
                fill="url(#colorXP)" 
                isAnimationActive={true}
              />
              <Line 
                 type="monotone" 
                 dataKey="xp" 
                 stroke="#EAB308" 
                 strokeWidth={2.5} 
                 dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: '#EAB308' }} 
                 activeDot={{ r: 5, fill: '#fff', stroke: '#EAB308', strokeWidth: 2, style: { filter: 'url(#neonGlowYellow)' } }} 
                 style={{ filter: 'url(#neonGlowYellow)' }} 
                 isAnimationActive={true}
                 animationDuration={1500}
                 animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
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
