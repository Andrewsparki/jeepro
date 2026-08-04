"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlannerEvent } from "@/features/planner/services/planner.service";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  event: PlannerEvent | null;
}

export function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, event }: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-background border-glass-border">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <DialogTitle className="text-lg font-semibold">Delete Study Session?</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{event.title}&quot;</span>? 
            {event.google_event_id && " This will also remove the synced event from Google Calendar."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-t border-border/50 pt-4 mt-4">
          <div className="flex gap-2 justify-end w-full">
            <Button type="button" variant="ghost" disabled={isDeleting} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Event
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
