"use client";

import { useMemo } from "react";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { 
  ArrowRight, CheckCircle2, Play, Calculator, Target, Calendar, 
  Brain, Flame, Activity, ListChecks
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { InfoCard, SidebarCard } from "./components/workspace-cards";
import { CreateEventDialog } from "@/features/planner/components/create-event-dialog";

interface OverviewTabProps {
  chapter: Chapter;
  subject: Subject;
}

export function OverviewTab({ chapter, subject }: OverviewTabProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const { nextChapter, previousChapter, topicsCompleted, xpEarned } = useMemo(() => {
    const currentIndex = subject.chapters.findIndex((c) => c.id === chapter.id);
    const next = currentIndex >= 0 && currentIndex < subject.chapters.length - 1 
      ? subject.chapters[currentIndex + 1] 
      : null;
    const prev = currentIndex > 0 
      ? subject.chapters[currentIndex - 1] 
      : null;
    const completed = Math.floor((chapter.completionPercentage / 100) * chapter.topics.length);
    const xp = chapter.completionPercentage * 15;
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
        <ActionCard icon={Play} label="Continue Studying" sub="Resume your session" highlight />
        <ActionCard icon={Calculator} label="Formula Sheet" sub="Quick reference" />
        <ActionCard icon={Target} label="Start Practice" sub="Test your knowledge" />
        <ActionCard icon={Calendar} label="Schedule Revision" sub="Spaced repetition" onClick={() => setIsEventDialogOpen(true)} />
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
