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
import { GlassCard } from "@/components/ui/glass-card";

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
      { 
        name: "Deep Work (>45m)", 
        value: deep, 
        fill: "url(#deepGrad)", 
        legendColor: "#2563EB",
        percentage: total > 0 ? Math.round((deep / total) * 100) : 0 
      },
      { 
        name: "Focused (15-45m)", 
        value: focused, 
        fill: "url(#focusedGrad)", 
        legendColor: "#3B82F6",
        percentage: total > 0 ? Math.round((focused / total) * 100) : 0 
      },
      { 
        name: "Quick (<15m)", 
        value: quick, 
        fill: "url(#quickGrad)", 
        legendColor: "#60A5FA",
        percentage: total > 0 ? Math.round((quick / total) * 100) : 0 
      },
    ];

    return {
      data: items.filter(item => item.value > 0),
      totalSessions: total
    };
  }, [sessions]);

  // Background track data
  const trackData = [{ name: "Track", value: 1 }];

  const renderLegend = (props: any) => {
    const { payload } = props;
    const validItems = payload.filter((item: any) => item.value !== "Track");

    return (
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
        {validItems.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`} 
            className="flex items-center text-[10px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-all duration-300 cursor-default group/legend"
          >
            <span 
              className="w-2.5 h-2.5 rounded-full mr-2 transition-all duration-500 group-hover/legend:scale-125"
              style={{ 
                backgroundColor: entry.payload.legendColor || "#3B82F6",
                boxShadow: `0 0 6px ${entry.payload.legendColor}60`
              }} 
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <GlassCard hoverTint="blue" className="flex flex-col h-[400px]">
      <style>{`
        .focus-pie-cell {
          transition: filter 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 750ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          opacity: 0.85;
          cursor: pointer;
          outline: none;
        }
        .focus-pie-cell:hover {
          filter: drop-shadow(0px 0px 22px #3B82F6) !important;
          opacity: 1 !important;
        }
      `}</style>

      <div className="flex items-center justify-between mb-2 relative z-10 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight text-foreground">Focus Distribution</h3>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative z-10 pb-4 px-4">
        {totalSessions === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-surface/30 rounded-2xl border border-white/[0.02]">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <BrainCircuit className="w-6 h-6 text-blue-400 opacity-60" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">No Focus Data</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-[200px] text-center">Complete a study session to see your focus distribution.</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Center Metric Display */}
            <div className="absolute inset-0 pb-10 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-4xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                {totalSessions}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1 opacity-80">
                Sessions
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <defs>
                  <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="focusedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.75} />
                  </linearGradient>
                  <linearGradient id="quickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.55} />
                  </linearGradient>
                </defs>

                <Tooltip 
                  cursor={false}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 15px rgba(59,130,246,0.15)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '14px' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any, name: any, props: any) => [
                    <div key="tooltip-content" className="flex items-center gap-2">
                      <span className="text-foreground">{value} sessions</span>
                      <span className="text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{props.payload.percentage}%</span>
                    </div>, 
                    <span key="tooltip-name" className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">{name}</span>
                  ]}
                />
                
                <Legend 
                  content={renderLegend}
                  verticalAlign="bottom" 
                  height={40}
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
                  legendType="none"
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
                      fill={entry.fill} 
                      className="focus-pie-cell"
                      style={{ 
                        filter: `drop-shadow(0px 0px 4px ${entry.legendColor}40)`,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function FocusDistributionSkeleton() {
  return (
    <GlassCard hoverTint="blue" className="p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-8 border-muted/10 animate-pulse" />
      </div>
    </GlassCard>
  );
}
