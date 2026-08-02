"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { Clock, Flame, Target, Trophy, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";

export default function DashboardPage() {
  const { startSession, refreshKey } = useStudySession();
  const [metrics, setMetrics] = useState({
    masteredTopics: 0,
    inProgressTopics: 0,
    studyTimeFormatted: "0h 0m",
    sessionsCount: 0
  });

  useEffect(() => {
    async function loadMetrics() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    loadMetrics();
  }, [refreshKey]);

  return (
    <DashboardShell>
      <SectionHeading 
        title="Overview" 
        description="Here is what's happening with your preparation today."
      >
        <Button 
          onClick={() => startSession()}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
        >
          Start Session
        </Button>
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Study Time"
          value={metrics.studyTimeFormatted}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: "Total logged", isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Mastered Topics"
          value={metrics.masteredTopics.toString()}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          trend={{ value: "From Syllabus", isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="In Progress Topics"
          value={metrics.inProgressTopics.toString()}
          icon={<BookOpen className="h-4 w-4 text-accent" />}
          trend={{ value: "Currently studying", isPositive: true }}
          delay={0.3}
        />
        <StatCard
          title="Study Sessions"
          value={metrics.sessionsCount.toString()}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          trend={{ value: "Total sessions", isPositive: true }}
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <DashboardCard className="lg:col-span-4 flex flex-col" delay={0.5}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-medium text-lg">Weekly Goal</h3>
              <p className="text-sm text-muted-foreground">You are on track to hit your targets.</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-12">
            <ProgressRing progress={metrics.masteredTopics > 0 ? 30 : 0} size={160} strokeWidth={10} colorClassName="text-accent" />
            <div className="space-y-6 text-center sm:text-left">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Topics Mastered</p>
                <p className="text-2xl font-semibold">{metrics.masteredTopics} <span className="text-sm font-normal text-muted-foreground">/ 500</span></p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sessions Completed</p>
                <p className="text-2xl font-semibold">{metrics.sessionsCount} <span className="text-sm font-normal text-muted-foreground">/ 10</span></p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="lg:col-span-3 flex flex-col" delay={0.6}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-lg">Up Next</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              View All
            </Button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="group flex items-start gap-4 rounded-xl border border-border/40 p-4 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="p-2 rounded-lg bg-accent/10 text-accent mt-0.5">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium group-hover:text-accent transition-colors">Rotational Motion Revision</h4>
                <p className="text-xs text-muted-foreground mt-1">Physics • Planned for today</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            
            <div className="group flex items-start gap-4 rounded-xl border border-border/40 p-4 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mt-0.5">
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium group-hover:text-accent transition-colors">Integration PYQs</h4>
                <p className="text-xs text-muted-foreground mt-1">Maths • 45 questions pending</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardShell>
  );
}
