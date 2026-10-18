"use client";

import { useMemo } from "react";
import { UserTopicProgress } from "@/features/study/services/progress";
import { Subject } from "@/features/syllabus/services/syllabus";
import { GlassCard } from "@/components/ui/glass-card";
import { Compass, BookCheck, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface SubjectPerformanceOverviewProps {
  syllabus: Subject[];
  progress: UserTopicProgress[];
}

export function SubjectPerformanceOverview({ syllabus, progress }: SubjectPerformanceOverviewProps) {
  const subjectStats = useMemo(() => {
    // Map of topic id -> status
    const topicStatusMap = new Map<string, string>();
    progress.forEach((p) => {
      topicStatusMap.set(p.topic_id, p.status);
    });

    return syllabus.map((sub) => {
      let totalTopics = 0;
      let masteredTopics = 0;
      let inProgressTopics = 0;
      let hardChapters = 0;

      sub.chapters.forEach((chap) => {
        if (chap.difficulty === "Hard") hardChapters++;
        chap.topics.forEach((t) => {
          totalTopics++;
          const status = topicStatusMap.get(t.id);
          if (status === "Mastered") {
            masteredTopics++;
          } else if (status === "In Progress" || status === "Needs Revision") {
            inProgressTopics++;
          }
        });
      });

      const percentage = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
      const inProgressPercentage = totalTopics > 0 ? Math.round((inProgressTopics / totalTopics) * 100) : 0;

      let themeColor = "var(--accent)";
      let borderGlow = "var(--accent-glow)";
      let tint: "blue" | "emerald" | "purple" = "blue";
      let badgeClass = "text-accent bg-accent/10 border-accent/20";

      if (sub.name.toLowerCase().includes("phys")) {
        themeColor = "#818cf8"; // Indigo / Electric Blue
        borderGlow = "rgba(129, 140, 248, 0.25)";
        tint = "blue";
        badgeClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      } else if (sub.name.toLowerCase().includes("chem")) {
        themeColor = "#34d399"; // Emerald / Mint
        borderGlow = "rgba(52, 211, 153, 0.25)";
        tint = "emerald";
        badgeClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      } else if (sub.name.toLowerCase().includes("math")) {
        themeColor = "#60a5fa"; // Electric Cyan / Blue
        borderGlow = "rgba(96, 165, 250, 0.25)";
        tint = "purple";
        badgeClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
      }

      return {
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        chapterCount: sub.chapters.length,
        hardChapters,
        totalTopics,
        masteredTopics,
        inProgressTopics,
        percentage,
        inProgressPercentage,
        themeColor,
        borderGlow,
        tint,
        badgeClass,
      };
    });
  }, [syllabus, progress]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {subjectStats.map((item) => (
        <GlassCard
          key={item.id}
          hoverTint={item.tint}
          className="p-5 flex flex-col justify-between h-[230px] group transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Ambient Background Gradient */}
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"
            style={{ backgroundColor: item.themeColor }}
          />

          {/* Card Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border mb-2 ${item.badgeClass}`}>
                {item.chapterCount} Chapters
              </span>
              <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-[#F5F7FB] transition-colors">
                {item.name}
              </h3>
            </div>
            <Link
              href={`/dashboard/study/${item.slug}`}
              className="p-2 rounded-xl bg-white/[0.04] border border-border/40 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
              title={`View ${item.name} Syllabus`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Center Progress Ring/Bar */}
          <div className="relative z-10 my-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Syllabus Mastery</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {item.percentage}%
              </span>
            </div>

            {/* Segmented Dual Bar: Mastered + In-Progress */}
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden flex gap-0.5">
              <div
                className="h-full rounded-l-full transition-all duration-700 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.themeColor,
                  boxShadow: `0 0 10px ${item.borderGlow}`,
                }}
              />
              <div
                className="h-full opacity-60 transition-all duration-700 ease-out"
                style={{
                  width: `${item.inProgressPercentage}%`,
                  backgroundColor: item.themeColor,
                }}
              />
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="relative z-10 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookCheck className="w-3.5 h-3.5 text-foreground/70" />
              <span>
                <strong className="text-foreground">{item.masteredTopics}</strong> / {item.totalTopics} Topics
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{item.hardChapters} Hard Units</span>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
