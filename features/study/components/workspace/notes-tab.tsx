"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Search, Pin, Bookmark, Trash2, Edit3, Eye, Columns,
  Check, Save, Clock, BookOpen, Sparkles, Sigma
} from "lucide-react";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { UserNote, getUserNotes, createNote, updateNote, deleteNote, togglePinNote } from "@/features/study/services/notes.service";
import { toggleBookmark, checkIsBookmarked } from "@/features/study/services/bookmarks.service";
import { MathRenderer } from "@/components/ui/math-renderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface NotesTabProps {
  chapter: Chapter;
  subject: Subject;
}

type ViewMode = "edit" | "split" | "preview";

export function NotesTab({ chapter, subject }: NotesTabProps) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  const handleSelectNote = async (noteId: string) => {
    setSelectedNoteId(noteId);
    const selected = notes.find((note) => note.id === noteId);
    if (selected) {
      const nextBookmarked = await checkIsBookmarked("note", selected.id);
      setIsBookmarked(nextBookmarked);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setIsLoading(true);
      try {
        const fetched = await getUserNotes(
          subject.id,
          chapter.id,
          selectedTopicId === "All" ? undefined : selectedTopicId
        );
        if (cancelled) return;

        setNotes(fetched);

        if (fetched.length > 0 && (!selectedNoteId || !fetched.some((note) => note.id === selectedNoteId))) {
          setSelectedNoteId(fetched[0].id);
        } else if (fetched.length === 0) {
          setSelectedNoteId(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [subject.id, chapter.id, selectedNoteId, selectedTopicId]);

  // Handle Note Creation
  const handleCreateNote = async () => {
    try {
      const created = await createNote({
        subject_id: subject.id,
        chapter_id: chapter.id,
        topic_id: selectedTopicId === "All" ? null : selectedTopicId,
        title: "Untitled Study Note",
        content: "# New Note\n\nJot down equations like $E = mc^2$ or detailed step-by-step concepts.",
        tags: [chapter.title],
      });

      setNotes((prev) => [created, ...prev]);
      setSelectedNoteId(created.id);
      setIsBookmarked(false);
      toast.success("New note created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create note.");
    }
  };

  // Debounced Save for active note changes
  const handleNoteChange = (fields: Partial<UserNote>) => {
    if (!activeNote) return;

    const updated = { ...activeNote, ...fields };
    setSaveStatus("unsaved");

    // Update local list state immediately for snappy UI
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updated : n)));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      const res = await updateNote(activeNote.id, chapter.id, fields);
      if (res) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    }, 600);
  };

  // Toggle Pin
  const handleTogglePin = async () => {
    if (!activeNote) return;
    const nextPinned = !activeNote.is_pinned;
    handleNoteChange({ is_pinned: nextPinned });
    await togglePinNote(activeNote.id, chapter.id, nextPinned);
    toast(nextPinned ? "Note pinned to top" : "Note unpinned");
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!activeNote) return;
    const nextState = await toggleBookmark("note", activeNote.id, chapter.id, activeNote.title);
    setIsBookmarked(nextState);
    toast(nextState ? "Bookmarked note" : "Removed bookmark");
  };

  // Delete Note
  const handleDeleteNote = async () => {
    if (!activeNote) return;
    await deleteNote(activeNote.id, chapter.id);
    toast.success("Note deleted");

    const remaining = notes.filter((n) => n.id !== activeNote.id);
    setNotes(remaining);
    if (remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    } else {
      setSelectedNoteId(null);
    }
  };

  // Insert Quick Math snippet
  const insertMathSnippet = (snippet: string) => {
    if (!activeNote) return;
    const nextContent = `${activeNote.content}\n${snippet}`;
    handleNoteChange({ content: nextContent });
  };

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[550px] gap-4 max-w-7xl mx-auto pb-12">
      {/* Left Sidebar - Notes List */}
      <div className="w-full lg:w-80 flex flex-col border border-glass-border rounded-2xl bg-surface/40 p-4 shrink-0 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">Chapter Notes</span>
          </div>
          <Button onClick={handleCreateNote} size="sm" className="rounded-xl gap-1.5 bg-primary text-primary-foreground text-xs">
            <Plus className="w-3.5 h-3.5" />
            New Note
          </Button>
        </div>

        {/* Search & Topic Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-9 h-9 text-xs bg-surface border-glass-border rounded-xl"
            />
          </div>

          {chapter.topics && chapter.topics.length > 0 && (
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full h-8 px-2.5 rounded-xl bg-surface border border-glass-border text-[11px] text-muted-foreground outline-none"
            >
              <option value="All">All Topics ({chapter.topics.length})</option>
              {chapter.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[250px]">
          {isLoading ? (
            <div className="space-y-2 p-2 text-center text-xs text-muted-foreground animate-pulse">
              Loading chapter notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center space-y-3 border border-dashed border-border/50 rounded-xl">
              <Edit3 className="w-6 h-6 mx-auto text-muted-foreground opacity-40" />
              <p className="text-xs text-muted-foreground">No notes found.</p>
              <Button onClick={handleCreateNote} variant="outline" size="sm" className="rounded-full text-xs">
                Create First Note
              </Button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              const topicName = chapter.topics.find((t) => t.id === note.topic_id)?.title;

              return (
                <div
                  key={note.id}
                  onClick={() => void handleSelectNote(note.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer group relative flex flex-col gap-1.5",
                    isSelected
                      ? "bg-surface border-primary/40 shadow-sm"
                      : "bg-surface/30 border-glass-border hover:bg-surface-hover/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn("text-xs font-semibold line-clamp-1", isSelected ? "text-primary" : "text-foreground")}>
                      {note.title || "Untitled Note"}
                    </h4>
                    {note.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`$]/g, "") || "Empty note content..."}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <span>{new Date(note.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    {topicName && <span className="truncate max-w-[110px] text-primary/80 font-medium">{topicName}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Editor Panel */}
      <div className="flex-1 flex flex-col border border-glass-border rounded-2xl bg-surface/40 p-4 space-y-4">
        {activeNote ? (
          <>
            {/* Editor Toolbar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex-1 flex items-center gap-3 w-full">
                <Input
                  value={activeNote.title}
                  onChange={(e) => handleNoteChange({ title: e.target.value })}
                  placeholder="Note Title..."
                  className="text-base font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-foreground"
                />

                {/* Save status badge */}
                <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-surface border border-glass-border shrink-0">
                  {saveStatus === "saved" && (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Saved</span>
                    </>
                  )}
                  {saveStatus === "saving" && (
                    <>
                      <Save className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span className="text-amber-500 font-medium">Saving...</span>
                    </>
                  )}
                  {saveStatus === "unsaved" && (
                    <>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">Unsaved</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons & View Modes */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* View Mode Controls */}
                <div className="flex items-center bg-surface p-1 rounded-xl border border-glass-border">
                  <button
                    onClick={() => {
                      dispatchInteractionSound("ui.tab");
                      setViewMode("edit");
                    }}
                    className={cn("p-1.5 rounded-lg text-xs transition-colors", viewMode === "edit" ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
                    title="Edit Mode"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      dispatchInteractionSound("ui.tab");
                      setViewMode("split");
                    }}
                    className={cn("p-1.5 rounded-lg text-xs transition-colors hidden sm:block", viewMode === "split" ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
                    title="Split Mode"
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      dispatchInteractionSound("ui.tab");
                      setViewMode("preview");
                    }}
                    className={cn("p-1.5 rounded-lg text-xs transition-colors", viewMode === "preview" ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
                    title="Preview Rendered Math"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTogglePin}
                  className={cn("h-8 w-8 rounded-xl", activeNote.is_pinned && "text-amber-500 bg-amber-500/10")}
                  title={activeNote.is_pinned ? "Unpin Note" : "Pin Note"}
                >
                  <Pin className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleBookmark}
                  className={cn("h-8 w-8 rounded-xl", isBookmarked && "text-primary bg-primary/10")}
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark Note"}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteNote}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Math Snippets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar-arrows">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
                <Sigma className="w-3 h-3 text-primary" />
                Math Helpers:
              </span>
              <button
                onClick={() => insertMathSnippet("$v = u + at$")}
                className="px-2 py-0.5 rounded-lg bg-surface border border-glass-border text-[11px] font-serif text-muted-foreground hover:text-foreground hover:bg-surface-hover shrink-0"
              >
                Inline $v=u+at$
              </button>
              <button
                onClick={() => insertMathSnippet("$$\nF = m \\cdot a\n$$")}
                className="px-2 py-0.5 rounded-lg bg-surface border border-glass-border text-[11px] font-serif text-muted-foreground hover:text-foreground hover:bg-surface-hover shrink-0"
              >
                Block $$F = ma$$
              </button>
              <button
                onClick={() => insertMathSnippet("$$\n\\frac{d}{dx}(x^n) = n x^{n-1}\n$$")}
                className="px-2 py-0.5 rounded-lg bg-surface border border-glass-border text-[11px] font-serif text-muted-foreground hover:text-foreground hover:bg-surface-hover shrink-0"
              >
                Fraction {"$$\\frac{d}{dx}$$"}
              </button>
            </div>

            {/* Content Body Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[350px]">
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={cn("flex flex-col h-full", viewMode === "edit" && "md:col-span-2")}>
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleNoteChange({ content: e.target.value })}
                    placeholder="Write your note with Markdown and LaTeX ($...$ for inline, $$...$$ for block math)..."
                    className="flex-1 w-full h-full p-4 rounded-xl bg-background/60 border border-glass-border text-xs font-mono resize-none focus-visible:ring-1 focus-visible:ring-primary outline-none leading-relaxed text-foreground"
                  />
                </div>
              )}

              {(viewMode === "preview" || viewMode === "split") && (
                <div className={cn("flex flex-col h-full p-4 rounded-xl bg-background/60 border border-glass-border overflow-y-auto custom-scrollbar", viewMode === "preview" && "md:col-span-2")}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center justify-between pb-2 border-b border-border/40">
                    <span>Rendered Preview</span>
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <MathRenderer content={activeNote.content} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
            <h3 className="text-base font-semibold">Select or Create a Note</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create detailed notes for this chapter with math equations and quick reference summaries.
            </p>
            <Button onClick={handleCreateNote} className="rounded-full gap-2 text-xs bg-primary">
              <Plus className="w-4 h-4" />
              Create Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
