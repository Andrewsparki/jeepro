"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Settings, Play, Bookmark, BookOpen, Target, Calendar, Calculator, Sparkles, BookType, Book, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { useCommandPalette } from "../context/command-palette-context";
import { useSearchData, SearchItem } from "../hooks/use-search-data";
import { useStudySession } from "@/features/study/context/study-session-context";

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const { items } = useSearchData();
  const router = useRouter();
  const { startSession } = useStudySession();
  
  const [search, setSearch] = useState("");

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setSearch("");
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    } else {
      toast("Coming soon", { description: "This feature is not yet implemented." });
    }
  };

  const executeAction = (action: "start-session" | "create-event" | "resume") => {
    setIsOpen(false);
    setSearch("");
    if (action === "start-session") {
      startSession();
    } else {
      toast("Coming soon");
    }
  };

  const getIcon = (type: string, id: string) => {
    if (id === "tool-notes") return <FileText className="w-4 h-4 text-blue-400" />;
    if (id === "tool-formula") return <Calculator className="w-4 h-4 text-emerald-400" />;
    if (id === "tool-flashcards") return <BookType className="w-4 h-4 text-purple-400" />;
    if (id === "tool-pyqs") return <Target className="w-4 h-4 text-orange-400" />;
    if (id === "tool-tutor") return <Sparkles className="w-4 h-4 text-amber-400" />;
    if (id === "tool-bookmarks") return <Bookmark className="w-4 h-4 text-rose-400" />;
    if (id === "nav-settings") return <Settings className="w-4 h-4 text-slate-400" />;
    if (id === "nav-dashboard") return <BookOpen className="w-4 h-4 text-indigo-400" />;
    if (id === "nav-planner") return <Calendar className="w-4 h-4 text-cyan-400" />;
    if (id === "nav-analytics") return <Target className="w-4 h-4 text-pink-400" />;
    
    if (type === "subject") return <Book className="w-4 h-4 text-muted-foreground" />;
    if (type === "chapter") return <FileText className="w-4 h-4 text-muted-foreground" />;
    
    return <ChevronRight className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl px-4 pointer-events-auto"
            >
              <Command
                className="overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl"
                shouldFilter={true}
              >
                <div className="flex items-center border-b border-white/5 px-4">
                  <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                  <Command.Input
                    autoFocus
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search for chapters, tools, or commands..."
                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      ESC
                    </kbd>
                  </div>
                </div>
                
                <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2 cmdk-list">
                  <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {!search && (
                    <Command.Group heading="Suggestions" className="text-xs font-medium text-muted-foreground px-2 py-2">
                      <Command.Item 
                        onSelect={() => executeAction("start-session")}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm aria-selected:bg-accent/20 aria-selected:text-accent transition-colors mt-1"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Study Session</span>
                      </Command.Item>
                      <Command.Item 
                        onSelect={() => executeAction("resume")}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm aria-selected:bg-white/10 transition-colors mt-1"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Resume Last Session</span>
                      </Command.Item>
                    </Command.Group>
                  )}

                  <Command.Group heading="Navigation & Tools" className="text-xs font-medium text-muted-foreground px-2 py-2">
                    {items.filter(i => i.type === "navigation" || i.type === "tool").map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-white/10 transition-colors mt-1"
                      >
                        {getIcon(item.type, item.id)}
                        <span>{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group heading="Syllabus Chapters" className="text-xs font-medium text-muted-foreground px-2 py-2">
                    {items.filter(i => i.type === "chapter").map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.keywords?.join(" ")}`}
                        onSelect={() => handleSelect(item)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-white/10 transition-colors mt-1"
                      >
                        {getIcon(item.type, item.id)}
                        <span>{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                </Command.List>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
