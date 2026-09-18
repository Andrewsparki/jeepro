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
import { motion, useReducedMotion } from "framer-motion";
import { playHapticSound } from "@/lib/sound-effects";

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
  const shouldReduceMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-[#111111]/95 border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-start gap-3.5">
            {isDestructive && (
              <motion.div
                initial={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              >
                {!shouldReduceMotion && (
                  <span className="absolute inset-0 rounded-xl bg-rose-500/20 animate-ping opacity-50" />
                )}
                <AlertTriangle className="w-5 h-5 text-rose-400 relative z-10" />
              </motion.div>
            )}
            <div>
              <DialogTitle className="text-white text-base font-semibold tracking-tight">{title}</DialogTitle>
              <DialogDescription className="mt-1.5 text-zinc-400 text-xs leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-5 gap-2 sm:gap-2">
          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                playHapticSound("click");
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="w-full border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {cancelLabel}
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button
              variant={isDestructive ? "destructive" : "default"}
              onClick={() => {
                if (isDestructive) {
                  playHapticSound("danger");
                } else {
                  playHapticSound("click");
                }
                onConfirm();
              }}
              disabled={isLoading}
              className={
                isDestructive
                  ? "w-full shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                  : "w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              }
            >
              {isLoading ? "Executing..." : confirmLabel}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
