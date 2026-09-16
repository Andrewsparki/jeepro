"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";
import { ChatMessage } from "../types/chat.types";

interface ChatReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  onReportSubmit: (messageId: string, reason: string, details?: string) => Promise<boolean>;
}

const REPORT_REASONS = [
  "Inappropriate or offensive language",
  "Spam, botting, or commercial promotions",
  "Harassment, bullying, or intimidation",
  "Hate speech or personal attacks",
  "Cheating or exam integrity violation",
  "Other disruptive behavior",
];

export function ChatReportModal({
  isOpen,
  onClose,
  message,
  onReportSubmit,
}: ChatReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onReportSubmit(message.id, selectedReason, details);
      if (success) {
        setDetails("");
        setSelectedReason(REPORT_REASONS[0]);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-destructive mb-1">
            <ShieldAlert className="w-5 h-5" />
            <DialogTitle className="text-base font-semibold text-foreground">
              Report Message
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Help us keep JEE Pro a safe, respectful, and focused learning environment for all aspirants.
          </DialogDescription>
        </DialogHeader>

        {/* Quoted Message Preview */}
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground line-clamp-3 italic">
          &ldquo;{message.content}&rdquo;
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Why are you reporting this message?
            </Label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-border/30 hover:border-border/60 hover:bg-muted/20 cursor-pointer transition-colors text-xs text-foreground"
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-details" className="text-xs font-medium text-foreground">
              Additional Details (Optional)
            </Label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Provide extra context if helpful..."
              className="w-full text-xs rounded-lg bg-surface border border-border/40 p-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reporting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
