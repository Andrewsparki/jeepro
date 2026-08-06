"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { FloatingParticles } from "@/components/ui/floating-particles";
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
    <div className="relative overflow-hidden premium-card p-8 sm:p-12 isolation-auto min-h-[320px] flex items-center shadow-lg group">
      {/* Refined Animated Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none opacity-50" />
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] -mr-60 -mt-60 pointer-events-none mix-blend-screen transition-opacity duration-1000 group-hover:opacity-70" 
        style={{ animation: "bg-drift 20s ease-in-out infinite alternate" }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none mix-blend-screen" 
        style={{ animation: "bg-drift 25s ease-in-out infinite alternate-reverse" }}
      />
      
      {/* Floating Particles - Sparkles for daily mission */}
      <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen">
        <FloatingParticles />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between w-full">
        
        {/* Left Side: Greeting & Mission */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-semibold text-accent tracking-widest uppercase">Today&apos;s Mission</p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-bold tracking-wide animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Zap className="w-3.5 h-3.5" /> +150 XP Available
            </div>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground mb-4 leading-[1.1]">
              {greeting}, {userName}.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed font-medium">
              {lastActiveChapter 
                ? "You're making great progress. Ready to dive back in and master the next concept?"
                : "A new day to push your boundaries. Let's start a fresh study session."}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button 
              onClick={handleStart}
              size="lg"
              className="bg-foreground text-background hover:bg-white rounded-full px-8 h-12 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] group/btn"
            >
              {lastActiveChapter ? "Continue Studying" : "Start Today's Study"}
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
            </Button>
          </div>
        </div>

        {/* Right Side: Current Context */}
        {lastActiveChapter && (
          <div className="w-full md:w-[360px] shrink-0 rounded-2xl bg-surface border border-border/50 backdrop-blur-xl p-7 shadow-soft transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-hover hover:border-white/16 hover:shadow-medium">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Focus</span>
              <div className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-semibold">
                {lastActiveChapter.subjectName}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
              {lastActiveChapter.chapterTitle}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium mt-6">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-accent" />
                <span>Concept Mastery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                <span>~45 mins left</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
