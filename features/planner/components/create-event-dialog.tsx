"use client";

import { useState } from "react";
import { format, addHours, parseISO, differenceInHours } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock, Link as LinkIcon } from "lucide-react";
import { createPlannerEvent, updatePlannerEvent, EventType, PlannerEvent } from "@/features/planner/services/planner.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEvent?: PlannerEvent | null;
  defaultDate?: Date;
  defaultChapterId?: string;
  defaultSubjectId?: string;
}

const EVENT_TYPES: EventType[] = [
  "Study Session", 
  "Revision Session", 
  "Formula Review", 
  "PYQ Practice", 
  "Mock Test", 
  "Custom Task"
];

export function CreateEventDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialEvent = null,
  defaultDate, 
  defaultChapterId, 
  defaultSubjectId 
}: CreateEventDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CreateEventFormContent
        key={initialEvent?.id || "new-event"}
        onClose={onClose}
        onSuccess={onSuccess}
        initialEvent={initialEvent}
        defaultDate={defaultDate}
        defaultChapterId={defaultChapterId}
        defaultSubjectId={defaultSubjectId}
      />
    </Dialog>
  );
}

interface CreateEventFormContentProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialEvent?: PlannerEvent | null;
  defaultDate?: Date;
  defaultChapterId?: string;
  defaultSubjectId?: string;
}

function CreateEventFormContent({
  onClose,
  onSuccess,
  initialEvent,
  defaultDate,
  defaultChapterId,
  defaultSubjectId,
}: CreateEventFormContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state directly from initialEvent or defaults (No useEffect needed!)
  const [title, setTitle] = useState(() => initialEvent?.title || "");
  const [eventType, setEventType] = useState<EventType>(() => initialEvent?.event_type || "Study Session");
  
  const [date, setDate] = useState(() => {
    if (initialEvent?.start_time) {
      return format(parseISO(initialEvent.start_time), "yyyy-MM-dd");
    }
    return format(defaultDate || new Date(), "yyyy-MM-dd");
  });

  const [time, setTime] = useState(() => {
    if (initialEvent?.start_time) {
      return format(parseISO(initialEvent.start_time), "HH:mm");
    }
    return format(defaultDate || new Date(), "HH:mm");
  });

  const [durationHours, setDurationHours] = useState(() => {
    if (initialEvent?.start_time && initialEvent?.end_time) {
      const startDate = parseISO(initialEvent.start_time);
      const endDate = parseISO(initialEvent.end_time);
      return Math.max(1, differenceInHours(endDate, startDate));
    }
    return 2;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    // Construct start and end times
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = addHours(startDateTime, durationHours);

    try {
      if (initialEvent && initialEvent.id) {
        await updatePlannerEvent({
          ...initialEvent,
          title: title.trim(),
          event_type: eventType,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        });
        toast.success("Study session updated successfully");
      } else {
        await createPlannerEvent({
          title: title.trim(),
          event_type: eventType,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          chapter_id: defaultChapterId,
          subject_id: defaultSubjectId,
          status: "pending"
        });
        toast.success("Study session scheduled");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(initialEvent ? "Failed to update session" : "Failed to schedule session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-background border-glass-border">
      <DialogHeader>
        <DialogTitle className="text-xl">
          {initialEvent ? "Edit Session" : "Schedule Session"}
        </DialogTitle>
        <DialogDescription>
          {initialEvent 
            ? "Make changes to your scheduled study session." 
            : "Plan your study time. This will sync to Google Calendar if connected."}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Session Title
            </label>
            <Input 
              autoFocus
              placeholder="e.g. Mechanics Deep Dive" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-border/50"
              required
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  className={`h-9 justify-start text-xs font-medium ${eventType === type ? "border-primary text-primary bg-primary/5" : "bg-surface border-border/50"}`}
                  onClick={() => setEventType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> Date
              </label>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface border-border/50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Start Time
              </label>
              <Input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-surface border-border/50"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Duration (Hours)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((hours) => (
                <Button
                  key={hours}
                  type="button"
                  variant="outline"
                  className={`flex-1 h-8 text-xs ${durationHours === hours ? "border-primary text-primary bg-primary/5" : "bg-surface border-border/50"}`}
                  onClick={() => setDurationHours(hours)}
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </div>

        </div>

        <DialogFooter className="border-t border-border/50 pt-4 mt-6">
          <div className="flex w-full justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" /> Auto-sync enabled
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !title.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialEvent ? "Save Changes" : "Schedule"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
