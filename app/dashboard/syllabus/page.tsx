"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { ChapterList } from "@/features/syllabus/components/chapter-list";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSyllabus, Subject } from "@/features/syllabus/services/syllabus";
import { updateSubjectProgress } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

export default function SyllabusPage() {
  const { triggerRefresh } = useStudySession();
  const [activeSubject, setActiveSubject] = useState("physics");
  const [syllabus, setSyllabus] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getSyllabus();
      const map: Record<string, Subject> = {};
      data.forEach(s => {
        map[s.slug] = s;
      });
      setSyllabus(map);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  const refreshSyllabus = () => setRefreshKey(k => k + 1);

  const subjects = Object.values(syllabus).map(s => ({ id: s.slug, label: s.name }));
  const currentSubjectData = syllabus[activeSubject];

  const handleSubjectAction = async (action: 'complete' | 'reset') => {
    if (!currentSubjectData) return;
    
    setLoading(true);
    const newStatus = action === 'complete' ? 'Mastered' : 'Not Started';
    
    try {
      const result = await updateSubjectProgress(currentSubjectData.slug, newStatus);
      if (!result) {
        throw new Error("Failed to update subject progress");
      }
      if (action === 'complete') {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#86efac', '#3b82f6', '#8b5cf6'],
          disableForReducedMotion: true
        });
      }
      triggerRefresh();
      refreshSyllabus();
    } catch (error) {
      console.error("Failed to update subject progress", error);
      toast.error("Failed to update subject progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell className="animate-stagger-container">
      <SectionHeading 
        title="Syllabus" 
        description="Master the core concepts. Track your progress across all subjects."
      />

      <div className="flex flex-col gap-8 mt-4">
        
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="flex gap-4 border-b border-glass-border pb-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 w-full rounded-xl border border-glass-border bg-glass" />
              <Skeleton className="h-24 w-full rounded-xl border border-glass-border bg-glass" />
              <Skeleton className="h-24 w-full rounded-xl border border-glass-border bg-glass" />
            </div>
            <div className="space-y-4 mt-4">
              <Skeleton className="h-20 w-full rounded-2xl border border-glass-border bg-glass" />
              <Skeleton className="h-20 w-full rounded-2xl border border-glass-border bg-glass" />
              <Skeleton className="h-20 w-full rounded-2xl border border-glass-border bg-glass" />
            </div>
          </div>
        ) : (
          <>
            {/* Subject Tabs */}
            <div className="flex items-center gap-2 border-b border-border/40 pb-px">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setActiveSubject(subject.id)}
                  className={cn(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors outline-none",
                    activeSubject === subject.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeSubject === subject.id && (
                    <motion.div
                      layoutId="syllabus-active-tab"
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-foreground"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {subject.label}
                </button>
              ))}
            </div>

            {/* Overview Stats for Active Subject */}
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-xl font-semibold">{currentSubjectData?.name} Overview</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSubjectAction('reset')}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSubjectAction('complete')}
                  className="gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark All Complete
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-sm text-muted-foreground">Chapters Completed</p>
                <p className="text-2xl font-semibold mt-1">
                  {currentSubjectData?.chapters.filter(c => c.status === "Mastered").length || 0} 
                  <span className="text-sm font-normal text-muted-foreground"> / {currentSubjectData?.chapters.length || 0}</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-sm text-muted-foreground">Mastery Level</p>
                <p className="text-2xl font-semibold mt-1">
                  {currentSubjectData?.chapters.length ? Math.round(
                    currentSubjectData.chapters.reduce((acc, c) => acc + c.completionPercentage, 0) / currentSubjectData.chapters.length
                  ) : 0}%
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-sm text-muted-foreground">Next Milestone</p>
                <p className="text-base font-medium mt-1 truncate">
                  {currentSubjectData?.chapters.find(c => c.status !== "Mastered")?.title || "All Completed!"}
                </p>
              </div>
            </div>

            {/* Chapter List */}
            {currentSubjectData && (
              <motion.div
                key={activeSubject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChapterList 
                  chapters={currentSubjectData.chapters} 
                  subjectSlug={currentSubjectData.slug} 
                  onUpdate={refreshSyllabus}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
