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
  ShieldAlert,
  AlertTriangle,
  VolumeX,
  Volume2,
  Ban,
  ExternalLink,
  History,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ChatSender } from "../types/chat.types";
import {
  adminWarnChatUser,
  adminMuteChatUser,
  adminBanChatUser,
  adminGetUserModerationSummary,
  AdminUserModerationSummary,
} from "@/features/admin/services/admin-chat-actions";
import Link from "next/link";

interface AdminUserModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: ChatSender | null;
  targetMessageId?: string;
  onUserStatusChanged?: () => void;
}

export function AdminUserModerationModal({
  isOpen,
  onClose,
  targetUser,
  onUserStatusChanged,
}: AdminUserModerationModalProps) {
  const [activeTab, setActiveTab] = useState<"actions" | "history">("actions");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<AdminUserModerationSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleDialogOpenChange = async (open: boolean) => {
    if (open && targetUser?.id) {
      setReason("");
      setDetails("");
      setIsLoadingSummary(true);

      const res = await adminGetUserModerationSummary(targetUser.id);
      setIsLoadingSummary(false);

      if (res.success && res.data) {
        setSummary(res.data);
      }
    } else if (!open) {
      setSummary(null);
      onClose();
    }
  };

  if (!targetUser) return null;

  const refreshSummary = async () => {
    if (targetUser?.id) {
      const res = await adminGetUserModerationSummary(targetUser.id);
      if (res.success && res.data) {
        setSummary(res.data);
      }
    }
  };

  const handleWarn = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the warning.");
      return;
    }
    setIsSubmitting(true);
    const res = await adminWarnChatUser(targetUser.id, reason, details);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Warning issued to ${targetUser.full_name || "user"}.`);
      setReason("");
      setDetails("");
      await refreshSummary();
      onUserStatusChanged?.();
    } else {
      toast.error(res.error || "Failed to issue warning.");
    }
  };

  const handleToggleMute = async (currentMuted: boolean) => {
    setIsSubmitting(true);
    const newMuteState = !currentMuted;
    const res = await adminMuteChatUser(targetUser.id, newMuteState, reason);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        newMuteState
          ? `Muted ${targetUser.full_name || "user"} from Global Chat.`
          : `Unmuted ${targetUser.full_name || "user"}.`
      );
      setReason("");
      setDetails("");
      await refreshSummary();
      onUserStatusChanged?.();
    } else {
      toast.error(res.error || "Failed to update mute status.");
    }
  };

  const handleToggleBan = async (currentBanned: boolean) => {
    setIsSubmitting(true);
    const newBanState = !currentBanned;
    const res = await adminBanChatUser(targetUser.id, newBanState, reason);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        newBanState
          ? `Restricted / Banned ${targetUser.full_name || "user"}.`
          : `Lifted restriction for ${targetUser.full_name || "user"}.`
      );
      setReason("");
      setDetails("");
      await refreshSummary();
      onUserStatusChanged?.();
    } else {
      toast.error(res.error || "Failed to update ban status.");
    }
  };

  const isMuted = summary?.profile?.is_muted ?? false;
  const isBanned = summary?.profile?.is_banned ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/15 border border-destructive/25 text-destructive flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                User Moderation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Admin controls for {targetUser.full_name || "JEE Aspirant"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* User Quick Info Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border/40 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center overflow-hidden border border-border/40">
              {targetUser.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={targetUser.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (targetUser.full_name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{targetUser.full_name || "JEE Aspirant"}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">{targetUser.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isMuted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <VolumeX className="w-3 h-3" /> Muted
              </span>
            )}
            {isBanned && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-1">
                <Ban className="w-3 h-3" /> Banned
              </span>
            )}
            {!isMuted && !isBanned && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Active
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "actions"
                ? "bg-accent/15 text-accent border border-accent/25"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Moderation Actions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "history"
                ? "bg-accent/15 text-accent border border-accent/25"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <History className="w-3.5 h-3.5" />
            Moderation History
          </button>
        </div>

        {activeTab === "actions" ? (
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Action Reason / Note (Persisted & Audited)
              </label>
              <Input
                placeholder="e.g. Inappropriate language in global chat..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-xs rounded-xl bg-surface/50 border-border/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Additional Details (Optional)</label>
              <textarea
                placeholder="Specific context, message quotes, or resolution note..."
                value={details}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                rows={2}
                className="w-full text-xs rounded-xl bg-surface/50 border border-border/40 p-2.5 outline-none focus:ring-1 focus:ring-accent text-foreground resize-none"
              />
            </div>

            {/* Quick Action Controls Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="justify-start gap-2 text-xs rounded-xl border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                onClick={handleWarn}
                disabled={isSubmitting}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Issue Warning
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`justify-start gap-2 text-xs rounded-xl border-border/40 ${isMuted ? "hover:bg-emerald-500/10 text-emerald-400" : "hover:bg-amber-500/10 text-amber-400"
                  }`}
                onClick={() => handleToggleMute(isMuted)}
                disabled={isSubmitting}
              >
                {isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {isMuted ? "Unmute User" : "Mute Chat"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`justify-start gap-2 text-xs rounded-xl border-border/40 ${isBanned ? "hover:bg-emerald-500/10 text-emerald-400" : "hover:bg-destructive/10 text-destructive"
                  }`}
                onClick={() => handleToggleBan(isBanned)}
                disabled={isSubmitting}
              >
                {isBanned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                {isBanned ? "Lift Ban" : "Ban User"}
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
                className="justify-start gap-2 text-xs rounded-xl border-border/40 text-muted-foreground hover:text-foreground"
              >
                <Link href={`/admin/users/${targetUser.id}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Admin Profile
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {isLoadingSummary ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading moderation summary...</div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface/40 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Messages</span>
                    <span className="text-base font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-accent" />
                      {summary.messagesCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface/40 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Reports Filed</span>
                    <span className="text-base font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      {summary.reportsCount}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Recent Admin Audit Log
                  </span>
                  {summary.auditEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">No audit log records for this user.</p>
                  ) : (
                    summary.auditEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-2 rounded-xl bg-surface/30 border border-border/30 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-mono text-accent font-semibold">{event.action}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {event.metadata && (
                          <p className="text-[11px] text-foreground/80 line-clamp-1">
                            {String(event.metadata.reason || event.metadata.details || "No details specified")}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Failed to load history.</p>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-border/40">
          <Button type="button" variant="ghost" className="text-xs rounded-xl" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
