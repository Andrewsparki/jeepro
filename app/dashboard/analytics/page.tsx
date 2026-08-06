"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { Clock, Target, Flame, Trophy } from "lucide-react";
import { AnimatedStatCard, StatCardSkeleton } from "@/features/analytics/components/animated-stat-card";
import { StudyHeatmapSkeleton } from "@/features/analytics/components/study-heatmap";
import { SubjectDistributionSkeleton } from "@/features/analytics/components/subject-distribution";
import { TrendChartSkeleton } from "@/features/analytics/components/trend-chart";
import { XPGrowthChartSkeleton } from "@/features/analytics/components/xp-growth-chart";
import { SessionsBarChartSkeleton } from "@/features/analytics/components/sessions-bar-chart";
import { FocusDistributionSkeleton } from "@/features/analytics/components/focus-distribution";
import { CompletionTrendSkeleton } from "@/features/analytics/components/completion-trend";
import { ActivityTimelineSkeleton } from "@/features/analytics/components/activity-timeline";
import { StreakCalendarSkeleton } from "@/features/analytics/components/streak-calendar";
import { LevelProgressChartSkeleton } from "@/features/analytics/components/level-progress-chart";

// Lazy load heavy chart components to prevent layout shifts and improve performance
const TrendChart = dynamic(
  () => import("@/features/analytics/components/trend-chart").then(mod => mod.TrendChart),
  { ssr: false, loading: () => <TrendChartSkeleton /> }
);

const SubjectDistribution = dynamic(
  () => import("@/features/analytics/components/subject-distribution").then(mod => mod.SubjectDistribution),
  { ssr: false, loading: () => <SubjectDistributionSkeleton /> }
);

const StudyHeatmap = dynamic(
  () => import("@/features/analytics/components/study-heatmap").then(mod => mod.StudyHeatmap),
  { ssr: false, loading: () => <StudyHeatmapSkeleton /> }
);

const XPGrowthChart = dynamic(
  () => import("@/features/analytics/components/xp-growth-chart").then(mod => mod.XPGrowthChart),
  { ssr: false, loading: () => <XPGrowthChartSkeleton /> }
);

const SessionsBarChart = dynamic(
  () => import("@/features/analytics/components/sessions-bar-chart").then(mod => mod.SessionsBarChart),
  { ssr: false, loading: () => <SessionsBarChartSkeleton /> }
);

const FocusDistribution = dynamic(
  () => import("@/features/analytics/components/focus-distribution").then(mod => mod.FocusDistribution),
  { ssr: false, loading: () => <FocusDistributionSkeleton /> }
);

const CompletionTrend = dynamic(
  () => import("@/features/analytics/components/completion-trend").then(mod => mod.CompletionTrend),
  { ssr: false, loading: () => <CompletionTrendSkeleton /> }
);

const ActivityTimeline = dynamic(
  () => import("@/features/analytics/components/activity-timeline").then(mod => mod.ActivityTimeline),
  { ssr: false, loading: () => <ActivityTimelineSkeleton /> }
);

const StreakCalendar = dynamic(
  () => import("@/features/analytics/components/streak-calendar").then(mod => mod.StreakCalendar),
  { ssr: false, loading: () => <StreakCalendarSkeleton /> }
);

const LevelProgressChart = dynamic(
  () => import("@/features/analytics/components/level-progress-chart").then(mod => mod.LevelProgressChart),
  { ssr: false, loading: () => <LevelProgressChartSkeleton /> }
);

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getDashboardMetrics>> | null>(null);
  
  useEffect(() => {
    async function loadData() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    loadData();
  }, []);

  if (!metrics) {
    // Return completely skeletonized page to avoid layout shifts
    return (
      <DashboardShell>
        <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <div className="h-9 w-40 bg-muted/20 rounded-lg animate-pulse" />
            <div className="h-5 w-64 bg-muted/20 rounded-md animate-pulse mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <XPGrowthChartSkeleton />
            <StreakCalendarSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SessionsBarChartSkeleton />
            <FocusDistributionSkeleton />
            <CompletionTrendSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StudyHeatmapSkeleton />
            </div>
            <ActivityTimelineSkeleton />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <SubjectDistributionSkeleton />
          </div>
        </div>
      </DashboardShell>
    );
  }

  const { study_sessions, syllabus, progress } = metrics;
  const totalHours = Math.floor(metrics.totalDurationSeconds / 3600);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-7xl mx-auto w-full animate-stagger-container">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your study performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStatCard
            title="Total Study Time"
            value={totalHours}
            suffix="h"
            icon={<Clock className="w-6 h-6 text-blue-400" />}
            iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            hoverTint="blue"
          />
          <AnimatedStatCard
            title="Sessions"
            value={metrics.sessionsCount}
            icon={<Target className="w-6 h-6 text-emerald-400" />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            hoverTint="emerald"
          />
          <AnimatedStatCard
            title="Total XP"
            value={metrics.xpDetails.totalXP}
            icon={<Trophy className="w-6 h-6 text-amber-400" />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            hoverTint="amber"
          />
          <AnimatedStatCard
            title="Current Streak"
            value={metrics.currentStreak}
            suffix=" Days"
            icon={<Flame className="w-6 h-6 text-orange-400" />}
            iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            hoverTint="orange"
          />
        </div>

        {/* Row 1: Weekly Study Time (Trend) + Level Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart sessions={study_sessions} />
          </div>
          <LevelProgressChart xpDetails={metrics.xpDetails} />
        </div>

        {/* Row 2: XP Growth + Streak Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <XPGrowthChart sessions={study_sessions} />
          <StreakCalendar sessions={study_sessions} />
        </div>

        {/* Row 3: Sessions, Focus, Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SessionsBarChart sessions={study_sessions} />
          <FocusDistribution sessions={study_sessions} />
          <CompletionTrend progress={progress} />
        </div>

        {/* Row 4: Study Heatmap + Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudyHeatmap sessions={study_sessions} />
          </div>
          <ActivityTimeline sessions={study_sessions} />
        </div>
        
        {/* Row 5: Subject Distribution */}
        <div className="grid grid-cols-1 gap-6">
          <SubjectDistribution sessions={study_sessions} syllabus={syllabus} />
        </div>
      </div>
    </DashboardShell>
  );
}
