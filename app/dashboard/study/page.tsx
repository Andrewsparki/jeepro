"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { getSyllabus, Subject } from "@/features/syllabus/services/syllabus";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useStudySession } from "@/features/study/context/study-session-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudyHomePage() {
  const [syllabus, setSyllabus] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const { refreshKey } = useStudySession();

  useEffect(() => {
    async function load() {
      const data = await getSyllabus();
      setSyllabus(data);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  return (
    <DashboardShell className="animate-stagger-container">
      <SectionHeading 
        title="Study" 
        description="Select a subject to continue your preparation."
      />

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="rounded-xl border border-glass-border bg-glass p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {syllabus.map((subject, index) => {
              const totalTopics = subject.chapters.reduce((acc, c) => acc + c.topics.length, 0);
              const masteredTopics = subject.chapters.reduce((acc, c) => acc + c.topics.filter(t => t.status === "Mastered").length, 0);
              const progress = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
              
              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link href={`/dashboard/study/${subject.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/20 p-6 hover:border-accent/50 hover:bg-card/40 transition-all h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-accent/10 text-accent">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-accent">{progress}%</span>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>{masteredTopics} / {totalTopics} Topics</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </p>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-accent rounded-full"
                          />
                        </div>
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
