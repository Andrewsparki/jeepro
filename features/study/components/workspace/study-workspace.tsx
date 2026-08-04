"use client";

import { motion } from "framer-motion";
import { Subject, Chapter } from "@/features/syllabus/services/syllabus";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceContent } from "./workspace-content";
import { WorkspaceTools } from "./workspace-tools";

interface StudyWorkspaceProps {
  subject: Subject;
  chapter: Chapter;
}

export function StudyWorkspace({ subject, chapter }: StudyWorkspaceProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Premium ease-out curve
      className="fixed inset-0 z-50 bg-background flex flex-row overflow-hidden"
    >
      {/* 
        Note: We use fixed inset-0 to break out of any parent padding constraints 
        (like the DashboardShell) to achieve a true edge-to-edge layout.
      */}
      
      {/* Left Navigation Column */}
      <WorkspaceSidebar subject={subject} activeChapterSlug={chapter.slug} />

      {/* Center Main Study Area Column */}
      <WorkspaceContent chapter={chapter} subject={subject} />

      {/* Right Tools Column */}
      <WorkspaceTools />
      
    </motion.div>
  );
}
