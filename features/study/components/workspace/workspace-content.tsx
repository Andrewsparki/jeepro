"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./overview-tab";
import { FormulasTab } from "./formulas-tab";
import { NotesTab } from "./notes-tab";
import { WorkspaceEmptyState } from "./components/workspace-empty-state";
import { 
  BookOpen, Calculator, Pencil, Sparkles, 
  TrendingUp, Clock, Target, Brain, LucideIcon, BookMarked, Play,
  GitFork, LineChart, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStudySession } from "@/features/study/context/study-session-context";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { getPhysicsChapterDataset } from "@/features/study/services/physics-knowledge.service";
import { ChapterNotesViewer } from "./components/chapter-notes-viewer";
import { ChapterDerivationsViewer } from "./components/chapter-derivations-viewer";
import { ChapterGraphsViewer } from "./components/chapter-graphs-viewer";
import { ChapterRevisionViewer } from "./components/chapter-revision-viewer";

interface WorkspaceContentProps {
  chapter: Chapter;
  subject: Subject;
}

export function WorkspaceContent({ chapter, subject }: WorkspaceContentProps) {
  console.log("[WorkspaceContent] Rendering WorkspaceContent for chapter:", chapter?.title);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { startSession, endSession, isActive } = useStudySession();

  // Check if this chapter is one of our 6 rich Physics datasets
  const dataset = useMemo(() => {
    return getPhysicsChapterDataset(chapter.slug) || getPhysicsChapterDataset(chapter.id);
  }, [chapter.slug, chapter.id]);

  // Compute dynamic tabs: include Derivations, Graphs, and Revision when content exists
  const tabs = useMemo(() => {
    const list = [
      { id: "overview", label: "Overview", icon: BookOpen },
      { id: "notes", label: "Notes", icon: Pencil },
      { id: "formulas", label: "Formula Sheet", icon: Calculator },
    ];

    if (dataset) {
      if (dataset.derivations && dataset.derivations.length > 0) {
        list.push({ id: "derivations", label: "Derivations", icon: GitFork });
      }
      if (dataset.graphs && dataset.graphs.length > 0) {
        list.push({ id: "graphs", label: "Graphs", icon: LineChart });
      }
      if ((dataset.quickRevision && dataset.quickRevision.length > 0) || (dataset.commonMistakes && dataset.commonMistakes.length > 0)) {
        list.push({ id: "revision", label: "Quick Revision", icon: Zap });
      }
    }

    list.push(
      { id: "practice", label: "Practice", icon: Target },
      { id: "pyqs", label: "PYQs", icon: BookMarked },
      { id: "flashcards", label: "Flashcards", icon: Brain },
      { id: "ai", label: "AI Tutor", icon: Sparkles }
    );

    return list;
  }, [dataset]);

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  const toggleBookmark = () => {
    setIsBookmarked(prev => {
      const next = !prev;
      toast(next ? `Bookmarked ${chapter.title}` : `Removed bookmark for ${chapter.title}`);
      return next;
    });
  };

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
                {dataset && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/30 font-bold">
                      Complete Knowledge Base
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant={isBookmarked ? "secondary" : "outline"} 
                className="hidden sm:flex rounded-full px-6 gap-2" 
                onClick={toggleBookmark}
              >
                <BookMarked className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button 
                onClick={() => isActive ? endSession() : startSession(subject.id, chapter.id)} 
                className={cn(
                  "rounded-full px-6 gap-2",
                  isActive 
                    ? "bg-amber-500 hover:bg-amber-600 text-white" 
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {isActive ? "End Session" : "Start Session"}
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
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  dispatchInteractionSound("ui.tab");
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap rounded-t-lg",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground/80 hover:bg-surface-hover/50"
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
      <div role="tabpanel" data-lenis-prevent className="flex-1 overflow-y-auto custom-scrollbar p-8 relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="min-h-full"
          >
            {activeTab === "overview" && (
              <OverviewTab chapter={chapter} subject={subject} onSelectTab={(tabId) => setActiveTab(tabId)} />
            )}

            {activeTab === "notes" && (
              dataset ? <ChapterNotesViewer dataset={dataset} /> : <NotesTab chapter={chapter} subject={subject} />
            )}

            {activeTab === "formulas" && (
              <FormulasTab chapter={chapter} subject={subject} />
            )}

            {activeTab === "derivations" && dataset && (
              <ChapterDerivationsViewer dataset={dataset} />
            )}

            {activeTab === "graphs" && dataset && (
              <ChapterGraphsViewer dataset={dataset} />
            )}

            {activeTab === "revision" && dataset && (
              <ChapterRevisionViewer dataset={dataset} />
            )}

            {activeTab !== "overview" && activeTab !== "notes" && activeTab !== "formulas" && 
             activeTab !== "derivations" && activeTab !== "graphs" && activeTab !== "revision" && activeTabConfig && (
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
