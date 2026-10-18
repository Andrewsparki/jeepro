"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { 
  Clock, 
  Target, 
  Flame, 
  Trophy, 
  Compass, 
  CalendarCheck
} from "lucide-react";
import { AnimatedStatCard, StatCardSkeleton } from "@/features/analytics/components/animated-stat-card";
import { StudyHeatmapSkeleton } from "@/features/analytics/components/study-heatmap";
import { TrendChartSkeleton } from "@/features/analytics/components/trend-chart";
import { XPGrowthChartSkeleton } from "@/features/analytics/components/xp-growth-chart";
import { SessionsBarChartSkeleton } from "@/features/analytics/components/sessions-bar-chart";
import { FocusDistributionSkeleton } from "@/features/analytics/components/focus-distribution";
import { CompletionTrendSkeleton } from "@/features/analytics/components/completion-trend";
import { ActivityTimelineSkeleton } from "@/features/analytics/components/activity-timeline";
import { StreakCalendarSkeleton } from "@/features/analytics/components/streak-calendar";
import { LevelProgressChartSkeleton } from "@/features/analytics/components/level-progress-chart";
import { SubjectPerformanceOverview } from "@/features/analytics/components/subject-performance-overview";
import { FocusConsistencyCard } from "@/features/analytics/components/focus-consistency-card";

// Lazy-load charts to avoid initial rendering lag and layout shifts
const TrendChart = dynamic(
  () => import("@/features/analytics/components/trend-chart").then((mod) => mod.TrendChart),
  { ssr: false, loading: () => <TrendChartSkeleton /> }
);

const StudyHeatmap = dynamic(
  () => import("@/features/analytics/components/study-heatmap").then((mod) => mod.StudyHeatmap),
  { ssr: false, loading: () => <StudyHeatmapSkeleton /> }
);

const XPGrowthChart = dynamic(
  () => import("@/features/analytics/components/xp-growth-chart").then((mod) => mod.XPGrowthChart),
  { ssr: false, loading: () => <XPGrowthChartSkeleton /> }
);

const SessionsBarChart = dynamic(
  () => import("@/features/analytics/components/sessions-bar-chart").then((mod) => mod.SessionsBarChart),
  { ssr: false, loading: () => <SessionsBarChartSkeleton /> }
);

const FocusDistribution = dynamic(
  () => import("@/features/analytics/components/focus-distribution").then((mod) => mod.FocusDistribution),
  { ssr: false, loading: () => <FocusDistributionSkeleton /> }
);

const CompletionTrend = dynamic(
  () => import("@/features/analytics/components/completion-trend").then((mod) => mod.CompletionTrend),
  { ssr: false, loading: () => <CompletionTrendSkeleton /> }
);

const ActivityTimeline = dynamic(
  () => import("@/features/analytics/components/activity-timeline").then((mod) => mod.ActivityTimeline),
  { ssr: false, loading: () => <ActivityTimelineSkeleton /> }
);

const StreakCalendar = dynamic(
  () => import("@/features/analytics/components/streak-calendar").then((mod) => mod.StreakCalendar),
  { ssr: false, loading: () => <StreakCalendarSkeleton /> }
);

const LevelProgressChart = dynamic(
  () => import("@/features/analytics/components/level-progress-chart").then((mod) => mod.LevelProgressChart),
  { ssr: false, loading: () => <LevelProgressChartSkeleton /> }
);

import { motion, useReducedMotion } from "framer-motion";
import { useStudySession } from "@/features/study/context/study-session-context";
import { useOptionalDashboardData } from "@/features/dashboard/context/dashboard-data-context";

