"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { Clock, Flame, Target, Trophy } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useAuth } from "@/features/auth/components/auth-provider";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelUpToast } from "@/features/gamification/components/level-up-toast";
import { MilestoneCelebration } from "@/features/gamification/components/milestone-celebration";
import { DailyMissionsCard } from "@/features/daily-missions/components/daily-missions-card";
import { useDashboardData } from "@/features/dashboard/context/dashboard-data-context";
import { usePerformance } from "@/lib/performance-context";

// Above-the-fold components
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { TodaysTimeline } from "@/features/dashboard/components/todays-timeline";
import { ContinueLearning } from "@/features/dashboard/components/continue-learning";
import { MotivationalQuotes } from "@/features/dashboard/components/motivational-quotes";

const WeeklyProgress = dynamic(
  () => import("@/features/dashboard/components/weekly-progress").then((mod) => mod.WeeklyProgress),
  {
    loading: () => <Skeleton className="h-[340px] w-full rounded-3xl" />,
  }
);

// Below-the-fold components
const JourneyTracker = dynamic(
  () => import("@/features/dashboard/components/journey-tracker").then((mod) => mod.JourneyTracker),
  {
    loading: () => (
      <div className="space-y-4 py-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    ),
  }
);

// Module-level guard to prevent replaying entrance sequence on client-side route transitions
let hasSessionEntrancePlayed = false;

// Coordinated cinematic entrance easing & variants
const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_LUXURY,
    },
  },
};

const statsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: EASE_LUXURY,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_LUXURY,
    },
  },
};

