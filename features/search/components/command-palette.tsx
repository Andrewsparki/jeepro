"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Settings, Play, Bookmark, BookOpen, Target, Calendar, Calculator, Sparkles, BookType, Book, ChevronRight, Clock, MessageSquare, Users, Award } from "lucide-react";
import { toast } from "sonner";
import { useCommandPalette } from "../context/command-palette-context";
import { useSearchData, SearchItem } from "../hooks/use-search-data";
import { useStudySession } from "@/features/study/context/study-session-context";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { useAuth } from "@/features/auth/components/auth-provider";
import { trackSearchUsage, pseudonymiseUserId } from "@/features/analytics/services/telemetry.service";
import { useAiAssistant } from "@/features/ai-assistant/context/ai-assistant-context";

const ICON_MAP: Record<string, { icon: React.ComponentType<{ className?: string }> }> = {
  "tool-notes": { icon: FileText },
  "tool-formula": { icon: Calculator },
  "tool-flashcards": { icon: BookType },
  "tool-pyqs": { icon: Target },
  "tool-tutor": { icon: Sparkles },
  "tool-bookmarks": { icon: Bookmark },
  "nav-settings": { icon: Settings },
  "nav-dashboard": { icon: BookOpen },
  "nav-chat": { icon: MessageSquare },
  "nav-friends": { icon: Users },
  "nav-achievements": { icon: Award },
  "nav-planner": { icon: Calendar },
  "nav-analytics": { icon: Target },
};

function ItemIcon({ type, id }: { type: string; id: string }) {
  const config = ICON_MAP[id];
  if (config) {
    const IconComp = config.icon;
    return <IconComp className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-accent group-aria-selected:text-accent" />;
  }
  if (type === "subject") return <Book className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-accent group-aria-selected:text-accent" />;
  if (type === "chapter") return <FileText className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-accent group-aria-selected:text-accent" />;
  return <ChevronRight className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-accent group-aria-selected:text-accent" />;
}

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const { items } = useSearchData(isOpen);
  const router = useRouter();
  const { startSession } = useStudySession();
  const { user } = useAuth();
  const { setIsOpen: setIsAiOpen } = useAiAssistant();
  
  const [search, setSearch] = useState("");
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Restore focus to the trigger element when the command palette closes
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = (document.activeElement as HTMLElement) || null;
    } else if (previousActiveElementRef.current) {
      const el = previousActiveElementRef.current;
      previousActiveElementRef.current = null;
      requestAnimationFrame(() => {
        el.focus?.();
      });
    }
  }, [isOpen]);

  // Handle Escape key: active only while open and intercepts in capture phase to protect underlying overlays
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, setIsOpen]);

  const userPseudonym = useMemo(
    () => (user?.id ? pseudonymiseUserId(user.id) : undefined),
    [user]
  );

  const { navAndToolItems, chapterItems } = useMemo(() => {
    const navAndTools: SearchItem[] = [];
    const chapters: SearchItem[] = [];
    for (const item of items) {
      if (item.type === "navigation" || item.type === "tool") {
        navAndTools.push(item);
      } else if (item.type === "chapter") {
        chapters.push(item);
      }
    }
    return { navAndToolItems: navAndTools, chapterItems: chapters };
  }, [items]);

  const handleSelect = (item: SearchItem) => {
    if (search.trim()) {
      void trackSearchUsage(search.trim().length, items.length, item.type, userPseudonym);
    }
    setIsOpen(false);
    setSearch("");
    if (item.id === "tool-tutor") {
      setIsAiOpen(true);
      return;
    }
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    } else {
      toast("Coming soon", { description: "This feature is not yet implemented." });
    }
  };

  const executeAction = (action: "start-session" | "create-event" | "resume") => {
    if (search.trim()) {
      void trackSearchUsage(search.trim().length, items.length, "quick-action", userPseudonym);
    }
    setIsOpen(false);
    setSearch("");
    if (action === "start-session") {
      startSession();
    } else {
      toast("Coming soon");
    }
  };

  return (
    <FixedPortal>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl pointer-events-auto"
            >
              <Command
                className="overflow-hidden rounded-2xl border border-border bg-card/95 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.8),0_0_30px_var(--accent-glow)] backdrop-blur-2xl ring-1 ring-accent/15 focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/30 focus-within:shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_40px_var(--accent-glow)] transition-all duration-300 ease-out"
                shouldFilter={true}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }
                }}
              >
                {/* Search Bar Header */}
                <div className="group/search flex items-center border-b border-border/70 px-4 bg-surface/50 focus-within:bg-surface/80 focus-within:border-accent/30 transition-colors duration-300">
                  <Search className="mr-3 h-5 w-5 shrink-0 text-accent/60 group-focus-within/search:text-accent transition-colors duration-300" />
                  <Command.Input
                    autoFocus
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search chapters, tools, or navigation..."
                    className="flex h-14 w-full bg-transparent py-3 text-sm font-medium text-foreground outline-none border-none ring-0 shadow-none focus:outline-none focus:border-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 focus-visible:shadow-none !outline-none !shadow-none !border-none !ring-0 placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                  <div className="flex items-center gap-1.5 ml-2">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-surface px-1.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      ESC
                    </kbd>
                  </div>
                </div>
                
                <Command.List className="max-h-[360px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                  <Command.Empty className="py-12 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {!search && (
                    <Command.Group 
                      heading="Suggestions" 
                      className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-muted-foreground/70"
                    >
                      <Command.Item 
                        onSelect={() => executeAction("start-session")}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out outline-none aria-selected:bg-accent/15 aria-selected:text-foreground hover:bg-accent/10"
                      >
                        <Play className="h-4 w-4 text-accent shrink-0" />
                        <span className="font-semibold">Start Study Session</span>
                      </Command.Item>
                      <Command.Item 
                        onSelect={() => executeAction("resume")}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out outline-none aria-selected:bg-accent/15 aria-selected:text-foreground hover:bg-accent/10"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground group-aria-selected:text-accent shrink-0 transition-colors" />
                        <span>Resume Last Session</span>
                      </Command.Item>
                    </Command.Group>
                  )}

                  <Command.Group 
                    heading="Navigation & Tools" 
                    className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-muted-foreground/70"
                  >
                    {navAndToolItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out outline-none aria-selected:bg-accent/15 aria-selected:text-foreground hover:bg-accent/10"
                      >
                        <ItemIcon type={item.type} id={item.id} />
                        <span className="truncate">{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group 
                    heading="Syllabus Chapters" 
                    className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-muted-foreground/70"
                  >
                    {chapterItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out outline-none aria-selected:bg-accent/15 aria-selected:text-foreground hover:bg-accent/10"
                      >
                        <ItemIcon type={item.type} id={item.id} />
                        <span className="truncate">{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                </Command.List>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 bg-surface/50 text-[11px] font-mono text-muted-foreground/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px]">↑</kbd>
                      <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px]">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px]">↵</kbd>
                      Select
                    </span>
                  </div>
                  <span className="text-accent/80 font-semibold tracking-wide">JEE PRO SEARCH</span>
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    </FixedPortal>
  );
}
