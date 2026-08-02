import Link from "next/link";
import { Chapter } from "@/features/syllabus/services/syllabus";
import { DifficultyBadge } from "@/features/syllabus/components/difficulty-badge";
import { StatusBadge } from "@/features/syllabus/components/status-badge";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ChapterHeroProps {
  chapter: Chapter;
  subjectName: string;
}

export function ChapterHero({ chapter, subjectName }: ChapterHeroProps) {
  return (
    <div className="flex flex-col gap-6 py-6 sm:py-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center text-sm font-medium text-muted-foreground"
      >
        <Link href="/dashboard/syllabus" className="hover:text-foreground transition-colors">
          Syllabus
        </Link>
        <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-50" />
        <Link href="/dashboard/syllabus" className="hover:text-foreground transition-colors">
          {subjectName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-50" />
        <span className="text-foreground">{chapter.title}</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={chapter.status} />
          <DifficultyBadge difficulty={chapter.difficulty} />
          <div className="px-2 py-0.5 rounded-md text-xs font-medium border border-border/50 bg-muted/20 text-muted-foreground">
            {chapter.estimated_study_time}
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
          {chapter.title}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
          {chapter.description}
        </p>
      </motion.div>
    </div>
  );
}