function DashboardSkeleton() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-7xl mx-auto w-full">
        {/* ROW 1: Hero & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 min-h-[260px]">
            <Skeleton className="w-full h-full rounded-3xl min-h-[260px]" />
          </div>
          <div className="xl:col-span-4 grid grid-cols-2 grid-rows-2 auto-rows-fr gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-glass-border bg-glass p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start min-h-[40px]">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-16 mt-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quotes Banner Skeleton */}
        <Skeleton className="w-full h-[120px] rounded-3xl" />

        {/* ROW 2: Timeline, Continue Learning & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-3xl border border-glass-border bg-glass p-6 min-h-[320px]">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-h-[240px]">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-[180px] w-full rounded-2xl" />
              </div>
              <div className="rounded-3xl border border-glass-border bg-glass p-6 min-h-[240px]">
                <Skeleton className="h-6 w-32 mb-6" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-14 flex-1 rounded-xl" />
              <Skeleton className="h-14 flex-1 rounded-xl" />
              <Skeleton className="h-14 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export function DashboardContent() {
  const { criticalMetrics, secondaryMetrics, isCriticalLoading } = useDashboardData();
  const { profile, user } = useAuth();
  const { ambientLighting, pageTransitions } = usePerformance();

  const controls = useAnimation();
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  // Initialize browser-dependent entrance effects only after hydration
  useEffect(() => {
    if (!pageTransitions) return;
    if (hasSessionEntrancePlayed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const stored = sessionStorage.getItem("jee_dashboard_entrance_played");
      if (stored === "true") return;
      hasSessionEntrancePlayed = true;
      sessionStorage.setItem("jee_dashboard_entrance_played", "true");
      setShouldAnimate(true);
      controls.set("hidden");
      controls.start("visible");
    } catch {
      // Ignore storage access errors
    }
  }, [controls, pageTransitions]);

  if (isCriticalLoading || !criticalMetrics) {
    return <DashboardSkeleton />;
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const firstName = displayName.split(" ")[0];
  const currentLevel = secondaryMetrics?.xpDetails?.currentLevel ?? 1;

  return (
    <DashboardShell>
      {secondaryMetrics && (
        <>
          <LevelUpToast currentLevel={currentLevel} />
          <MilestoneCelebration streakDays={criticalMetrics.currentStreak} />
        </>
      )}

      <div className="relative flex flex-col gap-6 md:gap-8 pb-10 max-w-7xl mx-auto">
        {/* Subtle Obsidian + Electric Blue Atmospheric Background Lighting */}
        {ambientLighting && (
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] -z-10 overflow-hidden select-none">
            <div className="absolute -top-[100px] left-[15%] w-[480px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(67,120,255,0.08),transparent_70%)] blur-[70px] transform-gpu" />
            <div className="absolute top-[30px] right-[18%] w-[420px] h-[260px] bg-[radial-gradient(ellipse_at_center,rgba(120,169,255,0.05),transparent_70%)] blur-[80px] transform-gpu" />
          </div>
        )}

        {/* ROW 1: Hero & Metric Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <motion.div
            variants={heroVariants}
            initial={false}
            animate={controls}
            className="xl:col-span-8 flex flex-col"
          >
            <DashboardHero userName={firstName} lastActiveChapter={criticalMetrics.lastActiveChapter} />
          </motion.div>

          <motion.div
            variants={statsContainerVariants}
            initial={false}
            animate={controls}
            className="xl:col-span-4 grid grid-cols-2 grid-rows-2 auto-rows-fr gap-4"
          >
            <motion.div variants={statCardVariants} className="h-full">
              <StatCard
                title="Today's Study Time"
                value={
                  <div className="flex items-baseline gap-1">
                    {criticalMetrics.todayStudyHours > 0 && (
                      <>
                        <AnimatedNumber value={criticalMetrics.todayStudyHours} />
                        <span className="text-xl font-normal text-muted-foreground/80 -ml-0.5">h</span>
                      </>
                    )}
                    <AnimatedNumber value={criticalMetrics.todayStudyMinutes} />
                    <span className="text-xl font-normal text-muted-foreground/80 -ml-0.5">m</span>
                  </div>
                }
                icon={<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                iconContainerClassName="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                hoverTint="blue"
              />
            </motion.div>

            <motion.div variants={statCardVariants} className="h-full">
              <StatCard
                title="Topics Mastered"
                value={<AnimatedNumber value={criticalMetrics.masteredTopics} />}
                icon={<Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                iconContainerClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                hoverTint="emerald"
              />
            </motion.div>

            <motion.div variants={statCardVariants} className="h-full">
              <StatCard
                title="Current Streak"
                value={
                  <>
                    <AnimatedNumber value={criticalMetrics.currentStreak} /> <span className="text-xl">d</span>
                  </>
                }
                icon={<Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                iconContainerClassName="bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 dark:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                hoverTint="orange"
              />
            </motion.div>

            <motion.div variants={statCardVariants} className="h-full">
              <StatCard
                title="Level"
                value={<AnimatedNumber value={currentLevel} />}
                icon={<Trophy className="h-4 w-4 text-amber-700 dark:text-amber-400" />}
                iconContainerClassName="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 dark:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                hoverTint="amber"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Motivational Quotes Banner */}
        <motion.div
          variants={sectionVariants}
          initial={false}
          animate={controls}
        >
          <MotivationalQuotes />
        </motion.div>

        {/* ROW 2: Timeline, Continue Learning & Quick Actions */}
        <motion.div
          variants={sectionVariants}
          initial={false}
          animate={controls}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <DashboardCard
            className="lg:col-span-4 min-h-[320px]"
            data-context-target="dashboard-widget"
            data-context-id="timeline"
            data-context-title="Today's Timeline"
            data-context-data={JSON.stringify({ widget: "timeline" })}
          >
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Today&apos;s Timeline</h3>
              <p className="text-sm text-muted-foreground">Your scheduled sessions</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              {secondaryMetrics ? (
                <TodaysTimeline events={secondaryMetrics.todaysEvents} />
              ) : (
                <div className="space-y-4 py-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              )}
            </div>
          </DashboardCard>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="flex flex-col min-h-[240px]"
                data-context-target="dashboard-widget"
                data-context-id="continue-learning"
                data-context-title="Continue Learning"
                data-context-data={JSON.stringify({
                  widget: "continue-learning",
                  subjectSlug: criticalMetrics.lastActiveChapter?.subjectSlug,
                  chapterSlug: criticalMetrics.lastActiveChapter?.chapterSlug,
                })}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Continue Learning</h3>
                </div>
                <ContinueLearning lastActiveChapter={criticalMetrics.lastActiveChapter} />
              </div>

              <DashboardCard
                className="min-h-[240px] flex flex-col justify-between"
                data-context-target="dashboard-widget"
                data-context-id="weekly-progress"
                data-context-title="Weekly Progress"
                data-context-data={JSON.stringify({ widget: "weekly-progress" })}
              >
                <WeeklyProgress
                  hoursCompleted={criticalMetrics.weeklyStudyHours}
                  sessions={criticalMetrics.study_sessions}
                  animate={shouldAnimate}
                />
              </DashboardCard>
            </div>

            <QuickActions />
          </div>
        </motion.div>

        {/* ROW 3: Journey & Bottom content */}
        <motion.div
          variants={sectionVariants}
          initial={false}
          animate={controls}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <DashboardCard
            className="lg:col-span-5"
            data-context-target="dashboard-widget"
            data-context-id="stat-streak"
            data-context-title="Your Journey"
            data-context-data={JSON.stringify({ widget: "stat-streak" })}
          >
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Your Journey</h3>
              <p className="text-sm text-muted-foreground">Progress towards the next milestone</p>
            </div>
            {secondaryMetrics ? (
              <JourneyTracker
                xpDetails={secondaryMetrics.xpDetails}
                achievements={secondaryMetrics.achievements}
              />
            ) : (
              <div className="space-y-4 py-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}
          </DashboardCard>

          <div
            className="lg:col-span-7"
            data-context-target="dashboard-widget"
            data-context-id="missions"
            data-context-title="Daily Missions"
            data-context-data={JSON.stringify({ widget: "missions" })}
          >
            {secondaryMetrics ? (
              <DailyMissionsCard missions={secondaryMetrics.dailyMissions} />
            ) : (
              <DailyMissionsCard isLoading={true} />
            )}
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
