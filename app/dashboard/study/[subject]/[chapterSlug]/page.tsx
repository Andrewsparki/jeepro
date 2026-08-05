"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Chapter, Subject, getSubjectBySlug } from "@/features/syllabus/services/syllabus";
import { StudyWorkspace } from "@/features/study/components/workspace/study-workspace";
import { Skeleton } from "@/components/ui/skeleton";
interface StudyWorkspacePageProps {
  params: Promise<{
    subject: string;
    chapterSlug: string;
  }>;
}

function StudyWorkspaceSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col h-screen w-screen overflow-hidden">
      {/* Top Navbar */}
      <div className="h-14 border-b border-glass-border bg-glass px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-glass-border bg-glass/50 p-4 shrink-0 hidden md:block space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="space-y-2 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10 bg-background space-y-6">
          <Skeleton className="h-10 w-3/4 max-w-2xl" />
          <Skeleton className="h-4 w-1/2 max-w-md" />
          
          <div className="mt-8 space-y-4">
            <Skeleton className="h-[400px] w-full rounded-2xl border border-glass-border bg-glass" />
            <Skeleton className="h-32 w-full rounded-2xl border border-glass-border bg-glass" />
          </div>
        </div>
        
        {/* Right Panel (Notes/Tools) */}
        <div className="w-80 border-l border-glass-border bg-glass/50 p-4 shrink-0 hidden xl:block space-y-4">
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudyWorkspacePage({ params }: StudyWorkspacePageProps) {
  const resolvedParams = use(params);
  const { subject: subjectSlug, chapterSlug } = resolvedParams;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Single fetch — derive chapter from the subject instead of 2 separate calls
      const s = await getSubjectBySlug(subjectSlug);
      const c = s?.chapters.find(ch => ch.slug === chapterSlug) ?? null;
      setSubject(s);
      setChapter(c);
      setLoading(false);
    }
    load();
  }, [subjectSlug, chapterSlug]);

  if (!loading && (!subject || !chapter)) return notFound();

  if (loading || !chapter || !subject) {
    return <StudyWorkspaceSkeleton />;
  }

  return <StudyWorkspace subject={subject} chapter={chapter} />;
}
