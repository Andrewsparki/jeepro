"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { ChapterList } from "@/features/syllabus/components/chapter-list";
import { getSubjectBySlug, Subject } from "@/features/syllabus/services/syllabus";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = params.subject as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (subjectSlug) {
        const data = await getSubjectBySlug(subjectSlug);
        setSubject(data);
      }
      setLoading(false);
    }
    load();
  }, [subjectSlug]);

  return (
    <DashboardShell>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/study')}
          className="text-muted-foreground hover:text-foreground -ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subjects
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-1/4 rounded" />
          <Skeleton className="h-4 w-2/4 rounded" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-32 w-full rounded-2xl border border-glass-border bg-glass" />
            <Skeleton className="h-32 w-full rounded-2xl border border-glass-border bg-glass" />
          </div>
        </div>
      ) : subject ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionHeading 
            title={subject.name} 
            description={`Master the core concepts of ${subject.name}.`}
          />
          <div className="mt-8">
            <ChapterList chapters={subject.chapters} subjectSlug={subject.slug} />
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Subject not found</h2>
          <p className="text-muted-foreground">The subject you are looking for does not exist.</p>
        </div>
      )}
    </DashboardShell>
  );
}
