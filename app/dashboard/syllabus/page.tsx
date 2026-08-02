"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { ChapterList } from "@/features/syllabus/components/chapter-list";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSyllabus, Subject } from "@/features/syllabus/services/syllabus";

export default function SyllabusPage() {
  const [activeSubject, setActiveSubject] = useState("physics");
  const [syllabus, setSyllabus] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);

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
  }, []);

  const subjects = Object.values(syllabus).map(s => ({ id: s.slug, label: s.name }));
  const currentSubjectData = syllabus[activeSubject];

  return (
    <DashboardShell>
      <SectionHeading 
        title="Syllabus" 
        description="Master the core concepts. Track your progress across all subjects."
      />

      <div className="flex flex-col gap-8 mt-4">
        
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
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
                <ChapterList chapters={currentSubjectData.chapters} subjectSlug={currentSubjectData.slug} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
