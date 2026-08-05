"use client";

import { useState, useEffect } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Calendar as CalendarIcon, Link as LinkIcon, 
  CheckCircle2, Circle, MoreVertical, Pencil, Trash2, Check 
} from "lucide-react";
import { 
  PlannerEvent, getPlannerEvents, deletePlannerEvent, togglePlannerEventStatus 
} from "@/features/planner/services/planner.service";
import { CreateEventDialog } from "./create-event-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function PlannerWorkspace() {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<PlannerEvent | null>(null);
  
  const isGoogleConnected = true; // Synced status indicator

  const fetchEvents = async () => {
    try {
      const data = await getPlannerEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load planner events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getPlannerEvents().then((data) => {
      if (isMounted) {
        setEvents(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Optimistic Status Toggle
  const handleToggleStatus = async (event: PlannerEvent) => {
    if (!event.id) return;
    const previousStatus = event.status;
    const newStatus = previousStatus === "completed" ? "pending" : "completed";

    // Optimistic state update
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e))
    );

    try {
      await togglePlannerEventStatus(event.id, previousStatus);
      if (newStatus === "completed") {
        toast.success(`"${event.title}" marked as completed! +15 XP`);
      } else {
        toast.info(`"${event.title}" marked as pending`);
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: previousStatus } : e))
      );
      toast.error("Failed to update event status");
    }
  };

  // Handle Delete Confirmation & Optimistic UI
  const handleDeleteConfirm = async () => {
    if (!deletingEvent || !deletingEvent.id) return;
    const targetEvent = deletingEvent;
    const eventId = deletingEvent.id;

    // Optimistic removal
    setEvents((prev) => prev.filter((e) => e.id !== eventId));

    try {
      await deletePlannerEvent(eventId, targetEvent.google_event_id);
      toast.success(`"${targetEvent.title}" deleted`);
      setDeletingEvent(null);
    } catch (err) {
      console.error(err);
      // Revert on error & refresh
      fetchEvents();
      toast.error("Failed to delete study event");
    }
  };

  const today = new Date();

  // Group events by date (agenda view)
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(parseISO(event.start_time), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, PlannerEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto py-8 px-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Study Planner</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Schedule your prep, syncs automatically.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isGoogleConnected ? (
            <Button variant="outline" className="hidden sm:flex border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 bg-blue-500/5">
              <LinkIcon className="w-4 h-4 mr-2" /> Connect Google Calendar
            </Button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Calendar Synced
            </div>
          )}

          <Button 
            onClick={() => {
              setEditingEvent(null);
              setIsCreateOpen(true);
            }}
            className="rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> New Event
          </Button>
        </div>
      </div>

      {/* Main Content (Agenda View) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {isLoading ? (
          <div className="space-y-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-4 p-4 rounded-2xl border border-glass-border bg-glass">
                      <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                      <div className="flex flex-col items-center justify-center min-w-[75px] pr-4 border-r border-border/50">
                        <Skeleton className="h-4 w-10 mb-1" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/50 rounded-3xl bg-surface/30">
            <div className="w-16 h-16 rounded-full bg-surface border border-glass-border flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your planner is empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Create your first study session or revision reminder to stay on track.
            </p>
            <Button 
              onClick={() => {
                setEditingEvent(null);
                setIsCreateOpen(true);
              }} 
              variant="outline"
            >
              Schedule your first session
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <AnimatePresence>
              {sortedDates.map((dateString, idx) => {
                const dateObj = parseISO(dateString);
                const isToday = isSameDay(dateObj, today);
                const dayEvents = groupedEvents[dateString];

                return (
                  <motion.div 
                    key={dateString}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {isToday ? "Today" : format(dateObj, "EEEE, MMMM d")}
                      </h2>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {dayEvents.map((event) => {
                        const isCompleted = event.status === "completed";

                        return (
                          <div 
                            key={event.id}
                            className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                              isCompleted 
                                ? "border-glass-border/40 bg-surface/40 opacity-75" 
                                : "border-glass-border bg-surface hover:bg-surface-hover hover:border-border"
                            }`}
                          >
                            {/* Complete Toggle Checkbox */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(event)}
                              className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                isCompleted 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : "border-muted-foreground/40 hover:border-primary text-transparent"
                              }`}
                              title={isCompleted ? "Mark as pending" : "Mark as completed"}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            {/* Time Slot */}
                            <div className="flex flex-col items-center justify-center min-w-[75px] pr-4 border-r border-border/50">
                              <span className="text-sm font-semibold">{format(parseISO(event.start_time), "HH:mm")}</span>
                              <span className="text-xs text-muted-foreground">{format(parseISO(event.end_time), "HH:mm")}</span>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                              <h3 className={`font-semibold text-foreground transition-colors line-clamp-1 ${
                                isCompleted ? "line-through text-muted-foreground" : "group-hover:text-primary"
                              }`}>
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                                <span className="px-2 py-0.5 rounded-full border border-border/50 bg-background uppercase tracking-wider text-[10px]">
                                  {event.event_type}
                                </span>
                                {event.google_event_id && (
                                  <span className="flex items-center gap-1 text-emerald-500/80 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Synced
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Menu Dropdown (⋮) */}
                            <div className="shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8 rounded-lg opacity-80 group-hover:opacity-100 hover:bg-surface-hover"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 bg-background border-glass-border">
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleStatus(event)}
                                    className="cursor-pointer gap-2"
                                  >
                                    {isCompleted ? (
                                      <>
                                        <Circle className="w-4 h-4 text-muted-foreground" />
                                        <span>Mark as Pending</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Mark as Complete</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setIsCreateOpen(true);
                                    }}
                                    className="cursor-pointer gap-2"
                                  >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                    <span>Edit Event</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setDeletingEvent(event)}
                                    className="cursor-pointer gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Event</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create & Edit Modal */}
      <CreateEventDialog 
        isOpen={isCreateOpen} 
        initialEvent={editingEvent}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingEvent(null);
        }} 
        onSuccess={fetchEvents}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={!!deletingEvent}
        event={deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
