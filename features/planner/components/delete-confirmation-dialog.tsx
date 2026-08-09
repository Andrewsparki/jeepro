"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlannerEvent } from "@/features/planner/services/planner.service";

import { Modal } from "@/components/ui/modal";

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

  return (
    <Modal
      isOpen={isOpen && Boolean(event)}
      onClose={() => !isDeleting && onClose()}
      closeOnOutsideClick={!isDeleting}
      className="max-w-[400px] p-6 sm:p-8"
    >
      {event && (
        <>
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Delete Study Session?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{event.title}&quot;</span>? 
            {event.google_event_id && " This will also remove the synced event from Google Calendar."}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
        </>
      )}
    </Modal>
  );
}
