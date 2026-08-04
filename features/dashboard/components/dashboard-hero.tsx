"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudySession } from "@/features/study/context/study-session-context";
interface DashboardHeroProps {
  userName: string;
  lastActiveChapter: {
    subjectSlug: string;
    subjectName: string;
    chapterSlug: string;
    chapterTitle: string;
  } | null;
}

export const DashboardHero = React.memo(function DashboardHero({
  userName,
  lastActiveChapter
}: DashboardHeroProps) {
  const router = useRouter();
  const { startSession } = useStudySession();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const handleStart = () => {
    if (lastActiveChapter) {
      router.push(`/dashboard/study/${lastActiveChapter.subjectSlug}/${lastActiveChapter.chapterSlug}`);
    } else {
      startSession();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/40 p-8 sm:p-10 isolation-auto">
      {/* Premium Glass / Lighting Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        
        {/* Left Side: Greeting & Mission */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-sm font-medium text-accent tracking-wide uppercase mb-2">Today&apos;s Mission</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-2">
              {greeting}, {userName}.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {lastActiveChapter 
                ? "You're making great progress. Ready to dive back in and master the next concept?"
                : "A new day to push your boundaries. Let's start a fresh study session."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleStart}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm font-medium transition-transform hover:scale-105 active:scale-95 group"
            >
              {lastActiveChapter ? "Continue Studying" : "Start Today's Study"}
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        </div>

        {/* Right Side: Current Context */}
        {lastActiveChapter && (
          <div className="w-full md:w-[340px] shrink-0 rounded-2xl bg-background/50 border border-white/5 backdrop-blur-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Focus</span>
              <div className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                {lastActiveChapter.subjectName}
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-foreground mb-4 line-clamp-2">
              {lastActiveChapter.chapterTitle}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-4 h-4" /> Mastery</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full w-[45%]" />
              </div>
              
              <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /> Est. Time</span>
                <span className="font-medium">2h 15m</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
});
