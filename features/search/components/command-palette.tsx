"use client";

import React, { useState, useMemo } from "react";
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
    return <IconComp className="w-4 h-4 text-[#A4ADBB] transition-colors group-hover:text-[#78A9FF] group-aria-selected:text-[#78A9FF]" />;
  }
  if (type === "subject") return <Book className="w-4 h-4 text-[#A4ADBB] transition-colors group-hover:text-[#78A9FF] group-aria-selected:text-[#78A9FF]" />;
  if (type === "chapter") return <FileText className="w-4 h-4 text-[#A4ADBB] transition-colors group-hover:text-[#78A9FF] group-aria-selected:text-[#78A9FF]" />;
  return <ChevronRight className="w-4 h-4 text-[#A4ADBB] transition-colors group-hover:text-[#78A9FF] group-aria-selected:text-[#78A9FF]" />;
}

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const { items } = useSearchData(isOpen);
  const router = useRouter();
  const { startSession } = useStudySession();
  const { user } = useAuth();
  const { setIsOpen: setIsAiOpen } = useAiAssistant();
  
  const [search, setSearch] = useState("");

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
            className="fixed inset-0 z-50 bg-[#0B0D12]/80 backdrop-blur-md"
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
                className="overflow-hidden rounded-2xl border border-[#2B3342] bg-[#0B0D12]/95 text-[#F5F7FB] shadow-[0_24px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(120,169,255,0.08)] backdrop-blur-2xl ring-1 ring-[#78A9FF]/20"
                shouldFilter={true}
              >
                {/* Search Bar Header */}
                <div className="group/search flex items-center border-b border-[#2B3342]/70 px-4 bg-[#121722]/60 focus-within:bg-[#121722]/90 focus-within:border-[#78A9FF]/40 transition-colors duration-200">
                  <Search className="mr-3 h-5 w-5 shrink-0 text-[#78A9FF]/70 group-focus-within/search:text-[#78A9FF] transition-colors duration-200" />
                  <Command.Input
                    autoFocus
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search chapters, tools, or navigation..."
                    className="flex h-14 w-full bg-transparent py-3 text-sm font-medium text-[#F5F7FB] outline-none border-none focus:outline-none focus:border-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none [box-shadow:none!important] placeholder:text-[#A4ADBB]/60 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex items-center gap-1.5 ml-2">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-[#2B3342] bg-[#171D28] px-1.5 font-mono text-[10px] font-semibold text-[#A4ADBB]">
                      ESC
                    </kbd>
                  </div>
                </div>
                
                <Command.List className="max-h-[360px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                  <Command.Empty className="py-12 text-center text-sm text-[#A4ADBB]">
                    No results found.
                  </Command.Empty>

                  {!search && (
                    <Command.Group 
                      heading="Suggestions" 
                      className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A4ADBB]/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-[#A4ADBB]/70"
                    >
                      <Command.Item 
                        onSelect={() => executeAction("start-session")}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] transition-colors duration-150 ease-out outline-none aria-selected:bg-[rgba(120,169,255,0.12)] aria-selected:text-[#F5F7FB] hover:bg-[rgba(120,169,255,0.08)]"
                      >
                        <Play className="h-4 w-4 text-[#78A9FF] shrink-0" />
                        <span className="font-semibold">Start Study Session</span>
                      </Command.Item>
                      <Command.Item 
                        onSelect={() => executeAction("resume")}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] transition-colors duration-150 ease-out outline-none aria-selected:bg-[rgba(120,169,255,0.12)] aria-selected:text-[#F5F7FB] hover:bg-[rgba(120,169,255,0.08)]"
                      >
                        <Clock className="h-4 w-4 text-[#A4ADBB] group-aria-selected:text-[#78A9FF] shrink-0 transition-colors" />
                        <span>Resume Last Session</span>
                      </Command.Item>
                    </Command.Group>
                  )}

                  <Command.Group 
                    heading="Navigation & Tools" 
                    className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A4ADBB]/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-[#A4ADBB]/70"
                  >
                    {navAndToolItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] transition-colors duration-150 ease-out outline-none aria-selected:bg-[rgba(120,169,255,0.12)] aria-selected:text-[#F5F7FB] hover:bg-[rgba(120,169,255,0.08)]"
                      >
                        <ItemIcon type={item.type} id={item.id} />
                        <span className="truncate">{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group 
                    heading="Syllabus Chapters" 
                    className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A4ADBB]/80 px-2.5 pt-3 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-[#A4ADBB]/70"
                  >
                    {chapterItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] transition-colors duration-150 ease-out outline-none aria-selected:bg-[rgba(120,169,255,0.12)] aria-selected:text-[#F5F7FB] hover:bg-[rgba(120,169,255,0.08)]"
                      >
                        <ItemIcon type={item.type} id={item.id} />
                        <span className="truncate">{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                </Command.List>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-[#2B3342]/70 px-4 py-2.5 bg-[#121722]/50 text-[11px] font-mono text-[#A4ADBB]/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-[#2B3342] bg-[#171D28] px-1 py-0.5 text-[10px]">↑</kbd>
                      <kbd className="rounded border border-[#2B3342] bg-[#171D28] px-1 py-0.5 text-[10px]">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="rounded border border-[#2B3342] bg-[#171D28] px-1 py-0.5 text-[10px]">↵</kbd>
                      Select
                    </span>
                  </div>
                  <span className="text-[#78A9FF]/80 font-semibold tracking-wide">JEE PRO SEARCH</span>
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
