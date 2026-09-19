"use client";

import { useMemo, useState, useEffect } from "react";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { XP_CONFIG } from "@/features/progress/config/xp-config";
import { 
  ArrowRight, CheckCircle2, Play, Calculator, Target, Calendar, 
  Brain, Flame, Activity, ListChecks, Pencil, FileText
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InfoCard, SidebarCard } from "./components/workspace-cards";
import { CreateEventDialog } from "@/features/planner/components/create-event-dialog";
import { useStudySession } from "@/features/study/context/study-session-context";
import { TopicsList } from "@/features/study/components/topics-list";
import { getUserNotes, UserNote } from "@/features/study/services/notes.service";
import { getFormulasByChapter, Formula } from "@/features/study/services/formulas";

interface OverviewTabProps {
  chapter: Chapter;
  subject: Subject;
  onSelectTab?: (tabId: string) => void;
}

export function OverviewTab({ chapter, subject, onSelectTab }: OverviewTabProps) {
  console.log("[OverviewTab] Rendering OverviewTab for chapter:", chapter?.title, "Topics count:", chapter?.topics?.length);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { startSession, isActive } = useStudySession();
  const [recentNotes, setRecentNotes] = useState<UserNote[]>([]);
  const [formulaCount, setFormulaCount] = useState<number>(0);

  useEffect(() => {
    getUserNotes(subject.id, chapter.id).then(setRecentNotes);
    getFormulasByChapter(chapter.id).then((f) => setFormulaCount(f.length));
  }, [subject.id, chapter.id]);

  const { nextChapter, previousChapter, topicsCompleted, xpEarned } = useMemo(() => {
    const currentIndex = subject.chapters.findIndex((c) => c.id === chapter.id);
    const next = currentIndex >= 0 && currentIndex < subject.chapters.length - 1 
      ? subject.chapters[currentIndex + 1] 
      : null;
    const prev = currentIndex > 0 
      ? subject.chapters[currentIndex - 1] 
      : null;
    const completed = chapter.topics.filter(t => t.status === "Mastered").length;
    const topicXP = completed * XP_CONFIG.MILESTONES.TOPIC_COMPLETED;
    const chapterBonus = chapter.completionPercentage === 100 ? XP_CONFIG.MILESTONES.CHAPTER_COMPLETED : 0;
    const xp = topicXP + chapterBonus;
    return { nextChapter: next, previousChapter: prev, topicsCompleted: completed, xpEarned: xp };
  }, [chapter, subject]);

  // Generate dynamic learning objectives from topics if they don't exist
  const objectives = useMemo(() => {
    if (chapter.learningObjectives && chapter.learningObjectives.length > 0) {
      return chapter.learningObjectives;
    }
    return chapter.topics.slice(0, 4).map((topic, i) => {
      const verbs = ["Understand the principles of", "Solve complex problems involving", "Apply concepts of", "Analyze scenarios using"];
      return `${verbs[i % verbs.length]} ${topic.title}`;
    });
  }, [chapter]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Quick Actions Hero Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <ActionCard 
          icon={Play} 
          label={isActive ? "Session Active" : "Continue Studying"} 
          sub="Resume your session" 
          highlight 
          onClick={() => startSession(subject.id, chapter.id)}
        />
        <ActionCard 
          icon={Calculator} 
          label="Formula Sheet" 
          sub={`${formulaCount} formulas available`} 
          onClick={() => onSelectTab?.("formulas")}
        />
        <ActionCard 
          icon={Pencil} 
          label="Chapter Notes" 
          sub={`${recentNotes.length} notes written`} 
          onClick={() => onSelectTab?.("notes")}
        />
        <ActionCard 
          icon={Calendar} 
          label="Schedule Revision" 
          sub="Spaced repetition" 
          onClick={() => setIsEventDialogOpen(true)} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="xl:col-span-2 space-y-6">
          
          <InfoCard title="Chapter Summary" delay={0.1}>
            <p className="text-muted-foreground leading-relaxed">
              {chapter.description || `Master the foundational concepts of ${chapter.title} to secure high weightage marks in JEE Main. This chapter forms a crucial stepping stone for advanced topics in ${subject.name}, equipping you with the necessary problem-solving frameworks.`}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
              <MetaItem label="Estimated Questions" value="120+" />
              <MetaItem label="Revision Difficulty" value="Medium" />
              <MetaItem label="Study Hours" value={chapter.estimated_study_time} />
              <MetaItem label="Weightage" value={chapter.weightage || "High"} />
            </div>
          </InfoCard>

          <InfoCard title="Learning Objectives" delay={0.2}>
            <p className="text-sm text-muted-foreground mb-4">By the end of this chapter, you will be able to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-hover/50 border border-glass-border">
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm leading-snug text-foreground/80">{obj}</span>
                </div>
              ))}
            </div>
          </InfoCard>

          <TopicsList topics={chapter.topics} />
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          
          <SidebarCard title="Progress & Analytics" className="bg-gradient-to-b from-surface-hover to-transparent" delay={0.3}>
            <div className="space-y-5">
              {/* Main Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Mastery Level</span>
                  <span className="font-semibold text-primary">{chapter.completionPercentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-hover rounded-full overflow-hidden border border-glass-border">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    style={{ width: `${chapter.completionPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <StatPanel icon={ListChecks} label="Topics Covered" value={`${topicsCompleted} / ${chapter.topics.length}`} />
                <StatPanel icon={Activity} label="Sessions" value="4" />
                <StatPanel icon={Brain} label="Revisions" value="2" />
                <StatPanel icon={Flame} label="Current Streak" value="3 Days" highlight />
                <div className="col-span-2 mt-1 flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-sm font-medium text-yellow-500/80">XP Earned in Chapter</span>
                  <span className="text-sm font-bold text-yellow-500">+{xpEarned} XP</span>
                </div>
              </div>
            </div>
          </SidebarCard>

          {/* Recent Notes Summary Card */}
          <SidebarCard title="Recent Chapter Notes" delay={0.35}>
            <div className="space-y-3">
              {recentNotes.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2">
                  No notes taken for this chapter yet. Click Chapter Notes to start writing.
                </div>
              ) : (
                recentNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onSelectTab?.("notes")}
                    className="p-3 rounded-xl bg-surface-hover/40 border border-glass-border hover:bg-surface-hover transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground truncate">{note.title}</span>
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {note.content.replace(/[#*`$]/g, "") || "Empty note"}
                    </p>
                  </div>
                ))
              )}
              <button
                onClick={() => onSelectTab?.("notes")}
                className="w-full py-2 text-xs text-center font-medium text-primary hover:underline"
              >
                View all notes &rarr;
              </button>
            </div>
          </SidebarCard>

          <SidebarCard title="Syllabus Connections" delay={0.4}>
            <div className="space-y-5">
              
              {/* Prerequisites */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prerequisites</h4>
                <div className="space-y-2">
                  {chapter.prerequisites && chapter.prerequisites.length > 0 ? (
                    chapter.prerequisites.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        <span className="leading-tight">{req}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No prerequisites needed.</div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                {previousChapter && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">Previous</span>
                    <Link 
                      href={`/dashboard/study/${subject.slug}/${previousChapter.slug}`}
                      className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {previousChapter.title}
                    </Link>
                  </div>
                )}
                
                {nextChapter && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">Up Next</span>
                    <Link 
                      href={`/dashboard/study/${subject.slug}/${nextChapter.slug}`}
                      className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 group"
                    >
                      <span className="line-clamp-1">{nextChapter.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
              
            </div>
          </SidebarCard>

        </div>
      </div>
      
      <CreateEventDialog 
        isOpen={isEventDialogOpen} 
        onClose={() => setIsEventDialogOpen(false)} 
        defaultChapterId={chapter.id}
        defaultSubjectId={subject.id}
      />
    </div>
  );
}

/* Helper Components */

function ActionCard({ icon: Icon, label, sub, highlight = false, onClick }: { icon: React.ElementType, label: string, sub: string, highlight?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick || (() => toast("Coming soon"))}
      className={`flex flex-col items-start text-left p-4 rounded-2xl border transition-all duration-300 group ${
      highlight 
        ? "bg-primary text-primary-foreground border-primary/50 shadow-lg shadow-primary/20 hover:bg-primary/90" 
        : "bg-surface hover:bg-surface-hover border-glass-border hover:border-border"
    }`}>
      <div className={`p-2 rounded-lg mb-3 ${highlight ? "bg-background/20" : "bg-primary/10 text-primary"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-semibold text-sm mb-0.5">{label}</span>
      <span className={`text-xs ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{sub}</span>
    </button>
  );
}

function MetaItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function StatPanel({ icon: Icon, label, value, highlight = false }: { icon: React.ElementType, label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-hover/50 border border-glass-border">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${highlight ? "text-orange-500" : "text-muted-foreground"}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      </div>
      <span className="text-sm font-bold pl-5">{value}</span>
    </div>
  );
}
