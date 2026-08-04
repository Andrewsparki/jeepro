"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Chapter, Subject, getSubjectBySlug } from "@/features/syllabus/services/syllabus";
import { StudyWorkspace } from "@/features/study/components/workspace/study-workspace";

interface StudyWorkspacePageProps {
  params: Promise<{
    subject: string;
    chapterSlug: string;
  }>;
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
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <StudyWorkspace subject={subject} chapter={chapter} />;
}
