"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { mockSyllabus } from "@/features/syllabus/data/mock-syllabus";
import { DifficultyBadge } from "@/features/syllabus/components/difficulty-badge";
import { StatusBadge } from "@/features/syllabus/components/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, BrainCircuit, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ChapterPageProps {
  params: Promise<{
    subject: string;
    chapterSlug: string;
  }>;
}

export default function ChapterPage({ params }: ChapterPageProps) {
  // In Next.js 15+ we need to unwrap params with `use` before using them.
  const resolvedParams = use(params);
  const { subject, chapterSlug } = resolvedParams;

  const subjectData = mockSyllabus[subject];
  if (!subjectData) return notFound();

  const chapter = subjectData.chapters.find(c => c.slug === chapterSlug);
  if (!chapter) return notFound();

  return (
    <DashboardShell>
      {/* Breadcrumb / Back Button */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/syllabus">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-3">
            <ArrowLeft className="w-4 h-4" />
            Back to {subjectData.name}
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={chapter.status} />
            <DifficultyBadge difficulty={chapter.difficulty} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{chapter.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {chapter.description}
          </p>
        </div>
        
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          <ProgressRing progress={chapter.completionPercentage} size={140} strokeWidth={8} colorClassName="text-foreground" trackColorClassName="text-muted/10" />
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Topics) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold tracking-tight">Modules</h3>
          <div className="space-y-3">
            {chapter.topics.map((topic, index) => (
              <DashboardCard key={index} className="flex items-center gap-4 p-4 hover:border-border/60 transition-colors" delay={index * 0.1}>
                <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground border border-border/50 shrink-0">
                  {index + 1}
                </div>
                <span className="font-medium text-sm sm:text-base flex-1">{topic}</span>
                {index === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted/30 shrink-0" />
                )}
              </DashboardCard>
            ))}
          </div>
        </div>

        {/* Side Panel (Actionable Cards) */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold tracking-tight">Resources</h3>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href={`/dashboard/study/${subject}/${chapterSlug}`}>
              <div className="rounded-2xl border border-border/40 bg-card/20 p-6 flex flex-col gap-4 group cursor-pointer hover:bg-card/40 hover:border-[#78A9FF]/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#78A9FF] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-lg group-hover:text-[#78A9FF] transition-colors">Study Workspace</h4>
                  <p className="text-sm text-muted-foreground mt-1">Open comprehensive notes, interactive formulas, and derivations.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href={`/dashboard/study/${subject}/${chapterSlug}`}>
              <div className="rounded-2xl border border-border/40 bg-card/20 p-6 flex flex-col gap-4 group cursor-pointer hover:bg-card/40 hover:border-amber-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-lg group-hover:text-amber-500 transition-colors">Formula Sheet & Revision</h4>
                  <p className="text-sm text-muted-foreground mt-1">Master key formulas, derivations, and common JEE calculation traps.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href={`/dashboard/study/${subject}/${chapterSlug}`}>
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 flex flex-col gap-4 group cursor-pointer hover:bg-accent/10 hover:border-accent/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-lg text-accent">Launch Study Session</h4>
                  <p className="text-sm text-muted-foreground mt-1">Enter focused full-screen study mode with live timer & tracker.</p>
                </div>
              </div>
            </Link>
          </motion.div>
          
        </div>
      </div>

    </DashboardShell>
  );
}
