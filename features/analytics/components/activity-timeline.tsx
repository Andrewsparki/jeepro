"use client";

import { useMemo } from "react";
import { StudySession } from "@/features/study/services/progress";
import { formatDistanceToNow } from "date-fns";
import { Activity, BookOpen, PenTool, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActivityTimelineProps {
  sessions: StudySession[];
}

export function ActivityTimeline({ sessions }: ActivityTimelineProps) {
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 10);
  }, [sessions]);

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    if (s.includes("phys")) return <Activity className="w-4 h-4 text-purple-500" />;
    if (s.includes("chem")) return <PenTool className="w-4 h-4 text-emerald-500" />;
    return <BookOpen className="w-4 h-4 text-accent" />;
  };

  const getSubjectColorClass = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
    if (s.includes("phys")) return "bg-purple-500/10 border-purple-500/20 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)]";
    if (s.includes("chem")) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    return "bg-accent/10 border-accent/20 text-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]";
  };

  return (
    <div className="premium-card p-6 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
        <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] border border-accent/20">
          <Activity className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-xl tracking-tight text-foreground">Activity Timeline</h3>
      </div>

      <div 
        className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 relative z-10 custom-scrollbar"
        data-lenis-prevent="true"
      >
        {recentSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <Activity className="w-12 h-12 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No recent activity</p>
          </div>
        ) : (
          <div className="relative border-l border-border/50 ml-4 space-y-8 pb-4">
            {recentSessions.map((session, i) => (
              <motion.div 
                key={session.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="relative pl-6 group cursor-default"
              >
                {/* Node */}
                <div className={cn(
                  "absolute -left-[17px] top-1 w-[34px] h-[34px] rounded-full border-4 border-background flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  getSubjectColorClass(session.subject_id || "")
                )}>
                  {getSubjectIcon(session.subject_id || "")}
                </div>
                
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 transition-all duration-300 group-hover:bg-muted/50 group-hover:border-border group-hover:shadow-md">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{session.topic_id || "Session"}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50 shadow-sm whitespace-nowrap">
                      {Math.ceil(session.duration_seconds / 60)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border",
                      getSubjectColorClass(session.subject_id || "").replace("w-[34px]", "")
                    )}>
                      {session.subject_id}
                    </span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(session.started_at))} ago</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Scroll Fade Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
}

export function ActivityTimelineSkeleton() {
  return (
    <div className="premium-card p-6 h-[400px] flex flex-col">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted/20 animate-pulse" />
          <div className="h-6 w-40 bg-muted/20 rounded-md animate-pulse" />
       </div>
       <div className="flex-1 space-y-6 ml-4 border-l border-border/50 pl-6">
          {[1,2,3].map(i => (
             <div key={i} className="relative">
                <div className="absolute -left-[38px] top-1 w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
                <div className="h-24 w-full bg-muted/10 rounded-xl animate-pulse" />
             </div>
          ))}
       </div>
    </div>
  );
}
