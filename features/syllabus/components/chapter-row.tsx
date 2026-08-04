"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chapter } from "@/features/syllabus/services/syllabus";
import { DifficultyBadge } from "./difficulty-badge";
import { StatusBadge } from "./status-badge";
import { ChevronRight, BookOpen, Clock, CalendarSync } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ChapterRowProps {
  chapter: Chapter;
  subjectSlug: string;
}

export function ChapterRow({ chapter, subjectSlug }: ChapterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border/40 rounded-xl bg-card/20 overflow-hidden transition-colors hover:border-border/60">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 text-left focus-visible:outline-none focus-visible:bg-muted/10"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground border border-border/50">
            <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg leading-none">{chapter.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={chapter.status} />
              <DifficultyBadge difficulty={chapter.difficulty} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:ml-auto pl-12 sm:pl-0">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium">{chapter.completionPercentage}%</span>
            <div className="w-24 h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${chapter.completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 pt-0 border-t border-border/20 bg-muted/5 flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1 space-y-4 pt-4 ml-[48px]">
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {chapter.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Study Time
                    </div>
                    <span className="text-sm font-medium">{chapter.estimated_study_time}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <CalendarSync className="w-3.5 h-3.5" />
                      Revision
                    </div>
                    <span className="text-sm font-medium">{chapter.revisionStatus}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Topics
                    </div>
                    <span className="text-sm font-medium">
                      {chapter.topics.filter(t => t.status === "Mastered").length} / {chapter.topics.length} Completed
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/dashboard/study/${subjectSlug}/${chapter.slug}`}>
                    <Button variant="outline" size="sm" className="gap-2 rounded-lg text-xs hover:text-foreground">
                      Enter Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
