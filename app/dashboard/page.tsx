"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { Clock, Flame, Target, Trophy } from "lucide-react";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useAuth } from "@/features/auth/components/auth-provider";
import dynamic from "next/dynamic";

// Static imports for above-the-fold content
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { TodaysTimeline } from "@/features/dashboard/components/todays-timeline";
import { ContinueLearning } from "@/features/dashboard/components/continue-learning";

// Dynamic imports for below-the-fold content to improve initial load
const WeeklyProgress = dynamic(() => import("@/features/dashboard/components/weekly-progress").then(mod => mod.WeeklyProgress));
const JourneyTracker = dynamic(() => import("@/features/dashboard/components/journey-tracker").then(mod => mod.JourneyTracker));

type Metrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

export default function DashboardPage() {
  const { refreshKey } = useStudySession();
  const { profile, user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      const data = await getDashboardMetrics();
      if (isMounted) setMetrics(data);
    }
    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  if (!metrics) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-[1600px] mx-auto">
        
        {/* ROW 1: Hero & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 min-h-full">
            <DashboardHero userName={firstName} lastActiveChapter={metrics.lastActiveChapter} />
          </div>
          
          <div className="xl:col-span-4 grid grid-cols-2 gap-4">
            <StatCard
              title="Today's Study Time"
              value={metrics.todayStudyTimeFormatted}
              icon={<Clock className="h-4 w-4" />}
              delay={0.1}
            />
            <StatCard
              title="Topics Mastered"
              value={<AnimatedNumber value={metrics.topicsCompletedToday} />}
              icon={<Target className="h-4 w-4" />}
              delay={0.2}
            />
            <StatCard
              title="Current Streak"
              value={<><AnimatedNumber value={metrics.currentStreak} /> <span className="text-xl">d</span></>}
              icon={<Flame className="h-4 w-4 text-orange-500" />}
              delay={0.3}
            />
            <StatCard
              title="Level"
              value={<AnimatedNumber value={metrics.xpDetails.currentLevel} />}
              icon={<Trophy className="h-4 w-4 text-accent" />}
              delay={0.4}
            />
          </div>
        </div>

        {/* ROW 2: Timeline, Continue Learning & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <DashboardCard className="lg:col-span-4 min-h-[400px]" delay={0.5}>
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Today&apos;s Timeline</h3>
              <p className="text-sm text-muted-foreground">Your scheduled sessions</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <TodaysTimeline events={metrics.todaysEvents} />
            </div>
          </DashboardCard>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col min-h-[240px]">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Continue Learning</h3>
                </div>
                <ContinueLearning lastActiveChapter={metrics.lastActiveChapter} />
              </div>
              
              <DashboardCard delay={0.7} className="min-h-[240px] flex flex-col justify-between">
                <WeeklyProgress hoursCompleted={metrics.weeklyStudyHours} weeklyGoalHours={20} />
              </DashboardCard>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
               <QuickActions />
            </div>
          </div>
          
        </div>

        {/* ROW 3: Journey & Bottom content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <DashboardCard className="lg:col-span-5" delay={0.8}>
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Your Journey</h3>
              <p className="text-sm text-muted-foreground">Progress towards the next milestone</p>
            </div>
            <JourneyTracker xpDetails={metrics.xpDetails} achievements={metrics.achievements} />
          </DashboardCard>
          
          {/* Empty column for future expansion or additional stats */}
          <div className="lg:col-span-7 rounded-3xl border border-dashed border-border/40 bg-muted/10 flex items-center justify-center p-8 text-center text-muted-foreground">
             <p className="text-sm">Additional modules (like Active Recall spaced repetition) will appear here.</p>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
