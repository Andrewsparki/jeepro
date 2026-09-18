"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chapter } from "@/features/syllabus/services/syllabus";
import { XP_CONFIG } from "@/features/progress/config/xp-config";
import { DifficultyBadge } from "./difficulty-badge";
import { useRouter } from "next/navigation";
import { ChevronRight, BookOpen, Clock, CalendarSync, Play, CheckCircle2, Circle, Clock3, Copy, Bookmark, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateChapterProgress } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { ContextMenuTrigger } from "@/features/context-menu";

interface ChapterRowProps {
  chapter: Chapter;
  subjectSlug: string;
  onUpdate?: () => void;
}

export function ChapterRow({ chapter, subjectSlug, onUpdate }: ChapterRowProps) {
  const router = useRouter();
  const { startSession, triggerRefresh } = useStudySession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Local optimistic state
  const [optimisticStatus, setOptimisticStatus] = useState(chapter.status);
  const [optimisticCompletion, setOptimisticCompletion] = useState(chapter.completionPercentage);

  // Reset optimistic state when props change (Render phase state update)
  const [prevChapterStatus, setPrevChapterStatus] = useState(chapter.status);
  const [prevChapterCompletion, setPrevChapterCompletion] = useState(chapter.completionPercentage);

  if (chapter.status !== prevChapterStatus) {
    setPrevChapterStatus(chapter.status);
    setOptimisticStatus(chapter.status);
  }

  if (chapter.completionPercentage !== prevChapterCompletion) {
    setPrevChapterCompletion(chapter.completionPercentage);
    setOptimisticCompletion(chapter.completionPercentage);
  }

  const handleToggleStatus = async (e?: React.MouseEvent) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);

    const isCurrentlyMastered = optimisticStatus === "Mastered";
    const newStatus = isCurrentlyMastered ? "Not Started" : "Mastered";
    const newCompletion = isCurrentlyMastered ? 0 : 100;

    // Optimistic Update
    setOptimisticStatus(newStatus);
    setOptimisticCompletion(newCompletion);

    if (newStatus === "Mastered" && e && e.target) {
      // Confetti effect from the element position
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#22c55e', '#16a34a', '#86efac'],
        disableForReducedMotion: true
      });
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2500);
    }

    try {
      const result = await updateChapterProgress(subjectSlug, chapter.slug, newStatus);
      if (!result) {
        throw new Error("Failed to persist chapter progress to Supabase");
      }
      triggerRefresh();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating chapter progress:", err);
      // Revert optimistic update
      setOptimisticStatus(chapter.status);
      setOptimisticCompletion(chapter.completionPercentage);
      toast.error("Failed to update chapter progress. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isMastered = optimisticStatus === "Mastered";
  const isInProgress = optimisticStatus === "In Progress";

  const chapterMenuItems = [
    {
      id: "open-workspace",
      label: "Open Chapter Workspace",
      icon: BookOpen,
      onClick: () => router.push(`/dashboard/study/${subjectSlug}/${chapter.slug}`),
    },
    {
      id: "start-session",
      label: "Start Focus Session",
      icon: Play,
      onClick: () => {
        startSession(undefined, chapter.id);
        toast.success(`Started session for ${chapter.title}`);
      },
    },
    {
      id: "toggle-status",
      label: isMastered ? "Mark as Not Started" : "Mark as Mastered",
      icon: CheckCircle2,
      onClick: () => handleToggleStatus(),
    },
    {
      id: "bookmark-chapter",
      label: isBookmarked ? "Remove Bookmark" : "Bookmark Chapter",
      icon: Bookmark,
      onClick: () => {
        setIsBookmarked((prev) => {
          const next = !prev;
          toast.success(next ? `Bookmarked ${chapter.title}` : `Removed bookmark for ${chapter.title}`);
          return next;
        });
      },
    },
    { id: "sep-1", separator: true, label: "" },
    {
      id: "copy-chapter-link",
      label: "Copy Chapter Link",
      icon: LinkIcon,
      onClick: () => {
        if (typeof window !== "undefined") {
          const url = `${window.location.origin}/dashboard/study/${subjectSlug}/${chapter.slug}`;
          navigator.clipboard.writeText(url);
          toast.success("Chapter link copied to clipboard");
        }
      },
    },
    {
      id: "copy-title",
      label: "Copy Title",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(chapter.title);
        toast.success("Title copied to clipboard");
      },
    },
  ];

  return (
    <ContextMenuTrigger items={chapterMenuItems} title={chapter.title}>
      <div className={cn(
        "border rounded-xl overflow-hidden transition-all duration-300 relative group",
        isMastered ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50" : "border-border/40 bg-card/20 hover:border-border/60"
      )}>
        <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-[80px] top-[10px] pointer-events-none z-10 font-bold text-green-500"
          >
            +{XP_CONFIG.MILESTONES.CHAPTER_COMPLETED} XP
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 text-left cursor-pointer focus-visible:outline-none focus-visible:bg-muted/10"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground border border-border/50">
            <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          
          {/* Interactive Checkbox Button */}
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={cn(
              "flex-shrink-0 relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-250 z-10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isMastered ? "text-green-500 bg-green-500/10 hover:bg-green-500/20" : 
              isInProgress ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" : 
              "text-muted-foreground bg-muted/20 hover:bg-muted/40"
            )}
          >
            <AnimatePresence mode="wait">
              {isMastered ? (
                <motion.div
                  key="mastered"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="w-6 h-6 fill-green-500/20" />
                </motion.div>
              ) : isInProgress ? (
                <motion.div
                  key="in-progress"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Clock3 className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="not-started"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Circle className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg leading-none truncate pr-4">{chapter.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <DifficultyBadge difficulty={chapter.difficulty} />
              
              {/* Hover Quick Actions */}
              <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center gap-2 ml-4">
                <Link href={`/dashboard/study/${subjectSlug}/${chapter.slug}`} onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <Play className="w-3 h-3 mr-1.5" /> Study Now
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleToggleStatus}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5" /> 
                  {isMastered ? "Mark Incomplete" : "Mark Complete"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:ml-auto pl-[88px] sm:pl-0">
          <div className="flex flex-col items-end w-32">
            <span className={cn(
              "text-sm font-medium transition-colors duration-300",
              isMastered ? "text-green-500" : ""
            )}>
              {optimisticCompletion}%
            </span>
            <div className="w-full h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden relative">
              <motion.div 
                className={cn(
                  "absolute left-0 top-0 bottom-0 rounded-full transition-colors duration-300",
                  isMastered ? "bg-green-500" : "bg-accent"
                )}
                initial={{ width: `${chapter.completionPercentage}%` }}
                animate={{ width: `${optimisticCompletion}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

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
    </ContextMenuTrigger>
  );
}
