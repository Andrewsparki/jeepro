"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, Target, StickyNote, Sparkles, Bookmark, History, 
  ChevronRight, X, Play, Square, CheckCircle2, Clock, Send 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { useStudySession, useStudyTimer } from "@/features/study/context/study-session-context";

type ToolId = "timer" | "goal" | "notes" | "ai" | "bookmarks" | "history" | null;

interface WorkspaceToolsProps {
  chapter?: Chapter;
  subject?: Subject;
}

export function WorkspaceTools({ chapter, subject }: WorkspaceToolsProps) {
  console.log("[WorkspaceTools] Rendering WorkspaceTools for chapter:", chapter?.title);
  const [activeTool, setActiveTool] = useState<ToolId>("goal");
  const { isActive, startSession, endSession } = useStudySession();
  const elapsedSeconds = useStudyTimer();

  // Notes state saved per chapter initialized lazily
  const [noteText, setNoteText] = useState(() => {
    if (typeof window !== "undefined" && chapter) {
      return localStorage.getItem(`jee_notes_${chapter.id}`) || "";
    }
    return "";
  });
  const [isSaved, setIsSaved] = useState(false);

  // AI input state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleNotesChange = (val: string) => {
    setNoteText(val);
    if (chapter) {
      localStorage.setItem(`jee_notes_${chapter.id}`, val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAskAi = () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiResponse(`Here is a helpful tip for "${aiQuestion}": Focus on mastering core definitions and dimensional consistency for ${chapter?.title || 'this topic'}.`);
      setAiQuestion("");
    }, 800);
  };

  const tools = [
    { id: "timer", icon: Timer, label: "Study Timer" },
    { id: "goal", icon: Target, label: "Today's Goal" },
    { id: "notes", icon: StickyNote, label: "Quick Notes" },
    { id: "ai", icon: Sparkles, label: "AI Tutor" },
    { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
    { id: "history", icon: History, label: "Recent Activity" },
  ] as const;

  const topicsCompleted = chapter ? chapter.topics.filter(t => t.status === "Mastered").length : 0;
  const totalTopics = chapter ? chapter.topics.length : 0;

  return (
    <motion.aside 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex w-16 lg:w-72 h-full border-l border-border/50 bg-background/95 flex-col shrink-0"
    >
      <div className="hidden lg:flex items-center justify-between p-5 border-b border-border/50">
        <span className="text-sm font-semibold">Workspace Tools</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tool Icons Strip */}
        <div className="w-16 flex flex-col items-center py-4 gap-2 border-r border-border/50 lg:border-none lg:bg-surface/30">
          {tools.map((tool) => {
            const isToolActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isToolActive ? null : tool.id)}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-200 group outline-none",
                  isToolActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
                title={tool.label}
              >
                <tool.icon className={cn("w-5 h-5", isToolActive && "fill-primary/20")} />
                {isToolActive && (
                  <motion.div
                    layoutId="active-tool-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tool Widget Area (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col p-4 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {activeTool ? (
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2 text-sm">
                    {(() => {
                      const tool = tools.find(t => t.id === activeTool);
                      if (!tool) return null;
                      const Icon = tool.icon;
                      return (
                        <>
                          <Icon className="w-4 h-4 text-primary" />
                          {tool.label}
                        </>
                      );
                    })()}
                  </h3>
                  <button 
                    onClick={() => setActiveTool(null)}
                    className="p-1 rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Widget Contents */}
                <div className="flex-1 flex flex-col">
                  {/* TIMER WIDGET */}
                  {activeTool === "timer" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-glass-border rounded-2xl bg-surface/30 space-y-5">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Timer className="w-8 h-8 animate-pulse" />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          {isActive ? "Session Active" : "No Active Session"}
                        </div>
                        <div className="font-mono text-3xl font-bold text-foreground">
                          {formatTimer(elapsedSeconds)}
                        </div>
                      </div>

                      {isActive ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => endSession()}
                          className="w-full rounded-xl gap-2 shadow-lg shadow-destructive/20"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          End & Save Session
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => startSession(subject?.id, chapter?.id)}
                          className="w-full rounded-xl gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start Session
                        </Button>
                      )}
                    </div>
                  )}

                  {/* GOAL WIDGET */}
                  {activeTool === "goal" && (
                    <div className="flex-1 flex flex-col p-4 border border-glass-border rounded-2xl bg-surface/30 space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Chapter Goal</span>
                        <h4 className="font-semibold text-sm line-clamp-1">{chapter?.title || "Current Chapter"}</h4>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Topics Completed</span>
                          <span className="font-semibold text-primary">{topicsCompleted} / {totalTopics}</span>
                        </div>
                        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-glass-border">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${totalTopics > 0 ? (topicsCompleted / totalTopics) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50 space-y-2">
                        {chapter?.topics.slice(0, 4).map(topic => (
                          <div key={topic.id} className="flex items-center justify-between text-xs py-1">
                            <span className="truncate max-w-[170px] text-muted-foreground">{topic.title}</span>
                            {topic.status === "Mastered" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NOTES WIDGET */}
                  {activeTool === "notes" && (
                    <div className="flex-1 flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Auto-saved to chapter</span>
                        {isSaved && <span className="text-[10px] text-emerald-500 font-medium">Saved</span>}
                      </div>
                      <textarea 
                        value={noteText}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Jot down quick formulas, insights, or key points for this chapter..."
                        className="flex-1 min-h-[220px] resize-none text-xs bg-surface/40 border-glass-border rounded-xl p-3 focus-visible:ring-primary/50 text-foreground outline-none"
                      />
                    </div>
                  )}

                  {/* AI TUTOR WIDGET */}
                  {activeTool === "ai" && (
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="flex-1 p-3 border border-glass-border rounded-xl bg-surface/30 overflow-y-auto text-xs space-y-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary leading-relaxed">
                          👋 Hi! Ask me any question or concept related to {chapter?.title || "this chapter"}.
                        </div>
                        {isAiLoading && (
                          <div className="p-2.5 rounded-lg bg-surface-hover text-muted-foreground animate-pulse">
                            Thinking...
                          </div>
                        )}
                        {aiResponse && (
                          <div className="p-2.5 rounded-lg bg-surface-hover text-foreground leading-relaxed border border-glass-border">
                            {aiResponse}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAskAi()}
                          placeholder="Ask AI tutor..."
                          className="text-xs h-9 bg-surface/40 border-glass-border rounded-lg"
                        />
                        <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={handleAskAi}>
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* BOOKMARKS WIDGET */}
                  {activeTool === "bookmarks" && (
                    <div className="flex-1 flex flex-col p-4 border border-glass-border rounded-2xl bg-surface/30 items-center justify-center text-center space-y-2">
                      <Bookmark className="w-6 h-6 text-primary/60 mb-1" />
                      <h4 className="text-xs font-semibold">Workspace Bookmarks</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Bookmark important formulas and concepts while studying to reference them here.
                      </p>
                    </div>
                  )}

                  {/* RECENT ACTIVITY WIDGET */}
                  {activeTool === "history" && (
                    <div className="flex-1 flex flex-col p-4 border border-glass-border rounded-2xl bg-surface/30 space-y-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Study Log</span>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-surface-hover/60 border border-glass-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Chapter Practice</span>
                          </div>
                          <span className="text-muted-foreground font-mono text-[10px]">Today</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground"
              >
                <ChevronRight className="w-6 h-6 mb-2 opacity-20" />
                <p className="text-sm">Select a tool from the menu to open its widget.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
