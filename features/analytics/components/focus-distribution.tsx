"use client";

import { useMemo, useState } from "react";
import { StudySession } from "@/features/study/services/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { BrainCircuit } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface FocusDistributionProps {
  sessions: StudySession[];
}

interface FocusCategoryItem {
  id: "quick" | "focused" | "deep";
  name: string;
  shortName: string;
  durationLabel: string;
  value: number;
  percentage: number;
  totalMinutes: number;
  color: string;
  glowColor: string;
  gradientId: string;
  borderClass: string;
  badgeBg: string;
}

export function FocusDistribution({ sessions }: FocusDistributionProps) {
  const [hoveredCategory, setHoveredCategory] = useState<FocusCategoryItem | null>(null);

  const { allCategories, activeCategories, totalSessions, totalMinutesAll } = useMemo(() => {
    let quickCount = 0;
    let focusedCount = 0;
    let deepCount = 0;
    let quickMins = 0;
    let focusedMins = 0;
    let deepMins = 0;

    sessions.forEach(session => {
      const minutes = (session.duration_seconds || 0) / 60;
      if (minutes < 15) {
        quickCount++;
        quickMins += minutes;
      } else if (minutes < 45) {
        focusedCount++;
        focusedMins += minutes;
      } else {
        deepCount++;
        deepMins += minutes;
      }
    });

    const total = quickCount + focusedCount + deepCount;
    const totalMins = quickMins + focusedMins + deepMins;

    // Coordinated Obsidian + Electric Blue palette:
    // Deep Work (>45m) -> Rich Electric Indigo (#6366F1 / #4F46E5)
    // Focused (15-45m) -> Signature Electric Cyan/Blue (#38BDF8 / #0284C7)
    // Quick (<15m) -> Vibrant Ice Blue / Cyan (#A8C5FF / #78A9FF)
    const items: FocusCategoryItem[] = [
      {
        id: "deep",
        name: "Deep Work (>45m)",
        shortName: "Deep Work",
        durationLabel: ">45m",
        value: deepCount,
        percentage: total > 0 ? Math.round((deepCount / total) * 100) : 0,
        totalMinutes: Math.round(deepMins),
        color: "#6366F1",
        glowColor: "rgba(99, 102, 241, 0.45)",
        gradientId: "deepGrad",
        borderClass: "border-indigo-500/30",
        badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      },
      {
        id: "focused",
        name: "Focused (15-45m)",
        shortName: "Focused",
        durationLabel: "15-45m",
        value: focusedCount,
        percentage: total > 0 ? Math.round((focusedCount / total) * 100) : 0,
        totalMinutes: Math.round(focusedMins),
        color: "#38BDF8",
        glowColor: "rgba(56, 189, 248, 0.45)",
        gradientId: "focusedGrad",
        borderClass: "border-sky-500/30",
        badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      },
      {
        id: "quick",
        name: "Quick (<15m)",
        shortName: "Quick",
        durationLabel: "<15m",
        value: quickCount,
        percentage: total > 0 ? Math.round((quickCount / total) * 100) : 0,
        totalMinutes: Math.round(quickMins),
        color: "#78A9FF",
        glowColor: "rgba(120, 169, 255, 0.45)",
        gradientId: "quickGrad",
        borderClass: "border-[#78A9FF]/30",
        badgeBg: "bg-[#78A9FF]/10 text-[#78A9FF] border-[#78A9FF]/20",
      },
    ];

    return {
      allCategories: items,
      activeCategories: items.filter(i => i.value > 0),
      totalSessions: total,
      totalMinutesAll: Math.round(totalMins),
    };
  }, [sessions]);

  // Background track data
  const trackData = [{ name: "Track", value: 1 }];

  // Active display metric: hovered category details or total sessions
  const activeFocus = hoveredCategory;

  return (
    <GlassCard hoverTint="blue" className="flex flex-col h-[400px] relative overflow-hidden">
      <style>{`
        .focus-pie-cell {
          transition: transform 250ms ease, filter 250ms ease, opacity 250ms ease !important;
          cursor: pointer;
          outline: none;
        }
        .focus-pie-cell:hover {
          filter: brightness(1.2) drop-shadow(0 0 14px currentColor) !important;
        }
      `}</style>

      {/* Widget Header */}
      <div className="flex items-center justify-between relative z-10 px-5 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/20">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-foreground">Focus Distribution</h3>
            <p className="text-[11px] text-muted-foreground font-mono">Session duration segmentation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative z-10 px-4 pb-4 flex flex-col justify-between">
        {totalSessions === 0 ? (
          /* Empty State */
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-surface/20 rounded-2xl border border-white/[0.04]">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <BrainCircuit className="w-6 h-6 text-blue-400 opacity-60" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">No Focus Data</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[220px] text-center">
              Complete a study session to see your focus distribution across depth tiers.
            </p>
          </div>
        ) : activeCategories.length === 1 ? (
          /* Single-category Informative Horizontal Distribution State */
          <div className="w-full h-full flex flex-col justify-between py-2">
            <div className="p-4 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Dominant Focus Pattern</span>
                <h4 className="text-xl font-extrabold text-foreground tracking-tight mt-0.5">
                  100% {activeCategories[0].shortName}
                </h4>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  All {totalSessions} session{totalSessions === 1 ? "" : "s"} fall under the {activeCategories[0].durationLabel} tier ({totalMinutesAll}m total).
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-mono font-extrabold text-foreground">
                  {totalSessions}
                </span>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Sessions</p>
              </div>
            </div>

            {/* Horizontal Distribution Track */}
            <div className="space-y-2 px-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground font-semibold">Distribution Spread</span>
                <span className="text-sky-400 font-bold">{totalSessions} / {totalSessions} (100%)</span>
              </div>
              <div className="h-4 w-full rounded-full bg-white/[0.04] p-0.5 border border-white/[0.08] overflow-hidden flex">
                <div 
                  className="h-full rounded-full transition-all duration-700 relative group/bar"
                  style={{ 
                    width: "100%",
                    backgroundColor: activeCategories[0].color,
                    boxShadow: `0 0 16px ${activeCategories[0].glowColor}`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/70">
                <span>Quick (&lt;15m)</span>
                <span>Focused (15-45m)</span>
                <span>Deep (&gt;45m)</span>
              </div>
            </div>

            {/* Compact Category Breakdown Legend */}
            <div className="grid grid-cols-3 gap-2">
              {allCategories.map((cat) => {
                const isSelected = cat.id === activeCategories[0].id;
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center",
                      isSelected
                        ? "bg-white/[0.04] border-white/[0.12] shadow-sm"
                        : "bg-transparent border-white/[0.04] opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{cat.shortName}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-foreground">
                      {cat.value} <span className="text-[10px] font-normal text-muted-foreground">({cat.percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Multi-Category Segmented Donut Chart */
          <div className="flex flex-col h-full justify-between">
            <div className="relative w-full h-[220px]">
              {/* Dynamic Center Metric Display (changes on hover or selection) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                {activeFocus ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-3xl font-black font-mono tracking-tight" style={{ color: activeFocus.color }}>
                      {activeFocus.percentage}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                      {activeFocus.value} {activeFocus.value === 1 ? "Session" : "Sessions"}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/70">
                      {activeFocus.shortName} ({activeFocus.durationLabel})
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground">
                      {totalSessions}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                      Sessions
                    </span>
                  </div>
                )}
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="focusedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="quickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A8C5FF" stopOpacity={1} />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>

                  <Tooltip 
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as FocusCategoryItem;
                        return (
                          <div className="bg-[#0B0D12]/95 border border-[#2B3342] text-foreground backdrop-blur-xl p-2.5 rounded-xl shadow-2xl z-50 min-w-[130px]">
                            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              {item.name}
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold text-foreground">{item.value} sessions</span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                {item.percentage}%
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground/70 mt-1">
                              Total: {item.totalMinutes}m
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Subtle Background Track Ring */}
                  <Pie
                    data={trackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={84}
                    dataKey="value"
                    stroke="transparent"
                    fill="currentColor"
                    className="text-white/[0.04]"
                    isAnimationActive={false}
                    legendType="none"
                  />

                  {/* Active Segmented Donut Ring */}
                  <Pie
                    data={activeCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={86}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="transparent"
                    strokeWidth={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    cornerRadius={5}
                    onMouseEnter={(entry) => setHoveredCategory(entry as unknown as FocusCategoryItem)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {activeCategories.map((entry) => (
                      <Cell 
                        key={entry.id} 
                        fill={`url(#${entry.gradientId})`}
                        className="focus-pie-cell"
                        style={{
                          color: entry.color,
                          filter: hoveredCategory?.id === entry.id ? `drop-shadow(0 0 10px ${entry.glowColor})` : undefined,
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Informative Legend Bar with counts & percentages */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
              {allCategories.map((category) => {
                const isHovered = hoveredCategory?.id === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => setHoveredCategory(prev => prev?.id === category.id ? null : category)}
                    className={cn(
                      "p-2 rounded-xl border text-left transition-all cursor-pointer select-none",
                      isHovered
                        ? "bg-white/[0.06] border-white/[0.16] shadow-sm"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]",
                      category.value === 0 && "opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: category.color, boxShadow: `0 0 6px ${category.glowColor}` }} 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                        {category.shortName}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1 mt-1 font-mono">
                      <span className="text-xs font-bold text-foreground">
                        {category.value}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {category.percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
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

