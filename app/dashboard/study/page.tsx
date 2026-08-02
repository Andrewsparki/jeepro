"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { getSyllabus, Subject } from "@/features/syllabus/services/syllabus";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";

export default function StudyHomePage() {
  const [syllabus, setSyllabus] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSyllabus();
      setSyllabus(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardShell>
      <SectionHeading 
        title="Study" 
        description="Select a subject to continue your preparation."
      />

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-xl border border-border/40 bg-card/20 p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {syllabus.map((subject, index) => {
              const totalChapters = subject.chapters.length;
              const masteredChapters = subject.chapters.filter(c => c.status === "Mastered").length;
              const progress = totalChapters > 0 ? Math.round((masteredChapters / totalChapters) * 100) : 0;
              
              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link href={`/dashboard/study/${subject.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/20 p-6 hover:border-accent/50 hover:bg-card/40 transition-all h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-xl bg-accent/10 text-accent">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <ProgressRing progress={progress} size={48} strokeWidth={4} colorClassName="text-accent" />
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>{masteredChapters} / {totalChapters} Chapters</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
