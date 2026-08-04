"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Target, StickyNote, Sparkles, Bookmark, History, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ToolId = "timer" | "goal" | "notes" | "ai" | "bookmarks" | "history" | null;

export function WorkspaceTools() {
  const [activeTool, setActiveTool] = useState<ToolId>("goal");

  const tools = [
    { id: "timer", icon: Timer, label: "Study Timer" },
    { id: "goal", icon: Target, label: "Today's Goal" },
    { id: "notes", icon: StickyNote, label: "Quick Notes" },
    { id: "ai", icon: Sparkles, label: "AI Tutor" },
    { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
    { id: "history", icon: History, label: "Recent Activity" },
  ] as const;

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
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-200 group outline-none",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
                title={tool.label}
              >
                <tool.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                {isActive && (
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

                {/* Placeholder Content for Widgets */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl bg-surface/30">
                  <p className="text-sm text-muted-foreground mb-4">
                    This widget is currently in development.
                  </p>
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={() => toast("Coming soon")}>
                    Learn More
                  </Button>
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
