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
  Sparkles, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Activity,
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

import { useStudySession } from "@/features/study/context/study-session-context";

export default function AnalyticsPage() {
  const { refreshKey } = useStudySession();
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getDashboardMetrics>> | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    loadData();
  }, [refreshKey]);

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
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-muted/20 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-muted/20 rounded-md animate-pulse mt-1" />
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
  } = metrics;

  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const studyTimeSuffix = totalHours > 0 ? `h ${totalMinutes}m` : "m";
  const studyTimeValue = totalHours > 0 ? totalHours : totalMinutes;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto w-full animate-stagger-container">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 shadow-[0_0_12px_rgba(120,169,255,0.15)]">
                <Sparkles className="w-3 h-3 text-[#78A9FF]" />
                Intelligence Workspace
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Study Performance Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time insights across your JEE preparation momentum, syllabus coverage, and mastery rhythm.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-border/60 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
              <CalendarCheck className="w-4 h-4 text-[#78A9FF]" />
              <span>
                Today: <strong className="text-foreground">{todayStudyTimeFormatted}</strong>
              </span>
              <span className="text-border/80">•</span>
              <span>
                This Week: <strong className="text-foreground">{weeklyStudyHours}h</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatedStatCard
            title="Total Study Time"
            value={studyTimeValue}
            suffix={studyTimeSuffix}
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            hoverTint="blue"
          />
          <AnimatedStatCard
            title="Study Sessions"
            value={sessionsCount}
            icon={<Target className="w-5 h-5 text-emerald-400" />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            hoverTint="emerald"
          />
          <AnimatedStatCard
            title="Total XP Earned"
            value={xpDetails.totalXP}
            icon={<Trophy className="w-5 h-5 text-amber-400" />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            hoverTint="amber"
          />
          <AnimatedStatCard
            title="Active Streak"
            value={currentStreak}
            suffix=" Days"
            icon={<Flame className="w-5 h-5 text-orange-400" />}
            iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            hoverTint="orange"
          />
        </div>

        {/* Section 2: Subject-Wise Syllabus Mastery Intelligence */}
        {syllabus && syllabus.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#78A9FF]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Subject Mastery Distribution
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {masteredTopics} Mastered Topics Total
              </span>
            </div>
            <SubjectPerformanceOverview syllabus={syllabus} progress={progress} />
          </div>
        )}

        {/* Section 3: Study Trend & Level Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {chartsReady ? <TrendChart sessions={study_sessions} /> : <TrendChartSkeleton />}
          </div>
          {chartsReady ? <LevelProgressChart xpDetails={xpDetails} /> : <LevelProgressChartSkeleton />}
        </div>

        {/* Section 4: Focus Consistency & Session Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FocusConsistencyCard sessions={study_sessions} />
          <div className="lg:col-span-2">
            {chartsReady ? <SessionsBarChart sessions={study_sessions} /> : <SessionsBarChartSkeleton />}
          </div>
        </div>

        {/* Section 5: Deep Work Distribution & Topic Completion Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartsReady ? <FocusDistribution sessions={study_sessions} /> : <FocusDistributionSkeleton />}
          {chartsReady ? <CompletionTrend progress={progress} /> : <CompletionTrendSkeleton />}
        </div>

        {/* Section 6: XP Growth Progression & Monthly Streak Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartsReady ? <XPGrowthChart events={xpEvents} /> : <XPGrowthChartSkeleton />}
          {chartsReady ? <StreakCalendar sessions={study_sessions} /> : <StreakCalendarSkeleton />}
        </div>

        {/* Section 7: Longitudinal Study Heatmap & Live Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {chartsReady ? <StudyHeatmap sessions={study_sessions} /> : <StudyHeatmapSkeleton />}
          </div>
          {chartsReady ? <ActivityTimeline sessions={study_sessions} /> : <ActivityTimelineSkeleton />}
        </div>
      </div>
    </DashboardShell>
  );
}
