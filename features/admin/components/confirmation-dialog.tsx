"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#111] border-white/[0.08]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div>
              <DialogTitle className="text-white">{title}</DialogTitle>
              <DialogDescription className="mt-1.5 text-zinc-400">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-white/[0.08] text-zinc-400 hover:text-white"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={isDestructive ? "" : "bg-amber-500 hover:bg-amber-600 text-black font-medium"}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
