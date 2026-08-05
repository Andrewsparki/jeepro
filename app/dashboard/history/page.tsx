"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { getStudySessions, StudySession, deleteStudySessions, clearAllStudySessions } from "@/features/study/services/progress";
import { getSyllabus, Subject } from "@/features/syllabus/services/syllabus";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { HistoryToolbar, SortOption } from "@/features/history/components/history-toolbar";
import { SessionCard } from "@/features/history/components/session-card";
import { motion, AnimatePresence } from "framer-motion";
import { useDialog } from "@/providers/dialog-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
function HistorySkeleton() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-5xl mx-auto w-full animate-stagger-container">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Sessions List Skeleton */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-glass-border bg-glass p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-2 hidden md:block">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function HistoryPage() {
  const { alert, confirm } = useDialog();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [syllabus, setSyllabus] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      const [sessionsData, syllabusData] = await Promise.all([
        getStudySessions(),
        getSyllabus()
      ]);
      setSessions(sessionsData);
      setSyllabus(syllabusData);
      setLoading(false);
    }
    loadData();
  }, []);

  const getSubjectName = useCallback((chapterId?: string | null) => {
    if (!chapterId) return "General";
    for (const sub of syllabus) {
      if (sub.chapters.find(c => c.id === chapterId)) {
        return sub.name;
      }
    }
    return "Unknown Subject";
  }, [syllabus]);
  
  const getChapterTitle = useCallback((chapterId?: string | null) => {
    if (!chapterId) return "Open Study";
    for (const sub of syllabus) {
      const chap = sub.chapters.find(c => c.id === chapterId);
      if (chap) return chap.title;
    }
    return "Unknown Chapter";
  }, [syllabus]);

  // Filter and Sort Logic
  const processedSessions = useMemo(() => {
    let result = [...sessions];

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const sub = getSubjectName(s.chapter_id).toLowerCase();
        const chap = getChapterTitle(s.chapter_id).toLowerCase();
        const activity = (s.activity_type || "Open Study").toLowerCase();
        return sub.includes(query) || chap.includes(query) || activity.includes(query);
      });
    }

    // Time filter
    if (timeFilter !== "all") {
      result = result.filter(s => {
        const date = new Date(s.started_at);
        if (timeFilter === "today") return isToday(date);
        if (timeFilter === "week") return isThisWeek(date);
        if (timeFilter === "month") return isThisMonth(date);
        return true;
      });
    }

    // Subject filter
    if (subjectFilter !== "all") {
      result = result.filter(s => getSubjectName(s.chapter_id) === subjectFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "newest") return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
      if (sortOption === "oldest") return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
      if (sortOption === "longest") return b.duration_seconds - a.duration_seconds;
      if (sortOption === "shortest") return a.duration_seconds - b.duration_seconds;
      return 0;
    });

    return result;
  }, [sessions, searchQuery, timeFilter, subjectFilter, sortOption, getSubjectName, getChapterTitle]);

  // Bulk Actions
  const handleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    const isConfirmed = await confirm({
      title: "Delete Selected Sessions?",
      message: `Are you sure you want to delete ${selectedIds.size} sessions? This cannot be undone and may affect your XP and streak.`,
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!isConfirmed) return;

    const success = await deleteStudySessions(Array.from(selectedIds));
    if (success) {
      setSelectedIds(new Set());
      // Re-fetch data
      const [sessionsData] = await Promise.all([getStudySessions()]);
      setSessions(sessionsData);
    } else {
      await alert({ title: "Error", message: "Failed to delete sessions." });
    }
  };

  const handleClearHistory = async () => {
    const isConfirmed = await confirm({
      title: "Clear All History?",
      message: "WARNING: Are you sure you want to clear your ENTIRE study history? This action is permanent and will severely affect your progress data.",
      variant: "destructive",
      confirmLabel: "Clear History",
    });
    if (!isConfirmed) return;

    const success = await clearAllStudySessions();
    if (success) {
      setSelectedIds(new Set());
      // Re-fetch data
      const [sessionsData] = await Promise.all([getStudySessions()]);
      setSessions(sessionsData);
    } else {
      await alert({ title: "Error", message: "Failed to clear history." });
    }
  };

  // Export
  const handleExportCSV = () => {
    if (processedSessions.length === 0) return;
    const headers = ["Session ID", "Subject", "Chapter", "Activity", "Start Time", "End Time", "Duration (s)", "XP Earned", "Completion %"];
    const rows = processedSessions.map(s => [
      s.id,
      getSubjectName(s.chapter_id),
      getChapterTitle(s.chapter_id),
      s.activity_type || "Open Study",
      new Date(s.started_at).toISOString(),
      new Date(s.ended_at).toISOString(),
      s.duration_seconds.toString(),
      (s.xp_earned || Math.floor(s.duration_seconds / 60) * 2).toString(),
      (s.completion_percentage || 100).toString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    if (processedSessions.length === 0) return;
    const data = processedSessions.map(s => ({
      id: s.id,
      subject: getSubjectName(s.chapter_id),
      chapter: getChapterTitle(s.chapter_id),
      activity: s.activity_type || "Open Study",
      startedAt: s.started_at,
      endedAt: s.ended_at,
      durationSeconds: s.duration_seconds,
      xpEarned: s.xp_earned || Math.floor(s.duration_seconds / 60) * 2,
      completionPercentage: s.completion_percentage || 100
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-5xl mx-auto w-full animate-stagger-container">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Session Explorer</h1>
          <p className="text-muted-foreground">Search, filter, and review your past study sessions in detail.</p>
        </div>

        <HistoryToolbar 
          syllabus={syllabus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={setSubjectFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onDeleteSelected={handleDeleteSelected}
          onClearHistory={handleClearHistory}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />

        {/* Selection All Toggle Header */}
        {processedSessions.length > 0 && (
          <div className="flex items-center justify-between px-2 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
              const allSelected = selectedIds.size === processedSessions.length && processedSessions.length > 0;
              if (!allSelected) {
                setSelectedIds(new Set(processedSessions.map(s => s.id)));
              } else {
                setSelectedIds(new Set());
              }
            }}>
              <Checkbox 
                checked={selectedIds.size === processedSessions.length && processedSessions.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds(new Set(processedSessions.map(s => s.id)));
                  } else {
                    setSelectedIds(new Set());
                  }
                }}
                variant="circle"
              />
              <span className="group-hover:text-foreground transition-colors">Select All {processedSessions.length} Sessions</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {processedSessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-2xl"
              >
                <Calendar className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p>No study sessions found matching your criteria.</p>
              </motion.div>
            ) : (
              processedSessions.map((session) => (
                <SessionCard 
                  key={session.id}
                  session={session}
                  subjectName={getSubjectName(session.chapter_id)}
                  chapterTitle={getChapterTitle(session.chapter_id)}
                  isSelected={selectedIds.has(session.id)}
                  onSelect={handleSelect}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
}
