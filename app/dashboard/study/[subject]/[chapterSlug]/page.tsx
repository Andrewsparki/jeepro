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

import { FixedPortal } from "@/components/ui/fixed-portal";

function StudyWorkspaceSkeleton() {
  return (
    <FixedPortal>
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
    </FixedPortal>
  );
}

import { useStudySession } from "@/features/study/context/study-session-context";

export default function StudyWorkspacePage({ params }: StudyWorkspacePageProps) {
  const resolvedParams = use(params);
  const { subject: subjectSlug, chapterSlug } = resolvedParams;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useStudySession();

  useEffect(() => {
    let isMounted = true;
    console.log("[Workspace] 1. Page mounted. Starting data loading for:", { subjectSlug, chapterSlug });
    async function load() {
      try {
        console.log("[Workspace] 2. Fetching subject:", subjectSlug);
        const s = await getSubjectBySlug(subjectSlug);
        console.log("[Workspace] 3. Subject returned:", s?.name, s?.slug, "Total chapters:", s?.chapters.length);
        if (!isMounted) return;

        let c: Chapter | null = null;
        if (s) {
          const rawSlug = decodeURIComponent(chapterSlug).toLowerCase();
          const cleanSlug = rawSlug.replace(/[^a-z0-9]/g, '-');
          c = s.chapters.find(ch => {
            const chSlug = ch.slug.toLowerCase();
            const chId = ch.id.toLowerCase();
            const chClean = chSlug.replace(/[^a-z0-9]/g, '-');
            const chIdClean = chId.replace(/[^a-z0-9]/g, '-');
            return chSlug === rawSlug ||
                   chId === rawSlug ||
                   chClean === cleanSlug ||
                   chIdClean === cleanSlug ||
                   chIdClean === `${s.slug}-${cleanSlug}` ||
                   chSlug.includes(cleanSlug) ||
                   cleanSlug.includes(chSlug);
          }) ?? null;
        }

        console.log("[Workspace] 4. Chapter matched:", c ? { id: c.id, slug: c.slug, title: c.title, topicsCount: c.topics?.length } : null);
        setSubject(s);
        setChapter(c);
      } catch (err) {
        console.error("[Workspace] 4. ERROR loading workspace data:", err);
      } finally {
        if (isMounted) {
          console.log("[Workspace] 5. Data loading completed. Setting loading = false");
          setLoading(false);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, [subjectSlug, chapterSlug, refreshKey]);

  console.log("[Workspace] Render cycle:", { loading, hasSubject: !!subject, hasChapter: !!chapter });

  if (!loading && (!subject || !chapter)) {
    console.warn("[Workspace] NOT FOUND branch hit:", { loading, subject: subject?.slug, chapter: chapter?.slug });
    return notFound();
  }

  if (loading || !chapter || !subject) {
    console.log("[Workspace] Rendering StudyWorkspaceSkeleton");
    return <StudyWorkspaceSkeleton />;
  }

  console.log("[Workspace] Rendering StudyWorkspace with real data");
  return <StudyWorkspace subject={subject} chapter={chapter} />;
}
