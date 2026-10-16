"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Clock, Zap } from "lucide-react";
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleStart = () => {
    if (lastActiveChapter) {
      router.push(`/dashboard/study/${lastActiveChapter.subjectSlug}/${lastActiveChapter.chapterSlug}`);
    } else {
      startSession();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-7 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex items-center group">
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between w-full">
        
        {/* Left Side: Greeting & Mission */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              STUDY COMMAND // ACTIVE ASPIRANT
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
              <Zap className="w-3 h-3" /> +150 XP TARGET
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] mb-2">
              {greeting}, {userName}.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
              {lastActiveChapter 
                ? "Your active chapter roadmap is synchronized. Continue where you left off or begin a timed focus block."
                : "All 90 chapters available. Select a high-yield concept and start your daily study sprint."}
            </p>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleStart}
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 rounded-full px-7 h-11 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>{lastActiveChapter ? "Continue Chapter Study" : "Start Focus Session"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Side: Current Context */}
        {lastActiveChapter && (
          <div className="w-full md:w-[340px] shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Active Focus</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px] text-zinc-300">
                {lastActiveChapter.subjectName}
              </span>
            </div>
            
            <h3 className="text-base font-bold text-white leading-snug">
              {lastActiveChapter.chapterTitle}
            </h3>
            
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-zinc-400" />
                <span>Concept Mastery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Active Track</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
