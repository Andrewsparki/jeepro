"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { BrainCircuit } from "lucide-react";

interface FocusDistributionProps {
  sessions: StudySession[];
}

export function FocusDistribution({ sessions }: FocusDistributionProps) {
  const { data, totalSessions } = useMemo(() => {
    let quick = 0; // < 15m
    let focused = 0; // 15m - 45m
    let deep = 0; // > 45m

    sessions.forEach(session => {
      const minutes = session.duration_seconds / 60;
      if (minutes < 15) quick++;
      else if (minutes < 45) focused++;
      else deep++;
    });

    const total = quick + focused + deep;

    const items = [
      { name: "Quick Review (<15m)", value: quick, color: "#6366F1", percentage: total > 0 ? Math.round((quick / total) * 100) : 0 },
      { name: "Focused Study (15-45m)", value: focused, color: "#A855F7", percentage: total > 0 ? Math.round((focused / total) * 100) : 0 },
      { name: "Deep Work (>45m)", value: deep, color: "#EC4899", percentage: total > 0 ? Math.round((deep / total) * 100) : 0 },
    ];

    return {
      data: items.filter(item => item.value > 0),
      allItems: items,
      totalSessions: total
    };
  }, [sessions]);

  // Background track data
  const trackData = [{ name: "Track", value: 1 }];

  return (
    <div className="premium-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-2 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(79,70,229,0.15)] border border-accent/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Focus Distribution</h3>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative z-10 pb-4">
        {totalSessions === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">Not enough data</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Center Metric Display */}
            <div className="absolute inset-0 pb-9 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-3xl font-bold tracking-tight text-foreground">{totalSessions}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Sessions</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '14px' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value: any, name: any, props: any) => [`${value} sessions (${props.payload.percentage}%)`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-muted-foreground ml-1">{value}</span>
                  )}
                />
                
                {/* Background Track Ring */}
                <Pie
                  data={trackData}
                  cx="50%"
                  cy="45%"
                  innerRadius={78}
                  outerRadius={92}
                  dataKey="value"
                  stroke="transparent"
                  fill="rgba(255, 255, 255, 0.04)"
                  isAnimationActive={false}
                />

                {/* Active Data Ring */}
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={76}
                  outerRadius={94}
                  paddingAngle={data.length > 1 ? 4 : 0}
                  dataKey="value"
                  stroke="transparent"
                  strokeWidth={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  cornerRadius={data.length > 1 ? 6 : 0}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}60)` }} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export function FocusDistributionSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full bg-muted/10 rounded-full animate-pulse" style={{ margin: '20px' }} />
    </div>
  );
}
