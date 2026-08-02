"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getChapterBySlug, Chapter, Subject, getSubjectBySlug } from "@/features/syllabus/services/syllabus";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionDivider } from "@/features/study/components/section-divider";
import { QuickActions } from "@/features/study/components/quick-actions";
import { ChapterHero } from "@/features/study/components/chapter-hero";
import { ChapterProgressCard } from "@/features/study/components/chapter-progress-card";
import { TopicsList } from "@/features/study/components/topics-list";
import { PracticeCard } from "@/features/study/components/practice-card";
import { RevisionCard } from "@/features/study/components/revision-card";
import { FormulaCard } from "@/features/study/components/formula-card";

interface StudyWorkspaceProps {
  params: Promise<{
    subject: string;
    chapterSlug: string;
  }>;
}

export default function StudyWorkspace({ params }: StudyWorkspaceProps) {
  const resolvedParams = use(params);
  const { subject: subjectSlug, chapterSlug } = resolvedParams;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await getSubjectBySlug(subjectSlug);
      const c = await getChapterBySlug(subjectSlug, chapterSlug);
      setSubject(s);
      setChapter(c);
      setLoading(false);
    }
    load();
  }, [subjectSlug, chapterSlug]);

  if (!loading && (!subject || !chapter)) return notFound();
  
  if (loading || !chapter || !subject) {
    return (
      <DashboardShell>
        <div className="max-w-5xl mx-auto w-full pb-32 animate-pulse mt-10">
           <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
           <div className="h-16 bg-muted rounded w-2/3"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto w-full pb-32">
        
        {/* Hero Section */}
        <ChapterHero chapter={chapter} subjectName={subject.name} />
        
        {/* Quick Actions */}
        <div className="mt-8 mb-16">
          <QuickActions />
        </div>

        {/* Progress Card */}
        <div className="mb-20">
          <ChapterProgressCard completionPercentage={chapter.completionPercentage} />
        </div>

        <SectionDivider label="Learn" />
        
        {/* Topics List */}
        <div className="mb-20">
          <TopicsList topics={chapter.topics} />
        </div>

        <SectionDivider label="Practice" />

        {/* Practice Cards */}
        <div className="mb-20">
          <PracticeCard />
        </div>

        <SectionDivider label="Revision" />

        {/* Revision Cards */}
        <div className="mb-20">
          <RevisionCard />
        </div>

        <SectionDivider label="Resources" />

        {/* Formula Sheet */}
        <div className="mb-20">
          <FormulaCard />
        </div>

      </div>
    </DashboardShell>
  );
}
