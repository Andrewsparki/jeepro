"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { CheckCircle2, Pencil, Check, X, Sparkles } from "lucide-react";
import { StudySession } from "@/features/study/services/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ComposedChart, Area, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";

interface WeeklyProgressProps {
  hoursCompleted: number;
  weeklyGoalHours?: number;
  sessions?: StudySession[];
  animate?: boolean;
}

const DEFAULT_SUGGESTED_GOAL = 20;

export const WeeklyProgress = React.memo(function WeeklyProgress({
  hoursCompleted,
  weeklyGoalHours: propsWeeklyGoalHours,
  sessions = [],
  animate = true,
}: WeeklyProgressProps) {
  const { settings, updateSetting, playSound } = useSettings();

  // Determine current effective goal: settings store > prop override > suggested default
  const effectiveGoal = useMemo(() => {
    if (typeof settings.weeklyGoalHours === "number" && settings.weeklyGoalHours > 0) {
      return settings.weeklyGoalHours;
    }
    if (typeof propsWeeklyGoalHours === "number" && propsWeeklyGoalHours > 0) {
      return propsWeeklyGoalHours;
    }
    return DEFAULT_SUGGESTED_GOAL;
  }, [settings.weeklyGoalHours, propsWeeklyGoalHours]);

  const isCustomConfigured = settings.isCustomWeeklyGoal === true;

  // Edit Target inline popover/modal state
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState<string>(String(effectiveGoal));
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputVal(String(effectiveGoal));
      setValidationError(null);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, effectiveGoal]);

  const handleStartEditing = () => {
    setInputVal(String(effectiveGoal));
    setValidationError(null);
    setIsEditing(true);
    playSound("click");
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setValidationError(null);
    playSound("toggleOff");
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(inputVal.trim(), 10);

    if (isNaN(parsed) || parsed <= 0) {
      setValidationError("Goal must be at least 1 hour");
      playSound("danger");
      return;
    }

    if (parsed > 168) {
      setValidationError("Goal cannot exceed 168 hours in a week");
      playSound("danger");
      return;
    }

    updateSetting("weeklyGoalHours", parsed);
    updateSetting("isCustomWeeklyGoal", true);
    setIsEditing(false);
    setValidationError(null);
    playSound("celebration");
  };

  const handleQuickPreset = (hours: number) => {
    setInputVal(String(hours));
    setValidationError(null);
    playSound("click");
  };

  const safeGoal = Math.max(1, effectiveGoal);
  const progressPercentage = Math.min(100, (hoursCompleted / safeGoal) * 100);
  const isGoalMet = hoursCompleted >= safeGoal;

  // Real consistency data for the mini graph (last 7 days)
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - i));
      dayDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      return {
        key: `${dayDate.toISOString().slice(0, 10)}`,
        dayDate,
        nextDay,
        name: days[dayDate.getDay()],
        fullDate: format(dayDate, "MMM d"),
        actual: 0,
        target: Number((safeGoal / 7).toFixed(1))
      };
    });

    for (const session of sessions) {
      const sessionDate = new Date(session.started_at);
      const bucket = buckets.find((entry) => {
        return sessionDate >= entry.dayDate && sessionDate < entry.nextDay;
      });

      if (!bucket) continue;
      const seconds = session.duration_seconds || 0;
      bucket.actual += Number((seconds / 3600).toFixed(1));
    }

    return buckets.map((entry) => ({
      name: entry.name,
      fullDate: entry.fullDate,
      actual: Number(entry.actual.toFixed(1)),
      target: entry.target
    }));
  }, [sessions, safeGoal]);

  return (
    <div className="flex flex-col h-full justify-between relative group">

      {/* Header section */}
      <div className="relative z-10 px-1 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-accent dark:text-sky-400 tracking-[0.2em] uppercase">Weekly Target</p>
            {!isCustomConfigured ? (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-accent" /> Suggested
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isGoalMet && (
              <div className="flex items-center gap-1.5 text-accent dark:text-sky-300 text-[10px] font-bold bg-accent/10 dark:bg-sky-950/40 border border-accent/20 dark:border-sky-500/20 px-2 py-0.5 rounded-md shadow-xs dark:shadow-[0_0_10px_rgba(56,189,248,0.15)]">
                <CheckCircle2 className="w-3 h-3" /> Goal Met
              </div>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] border border-transparent hover:border-white/[0.1] px-2 py-0.5 rounded-md transition-all cursor-pointer select-none"
                title="Edit weekly study target"
                aria-label="Edit weekly study target"
              >
                <Pencil className="w-3 h-3 text-muted-foreground/80" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline Edit Form Overlay */}
        {isEditing ? (
          <form onSubmit={handleSave} className="mb-2 p-3 rounded-xl bg-[#0B0D12] border border-[#2B3342] shadow-xl animate-in fade-in zoom-in-95 duration-150 relative z-30">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="weekly-goal-input" className="text-xs font-semibold text-foreground">
                Set Weekly Goal (Hours)
              </label>
              <div className="flex items-center gap-1">
                {[14, 20, 28, 35].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickPreset(preset)}
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer",
                      inputVal === String(preset)
                        ? "bg-[#78A9FF]/20 text-[#78A9FF] border-[#78A9FF]/40 font-bold"
                        : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:text-foreground"
                    )}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="weekly-goal-input"
                  ref={inputRef}
                  type="number"
                  min="1"
                  max="168"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#121722] border border-[#2B3342] text-sm font-mono text-foreground focus:outline-none focus:border-[#78A9FF] focus:ring-1 focus:ring-[#78A9FF]"
                  placeholder="e.g. 25"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
                  hrs/wk
                </span>
              </div>

              <button
                type="submit"
                className="h-8 px-3 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Save target"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEditing}
                className="h-8 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground text-xs border border-white/[0.08] inline-flex items-center transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {validationError && (
              <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{validationError}</p>
            )}
          </form>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-4xl font-bold tracking-tighter text-foreground flex items-baseline dark:drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <AnimatedNumber value={hoursCompleted} />
                <span className="text-2xl ml-0.5 text-accent dark:text-sky-400">h</span>
              </h2>
              <p className="text-lg text-muted-foreground pb-0.5 font-medium">/ {safeGoal}h</p>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Progress</p>
              <p className="text-lg font-bold text-accent dark:text-sky-400 dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                <AnimatedNumber value={Math.round(progressPercentage)} />%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic Glowing Chart */}
      <div className="flex-1 mt-4 w-[calc(100%+32px)] -mx-4 relative min-h-[140px] select-none pointer-events-auto">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }}
              dy={10}
            />

            {/* Custom Tooltip matching the design system */}
            <Tooltip
              cursor={{ stroke: 'rgba(100,116,139,0.1)', strokeWidth: 30 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover/95 border border-border/70 text-popover-foreground backdrop-blur-xl p-3 rounded-xl shadow-strong z-50 min-w-[120px]">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {payload[0].payload.fullDate}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                            <span className="text-xs font-semibold text-foreground">Actual</span>
                          </div>
                          <span className="text-xs font-bold text-sky-500 dark:text-sky-400">{payload[1]?.value}h</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                            <span className="text-xs font-semibold text-foreground">Target</span>
                          </div>
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{payload[0]?.value}h</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="target"
              stroke="none"
              fill="url(#gradPurple)"
              isAnimationActive={animate}
              animationDuration={850}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#gradCyan)"
              isAnimationActive={animate}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={animate}
              animationDuration={850}
              animationEasing="ease-out"
            />

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: '#38bdf8' }}
              activeDot={{ r: 5, fill: '#fff', stroke: '#38bdf8', strokeWidth: 2 }}
              isAnimationActive={animate}
              animationDuration={1050}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer legend */}
      <div className="flex justify-center items-center gap-6 mt-1 border-t border-border/50 pt-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Target</span>
        </div>
      </div>
    </div>
  );
});
