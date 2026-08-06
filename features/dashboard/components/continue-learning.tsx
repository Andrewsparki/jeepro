"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, Target, Clock, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueLearningProps {
  lastActiveChapter: {
    subjectSlug: string;
    subjectName: string;
    chapterSlug: string;
    chapterTitle: string;
  } | null;
}

export const ContinueLearning = React.memo(function ContinueLearning({ lastActiveChapter }: ContinueLearningProps) {
  const router = useRouter();

  if (!lastActiveChapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 px-6 text-center border border-dashed rounded-2xl border-border/40 bg-surface/50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        {/* Animated Background Mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/5 rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-all duration-1000" />
        
        <div className="p-4 rounded-2xl bg-surface border border-border/50 text-accent mb-6 relative shadow-lg">
          <div className="absolute -top-2 -right-2 text-accent">
             <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <BookOpen className="w-10 h-10 relative z-10" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-2 relative z-10 tracking-tight">Your Journey Begins</h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-[220px] relative z-10 font-medium leading-relaxed">
          Dive into the syllabus and start mastering concepts today.
        </p>
        
        <Button 
          onClick={() => router.push("/dashboard/syllabus")}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full transition-all group/btn relative z-10 px-8 py-5 h-auto font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          Explore Syllabus
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-surface p-6 hover:border-accent/40 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
      onClick={() => router.push(`/dashboard/study/${lastActiveChapter.subjectSlug}/${lastActiveChapter.chapterSlug}`)}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:bg-accent/15 transition-all duration-700" />
      
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className="p-3 rounded-xl bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.1)] group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        </div>
        <div className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-surface border border-border/50 text-muted-foreground uppercase tracking-widest shadow-sm">
          {lastActiveChapter.subjectName}
        </div>
      </div>
      
      <div className="relative z-10 mt-2 mb-6">
        <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-2">Continue Learning</p>
        <h4 className="text-xl font-bold group-hover:text-accent transition-colors line-clamp-2 leading-tight text-foreground tracking-tight">
          {lastActiveChapter.chapterTitle}
        </h4>
      </div>

      <div className="relative z-10 mt-auto pt-5 border-t border-border/40 flex items-center justify-between">
        <div className="flex gap-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Target className="w-4 h-4 text-muted-foreground/70" /> 
            <span>45%</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Clock className="w-4 h-4 text-muted-foreground/70" /> 
            <span>2h 15m</span>
          </div>
        </div>
        <div className="flex items-center text-xs font-bold text-foreground group-hover:text-accent uppercase tracking-wider transition-colors">
          Resume
          <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
});
