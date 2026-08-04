"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, Target, Clock, BookOpen } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-full py-8 text-center border border-dashed rounded-xl border-border/60 bg-muted/20">
        <BookOpen className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm font-medium text-foreground mb-1">No Active Chapter</p>
        <p className="text-xs text-muted-foreground mb-4">Start your journey by selecting a subject.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/syllabus")}>
          Explore Syllabus
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="group relative flex flex-col gap-4 rounded-2xl border border-glass-border bg-card p-5 hover:border-accent/30 transition-all duration-300 cursor-pointer overflow-hidden isolation-auto"
      onClick={() => router.push(`/dashboard/study/${lastActiveChapter.subjectSlug}/${lastActiveChapter.chapterSlug}`)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-accent/10 transition-colors" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
          <Play className="h-4 w-4" />
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
          {lastActiveChapter.subjectName}
        </div>
      </div>
      
      <div className="relative z-10 mt-2">
        <h4 className="text-base font-semibold group-hover:text-accent transition-colors line-clamp-2 leading-tight">
          {lastActiveChapter.chapterTitle}
        </h4>
      </div>

      <div className="relative z-10 mt-auto pt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Target className="w-3.5 h-3.5" /> 45%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5" /> 2h 15m
          </div>
        </div>
        <div className="flex items-center text-xs font-medium text-accent">
          Resume
          <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </div>
  );
});
