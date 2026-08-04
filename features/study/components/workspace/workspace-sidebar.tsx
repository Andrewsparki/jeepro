"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Circle, GraduationCap } from "lucide-react";
import { Subject } from "@/features/syllabus/services/syllabus";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  subject: Subject;
  activeChapterSlug: string;
}

export function WorkspaceSidebar({ subject, activeChapterSlug }: WorkspaceSidebarProps) {
  const totalChapters = subject.chapters.length;
  const overallProgress = totalChapters > 0 
    ? Math.round(subject.chapters.reduce((acc, chap) => acc + chap.completionPercentage, 0) / totalChapters)
    : 0;

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex w-64 h-full border-r border-border/50 bg-background/95 flex-col shrink-0"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <Link 
          href={`/dashboard/study/${subject.slug}`}
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-5 group"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to {subject.name}
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="w-4 h-4" />
          </div>
          Chapters
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 custom-scrollbar">
        <div className="space-y-0.5">
          {subject.chapters.map((chapter) => {
            const isActive = chapter.slug === activeChapterSlug;
            const isCompleted = chapter.completionPercentage === 100 || chapter.status === "Mastered";

            return (
              <Link
                key={chapter.id}
                href={`/dashboard/study/${subject.slug}/${chapter.slug}`}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group",
                  isActive 
                    ? "bg-surface-hover text-foreground font-medium" 
                    : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-chapter-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {isCompleted ? (
                  <CheckCircle2 className={cn(
                    "w-4 h-4 shrink-0 transition-colors", 
                    isActive ? "text-emerald-500" : "text-emerald-500/50 group-hover:text-emerald-500"
                  )} />
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-[2.5px] border-primary shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                )}
                <span className="truncate">{chapter.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Progress Footer */}
      <div className="p-5 border-t border-border/50 bg-surface/30">
        <div className="flex items-center justify-between text-xs font-medium mb-3">
          <span className="text-muted-foreground uppercase tracking-wider">Subject Progress</span>
          <span className={cn("transition-colors", overallProgress > 0 ? "text-primary" : "text-muted-foreground")}>
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-glass-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.2 }}
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          />
        </div>
      </div>
    </motion.aside>
  );
}
