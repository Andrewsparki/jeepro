"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { Clock, Flame, Target, Trophy, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";
import { XPProgress } from "@/features/gamification/components/xp-progress";
import { AchievementCard } from "@/features/gamification/components/achievement-card";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/ui/animated-number";

// Utility to unwrap promise return type
type Metrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

export default function DashboardPage() {
  const { startSession, refreshKey } = useStudySession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    loadMetrics();
  }, [refreshKey]);

  if (!metrics) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <SectionHeading 
        title="Overview" 
        description="Here is what's happening with your preparation today."
      >
        <Button 
          onClick={() => {
            if (metrics.lastActiveChapter) {
              router.push(`/dashboard/study/${metrics.lastActiveChapter.subjectSlug}/${metrics.lastActiveChapter.chapterSlug}`);
            } else {
              startSession();
            }
          }}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
        >
          {metrics.lastActiveChapter ? "Continue Studying" : "Start Session"}
        </Button>
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Study Time"
          value={metrics.todayStudyTimeFormatted}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: "Logged today", isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Topics Completed"
          value={<AnimatedNumber value={metrics.topicsCompletedToday} />}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          trend={{ value: "Mastered today", isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Current Streak"
          value={<><AnimatedNumber value={metrics.currentStreak} /> Days</>}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          trend={{ value: "Keep it up!", isPositive: true }}
          delay={0.3}
        />
        <StatCard
          title="Total Sessions"
          value={<AnimatedNumber value={metrics.sessionsCount} />}
          icon={<Target className="h-4 w-4 text-accent" />}
          trend={{ value: "Overall progress", isPositive: true }}
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DashboardCard delay={0.5}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-medium text-lg">Weekly Goal</h3>
                <p className="text-sm text-muted-foreground">You are on track to hit your targets.</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-12">
              <ProgressRing 
                progress={metrics.sessionsCount > 0 ? Math.min(100, Math.round((metrics.sessionsCount / 10) * 100)) : 0} 
                size={160} 
                strokeWidth={10} 
                colorClassName="text-accent" 
              />
              <div className="space-y-6 text-center sm:text-left">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Topics Mastered</p>
                  <p className="text-2xl font-semibold"><AnimatedNumber value={metrics.masteredTopics} /> <span className="text-sm font-normal text-muted-foreground">/ 500</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sessions Completed</p>
                  <p className="text-2xl font-semibold"><AnimatedNumber value={metrics.sessionsCount} /> <span className="text-sm font-normal text-muted-foreground">/ 10</span></p>
                </div>
              </div>
            </div>
          </DashboardCard>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            <XPProgress xpDetails={metrics.xpDetails} />
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <DashboardCard delay={0.6}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-lg">Continue Learning</h3>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {metrics.lastActiveChapter ? (
                <div 
                  onClick={() => router.push(`/dashboard/study/${metrics.lastActiveChapter?.subjectSlug}/${metrics.lastActiveChapter?.chapterSlug}`)}
                  className="group flex items-start gap-4 rounded-xl border border-border/40 p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-accent/10 text-accent mt-0.5">
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium group-hover:text-accent transition-colors">
                      {metrics.lastActiveChapter.chapterTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.lastActiveChapter.subjectName} • Pick up where you left off
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-xl border-border">
                  <p className="text-sm text-muted-foreground mb-3">No active study sessions.</p>
                  <Button variant="outline" size="sm" onClick={() => startSession()}>
                    Start your first study session
                  </Button>
                </div>
              )}
            </div>
          </DashboardCard>

          <DashboardCard delay={0.7} className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-lg">Achievements</h3>
            </div>
            <div className="grid gap-4">
              {metrics.achievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardShell>
  );
}