export default function AnalyticsPage() {
  const { refreshKey } = useStudySession();
  const dashboardData = useOptionalDashboardData();
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getDashboardMetrics>> | null>(
    () => dashboardData?.metrics ?? null
  );
  const [chartsReady, setChartsReady] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (dashboardData?.metrics) {
      setMetrics(dashboardData.metrics);
      return;
    }
    async function loadData() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    loadData();
  }, [refreshKey, dashboardData?.metrics]);

  useEffect(() => {
    let idleId: number | ReturnType<typeof setTimeout> | undefined;
    const hasIdleCallback = typeof globalThis.requestIdleCallback === "function";

    if (hasIdleCallback) {
      idleId = globalThis.requestIdleCallback(() => setChartsReady(true));
    } else {
      idleId = globalThis.setTimeout(() => setChartsReady(true), 150);
    }

    return () => {
      if (typeof idleId === "number" && typeof globalThis.cancelIdleCallback === "function") {
        globalThis.cancelIdleCallback(idleId);
        return;
      }

      if (idleId) {
        globalThis.clearTimeout(idleId);
      }
    };
  }, []);

  if (!metrics) {
    return (
      <DashboardShell>
        <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2.5">
            <div className="h-6 w-52 bg-muted/20 rounded-full animate-pulse" />
            <div className="h-9 w-80 bg-muted/20 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-muted/20 rounded-md animate-pulse mt-0.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendChartSkeleton />
            </div>
            <LevelProgressChartSkeleton />
          </div>
        </div>
      </DashboardShell>
    );
  }

  const {
    totalDurationSeconds,
    sessionsCount,
    currentStreak,
    xpDetails,
    study_sessions,
    progress,
    xpEvents,
    syllabus,
    masteredTopics,
    todayStudyTimeFormatted,
    weeklyStudyHours,
    achievements,
  } = metrics;

  // Real derived calculations
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const studyTimeSuffix = totalHours > 0 ? `h ${totalMinutes}m` : "m";
  const studyTimeValue = totalHours > 0 ? totalHours : totalMinutes;

  const avgSessionMinutes = sessionsCount > 0 ? Math.round(totalDurationSeconds / sessionsCount / 60) : 0;
  const longestSessionSeconds =
    study_sessions && study_sessions.length > 0
      ? Math.max(...study_sessions.map((s) => s.duration_seconds || 0), 0)
      : 0;
  const longestSessionFormatted =
    longestSessionSeconds >= 3600
      ? `${Math.floor(longestSessionSeconds / 3600)}h ${Math.floor((longestSessionSeconds % 3600) / 60)}m`
      : `${Math.floor(longestSessionSeconds / 60)}m`;

  const unlockedBadgesCount = (achievements || []).filter((a) => a.unlocked).length;

  return (
    <DashboardShell>
      {/* ── Atmospheric Command Center Spotlight Layer ── */}
      <div className="absolute top-0 inset-x-0 h-[480px] overflow-hidden pointer-events-none -z-10 select-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1150px,96vw)] h-[440px] opacity-35 dark:opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(120, 169, 255, 0.24) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 75%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#78A9FF]/30 to-transparent" />
      </div>

      <div className="flex flex-col gap-10 pb-16 max-w-7xl mx-auto w-full relative">
        {/* ── Coordinated Header Reveal: Command Center HUD ── */}
        <motion.div 
          initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 shadow-[0_0_12px_rgba(120,169,255,0.18)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#78A9FF] animate-pulse" />
                COMMAND CENTER // LIVE TELEMETRY
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/60 hidden sm:inline">
                JEE PRO PERFORMANCE RADAR
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Study Performance Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Real-time telemetry tracking your deep work cadence, syllabus mastery trajectory, and cognitive velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-border/60 text-xs text-muted-foreground flex items-center gap-2.5 shadow-xs font-mono">
              <CalendarCheck className="w-4 h-4 text-[#78A9FF]" />
              <span>
                Today: <strong className="text-foreground">{todayStudyTimeFormatted}</strong>
              </span>
              <span className="text-border/80">•</span>
              <span>
                Week: <strong className="text-foreground">{weeklyStudyHours}h</strong>
              </span>
              {longestSessionSeconds > 0 && (
                <>
                  <span className="text-border/80 hidden lg:inline">•</span>
                  <span className="hidden lg:inline">
                    Peak Session: <strong className="text-foreground">{longestSessionFormatted}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Section 1: Executive KPI Podium Stat Cards (Staggered Sweep Reveal) ── */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatedStatCard
              title="Total Study Time"
              value={studyTimeValue}
              suffix={studyTimeSuffix}
              subtext={`Avg ${avgSessionMinutes}m per sitting`}
              badge="Hours Logged"
              delay={0.08}
              icon={<Clock className="w-5 h-5 text-blue-400" />}
              iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              hoverTint="blue"
            />
            <AnimatedStatCard
              title="Study Sessions"
              value={sessionsCount}
              subtext={`Peak block: ${longestSessionFormatted}`}
              badge="Focus Blocks"
              delay={0.16}
              icon={<Target className="w-5 h-5 text-emerald-400" />}
              iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              hoverTint="emerald"
            />
            <AnimatedStatCard
              title="Total XP Earned"
              value={xpDetails.totalXP}
              subtext={`Level ${xpDetails.currentLevel} • Tier ${Math.ceil(xpDetails.currentLevel / 5)}`}
              badge="Scholar XP"
              delay={0.24}
              icon={<Trophy className="w-5 h-5 text-amber-400" />}
              iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              hoverTint="amber"
            />
            <AnimatedStatCard
              title="Active Streak"
              value={currentStreak}
              suffix=" Days"
              subtext={currentStreak > 0 ? "Daily rhythm active" : "Log a session today"}
              badge="Momentum"
              delay={0.32}
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              hoverTint="orange"
            />
          </div>
        </section>

        {/* ── Section 2: Study Trend & Level Milestone Spotlight ── */}
        <motion.section 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
          aria-label="Core Performance Trajectory"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
              [01 // CORE TRAJECTORY & MILESTONE SPOTLIGHT]
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {chartsReady ? <TrendChart sessions={study_sessions} /> : <TrendChartSkeleton />}
            </div>
            {chartsReady ? (
              <LevelProgressChart xpDetails={xpDetails} achievementsCount={unlockedBadgesCount} />
            ) : (
              <LevelProgressChartSkeleton />
            )}
          </div>
        </motion.section>

        {/* ── Section 3: Subject-Wise Syllabus Mastery Radar ── */}
        {syllabus && syllabus.length > 0 && (
          <motion.section 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
            aria-label="Subject Mastery Radar"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#78A9FF]" />
                <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
                  [02 // SYLLABUS MASTERY RADAR]
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {masteredTopics} Mastered Topics Total
              </span>
            </div>
            <SubjectPerformanceOverview syllabus={syllabus} progress={progress} />
          </motion.section>
        )}

        {/* ── Section 4: Focus Consistency & Session Velocity ── */}
        <motion.section 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
          aria-label="Focus Consistency and Velocity"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
              [03 // VELOCITY & FOCUS DISCIPLINE]
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FocusConsistencyCard sessions={study_sessions} />
            <div className="lg:col-span-2">
              {chartsReady ? <SessionsBarChart sessions={study_sessions} /> : <SessionsBarChartSkeleton />}
            </div>
          </div>
        </motion.section>

        {/* ── Section 5: Deep Work Distribution & Topic Completion Flow ── */}
        <motion.section 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
          aria-label="Cognitive Distribution and Flow"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
              [04 // COGNITIVE DISTRIBUTION & TOPIC FLOW]
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartsReady ? <FocusDistribution sessions={study_sessions} /> : <FocusDistributionSkeleton />}
            {chartsReady ? <CompletionTrend progress={progress} /> : <CompletionTrendSkeleton />}
          </div>
        </motion.section>

        {/* ── Section 6: XP Growth Progression & Monthly Streak Calendar ── */}
        <motion.section 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
          aria-label="XP Growth and Streak Progression"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
              [05 // XP GROWTH TRAJECTORY & STREAK CALENDAR]
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartsReady ? <XPGrowthChart events={xpEvents} /> : <XPGrowthChartSkeleton />}
            {chartsReady ? <StreakCalendar sessions={study_sessions} /> : <StreakCalendarSkeleton />}
          </div>
        </motion.section>

        {/* ── Section 7: Longitudinal Study Heatmap & Live Activity Timeline ── */}
        <motion.section 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
          aria-label="Study Heatmap and Activity Timeline"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#78A9FF] tracking-wider">
              [06 // LONGITUDINAL STUDY MATRIX & ACTIVITY TIMELINE]
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {chartsReady ? <StudyHeatmap sessions={study_sessions} /> : <StudyHeatmapSkeleton />}
            </div>
            {chartsReady ? <ActivityTimeline sessions={study_sessions} /> : <ActivityTimelineSkeleton />}
          </div>
        </motion.section>
      </div>
    </DashboardShell>
  );
}
