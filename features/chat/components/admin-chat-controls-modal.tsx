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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Shield,
  Power,
  Trash2,
  FileText,
  Activity,
} from "lucide-react";
import { ChatSystemStatus } from "../types/chat.types";
import {
  adminToggleGlobalChat,
  adminPurgeGlobalChatMessages,
} from "@/features/admin/services/admin-chat-actions";
import Link from "next/link";

interface AdminChatControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatStatus: ChatSystemStatus;
  onChatStatusChanged?: () => void;
}

export function AdminChatControlsModal({
  isOpen,
  onClose,
  chatStatus,
  onChatStatusChanged,
}: AdminChatControlsModalProps) {
  const [disabledReason, setDisabledReason] = useState(chatStatus.disabled_reason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setDisabledReason(chatStatus.disabled_reason || "");
      setConfirmPurge(false);
    }

    if (!open) {
      onClose();
    }
  };

  const handleToggleStatus = async (enable: boolean) => {
    if (!enable && !disabledReason.trim()) {
      toast.error("Please provide a reason for pausing Global Chat.");
      return;
    }
    setIsSubmitting(true);
    const res = await adminToggleGlobalChat(enable, disabledReason);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(enable ? "Global Chat enabled." : "Global Chat paused.");
      onChatStatusChanged?.();
      onClose();
    } else {
      toast.error(res.error || "Failed to update chat status.");
    }
  };

  const handlePurgeMessages = async () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }

    setIsSubmitting(true);
    const res = await adminPurgeGlobalChatMessages();
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Global Chat messages cleared.");
      onChatStatusChanged?.();
      onClose();
    } else {
      toast.error(res.error || "Failed to purge messages.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Chat System Controls
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Administrator system-wide moderation & controls
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Pause Reason Input (Always available when enabling/disabling or setting reason) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Reason for pausing Global Chat</span>
              {!chatStatus.enabled && (
                <span className="text-[10px] text-amber-400 font-normal">Active Pause Reason</span>
              )}
            </label>
            <Input
              placeholder="e.g. Scheduled maintenance in progress or moderating high volume..."
              value={disabledReason}
              onChange={(e) => setDisabledReason(e.target.value)}
              className="text-xs rounded-xl bg-surface/50 border-border/40"
            />
          </div>

          {/* Current System Status Banner */}
          <div className="p-3 rounded-xl border bg-surface/50 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {chatStatus.enabled ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                )}
              </span>
              <span className="font-semibold text-foreground">
                Status: {chatStatus.enabled ? "Active / Enabled" : "Paused / Maintenance"}
              </span>
            </div>

            <Button
              type="button"
              variant={chatStatus.enabled ? "destructive" : "default"}
              size="sm"
              className="h-7 text-[11px] rounded-lg gap-1.5 px-3"
              onClick={() => handleToggleStatus(!chatStatus.enabled)}
              disabled={isSubmitting || (chatStatus.enabled && !disabledReason.trim())}
              title={chatStatus.enabled && !disabledReason.trim() ? "Please enter a reason before pausing chat" : undefined}
            >
              <Power className="w-3 h-3" />
              {chatStatus.enabled ? "Pause Chat" : "Enable Chat"}
            </Button>
          </div>

          {/* Danger Zone: Purge Messages */}
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat Stream
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-[11px] rounded-lg"
                onClick={handlePurgeMessages}
                disabled={isSubmitting}
              >
                {confirmPurge ? "Confirm Clear All" : "Clear Messages"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Soft-deletes all active messages from the live Global Chat feed. Action is recorded in audit logs.
            </p>
          </div>

          {/* Admin Centre Links */}
          <div className="pt-2 border-t border-border/40 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Admin Centre Navigation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                asChild
                className="justify-start gap-2 text-xs rounded-xl border-border/40 text-muted-foreground hover:text-foreground"
              >
                <Link href="/admin/reports" target="_blank">
                  <FileText className="w-3.5 h-3.5 text-warning" />
                  Chat Reports
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="justify-start gap-2 text-xs rounded-xl border-border/40 text-muted-foreground hover:text-foreground"
              >
                <Link href="/admin/audit-log" target="_blank">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  Audit Logs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/40">
          <Button type="button" variant="ghost" className="text-xs rounded-xl" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
