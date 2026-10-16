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
    let isMounted = true;
    async function load() {
      try {
        const data = await getSyllabus();
        if (isMounted) setSyllabus(data);
      } catch (err) {
        console.error("Error loading syllabus homepage:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
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
              <Skeleton key={i} className="rounded-xl border border-white/[0.08] bg-[#090C15] p-6 h-48" />
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
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                >
                  <Link href={`/dashboard/study/${subject.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#090C15] hover:border-white/[0.18] p-6 transition-all h-full flex flex-col shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="p-3 rounded-lg bg-[#78A9FF]/10 border border-[#78A9FF]/20 text-[#78A9FF]">
                          <BookOpen className="w-5 h-5 text-[#78A9FF]" />
                        </div>
                        <span className="text-xl font-mono font-bold text-white">{progress}%</span>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-xl font-bold tracking-tight text-white mb-2 group-hover:text-zinc-200 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center justify-between">
                          <span>{masteredTopics} / {totalTopics} Topics Mastered</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
                        </p>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-[#78A9FF] rounded-full"
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
