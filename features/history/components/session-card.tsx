"use client";

import { useState } from "react";
import { StudySession } from "@/features/study/services/progress";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Library, 
  ChevronDown, 
  Trophy, 
  CheckCircle2, 
  Activity,
  CalendarDays,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";

interface SessionCardProps {
  session: StudySession;
  subjectName: string;
  chapterTitle: string;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export function SessionCard({
  session,
  subjectName,
  chapterTitle,
  isSelected,
  onSelect
}: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const date = new Date(session.started_at);
  const durationMins = Math.floor(session.duration_seconds / 60);
  const durationSecs = session.duration_seconds % 60;
  
  const activityType = session.activity_type || "Open Study";
  const xpEarned = session.xp_earned || Math.floor(session.duration_seconds / 60) * 2; // Mock fallback if db doesn't have it
  const completionPercent = session.completion_percentage || 100; // Mock fallback

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: 30 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden group",
        isSelected ? "border-accent/50 bg-accent/5 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]" : "border-border/50 bg-card hover:border-accent/30"
      )}
    >
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(session.id, checked)}
              variant="circle"
            />
          </div>
          
          <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0 sm:mt-0">
            <Library className="w-5 h-5" />
          </div>
          
          <div>
            <motion.h4 layout="position" className="font-semibold text-foreground group-hover:text-accent transition-colors">
              {chapterTitle}
            </motion.h4>
            <motion.p layout="position" className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" /> {subjectName}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {format(date, "MMM d, yyyy")}</span>
            </motion.p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{format(date, "h:mm a")}</span>
            <span className="text-xs text-muted-foreground">Time</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{durationMins}m {durationSecs}s</span>
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 text-muted-foreground hidden sm:flex"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] border-l border-border/50 bg-background/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-0">
          <div className="flex flex-col h-full relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -z-10 pointer-events-none" />
            
            <div className="p-6 border-b border-border/50">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold tracking-tight">Session Details</SheetTitle>
                <SheetDescription>
                  Review your performance and timeline for this study block.
                </SheetDescription>
              </SheetHeader>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Header Info */}
              <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{chapterTitle}</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><BookOpen className="w-4 h-4" /> {subjectName}</span>
                  </p>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl glass border border-border/50 flex flex-col gap-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold tracking-tight text-foreground">+{xpEarned}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">XP Earned</span>
                </div>
                
                <div className="p-4 rounded-2xl glass border border-border/50 flex flex-col gap-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Activity className="w-5 h-5 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold tracking-tight text-foreground">{activityType}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Type</span>
                </div>
              </motion.div>

              {/* Completion Progress */}
              <motion.div variants={itemVariants} className="p-5 rounded-2xl glass border border-border/50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Completion</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">{completionPercent}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400" 
                  />
                </div>
              </motion.div>

              {/* Timeline Section */}
              <motion.div variants={itemVariants}>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Session Timeline</h4>
                <div className="relative pl-4 border-l-2 border-border/50 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background" />
                    <p className="text-sm font-medium text-foreground">Started Session</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(session.started_at), "h:mm a · MMM d, yyyy")}</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                    <p className="text-sm font-medium text-foreground">Ended Session</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(session.ended_at), "h:mm a · MMM d, yyyy")}</p>
                    <div className="mt-2 text-xs font-medium px-2 py-1 bg-muted inline-block rounded-md text-muted-foreground">
                      Duration: {durationMins}m {durationSecs}s
                    </div>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
