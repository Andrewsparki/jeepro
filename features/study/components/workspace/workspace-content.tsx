"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./overview-tab";
import { FormulasTab } from "./formulas-tab";
import { WorkspaceEmptyState } from "./components/workspace-empty-state";
import { 
  BookOpen, Calculator, Pencil, Sparkles, 
  TrendingUp, Clock, Target, Brain, LucideIcon, BookMarked, Play
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStudySession } from "@/features/study/context/study-session-context";

interface WorkspaceContentProps {
  chapter: Chapter;
  subject: Subject;
}

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "notes", label: "Notes", icon: Pencil },
  { id: "formulas", label: "Formula Sheet", icon: Calculator },
  { id: "practice", label: "Practice", icon: Target },
  { id: "pyqs", label: "PYQs", icon: BookMarked },
  { id: "flashcards", label: "Flashcards", icon: Brain },
  { id: "ai", label: "AI Tutor", icon: Sparkles },
];

export function WorkspaceContent({ chapter, subject }: WorkspaceContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { startSession, isActive } = useStudySession();

  const activeTabConfig = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header / Tabs */}
      <header className="flex flex-col pt-8 px-8 pb-0 border-b border-border/50 shrink-0">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{chapter.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{subject.name}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>Chapter {chapter.order_index}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="hidden sm:flex rounded-full px-6" onClick={() => toast("Coming soon")}>
                Bookmark
              </Button>
              <Button 
                onClick={() => startSession(subject.id, chapter.id)} 
                className="rounded-full px-6 gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                {isActive ? "Continue Session" : "Start Session"}
                <Play className="w-4 h-4 fill-current" />
              </Button>
            </div>
          </div>
          
          {/* Global Chapter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <StatBadge icon={TrendingUp} label="Difficulty" value={chapter.difficulty} />
            <StatBadge icon={Clock} label="Estimated Time" value={chapter.estimated_study_time} />
            <StatBadge icon={Target} label="Weightage" value={chapter.weightage || "High"} />
            <StatBadge icon={Brain} label="Status" value={chapter.status} />
          </div>
        </div>

        <nav role="tablist" className="flex space-x-2 overflow-x-auto custom-scrollbar no-scrollbar-arrows pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap rounded-t-lg",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80 hover:bg-surface-hover/50"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area with Slide Animation */}
      <div role="tabpanel" className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="h-full"
          >
            {activeTab === "overview" && (
              <OverviewTab chapter={chapter} subject={subject} />
            )}

            {activeTab === "formulas" && (
              <FormulasTab chapter={chapter} />
            )}

            {activeTab !== "overview" && activeTab !== "formulas" && activeTabConfig && (
              <WorkspaceEmptyState
                icon={activeTabConfig.icon}
                title={`${activeTabConfig.label} Content Incoming`}
                description="This section is part of an upcoming sprint. The structural layout is complete, and the actual content will be populated here shortly."
                actionLabel={`Generate ${activeTabConfig.label}`}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-glass-border bg-surface hover:bg-surface-hover transition-colors">
      <div className="p-2 rounded-lg bg-surface-hover text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
