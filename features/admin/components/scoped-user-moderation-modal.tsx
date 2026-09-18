"use client";

import React, { useState, useEffect } from "react";
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
  MessageSquare,
  MessageCircle,
  Users,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
} from "lucide-react";
import {
  adminGetUserScopedModeration,
  adminUpdateScopedModeration,
  UserScopedModerationSummary,
  ModerationScope,
  ModerationStatus,
} from "@/features/admin/services/admin-moderation.service";
import { playHapticSound } from "@/lib/sound-effects";

interface ScopedUserModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    full_name: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  onStatusChanged?: () => void;
}

const SCOPE_CONFIG: Record<
  ModerationScope,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    actions: { status: ModerationStatus; label: string; isDestructive?: boolean }[];
  }
> = {
  global_chat: {
    title: "Global Chat",
    description: "Mute or ban user from posting in public student chat stream",
    icon: MessageSquare,
    actions: [
      { status: "muted", label: "Mute Chat" },
      { status: "banned", label: "Ban Chat", isDestructive: true },
    ],
  },
  direct_messages: {
    title: "Direct Messages",
    description: "Restrict user from sending 1-on-1 messages to other students",
    icon: MessageCircle,
    actions: [
      { status: "restricted", label: "Restrict DMs" },
      { status: "banned", label: "Ban DMs", isDestructive: true },
    ],
  },
  study_groups: {
    title: "Study Groups",
    description: "Remove or block user from participating in collaborative study groups",
    icon: Users,
    actions: [
      { status: "restricted", label: "Restrict Groups" },
      { status: "banned", label: "Ban Groups", isDestructive: true },
    ],
  },
  platform_access: {
    title: "Platform Access",
    description: "Suspend student account and block total access to JEE Pro platform",
    icon: Lock,
    actions: [{ status: "suspended", label: "Suspend Account", isDestructive: true }],
  },
};

export function ScopedUserModerationModal({
  isOpen,
  onClose,
  targetUser,
  onStatusChanged,
}: ScopedUserModerationModalProps) {
  const [activeTab, setActiveTab] = useState<"scopes" | "history">("scopes");
  const [selectedScope, setSelectedScope] = useState<ModerationScope>("global_chat");
  const [reason, setReason] = useState("");
  const [durationMins, setDurationMins] = useState<string>("0"); // "0" means permanent
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<UserScopedModerationSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (isOpen && targetUser?.id) {
      setReason("");
      setDurationMins("0");
      setIsLoadingSummary(true);
      adminGetUserScopedModeration(targetUser.id).then((res) => {
        setIsLoadingSummary(false);
        if (res.success && res.data) {
          setSummary(res.data);
        }
      });
    } else {
      setSummary(null);
    }
  }, [isOpen, targetUser]);

  if (!targetUser) return null;

  const refreshSummary = async () => {
    if (targetUser?.id) {
      const res = await adminGetUserScopedModeration(targetUser.id);
      if (res.success && res.data) {
        setSummary(res.data);
      }
    }
  };

  const handleApplyAction = async (targetStatus: ModerationStatus) => {
    if (targetStatus !== "active" && !reason.trim()) {
      toast.error("Please enter a reason for this moderation action.");
      return;
    }

    setIsSubmitting(true);
    playHapticSound("click");

    const dur = parseInt(durationMins, 10);
    const res = await adminUpdateScopedModeration(
      targetUser.id,
      selectedScope,
      targetStatus,
      reason,
      dur > 0 ? dur : null
    );

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        targetStatus === "active"
          ? `Restored ${SCOPE_CONFIG[selectedScope].title} access for ${targetUser.full_name || "user"}.`
          : `Applied ${targetStatus.toUpperCase()} on ${SCOPE_CONFIG[selectedScope].title}.`
      );
      setReason("");
      setDurationMins("0");
      await refreshSummary();
      onStatusChanged?.();
    } else {
      toast.error(res.error || "Failed to update moderation status.");
    }
  };

  const currentScopeData = summary?.scopes[selectedScope];
  const isCurrentlyRestricted = currentScopeData && currentScopeData.status !== "active";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-[#0e0e0e]/95 border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-6 text-white">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Scoped User Moderation
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Granular permission controls for {targetUser.full_name || targetUser.email || "Student"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* User Badge Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
              {(targetUser.full_name || targetUser.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-zinc-200">{targetUser.full_name || "Student Account"}</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[180px]">{targetUser.id}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("scopes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "scopes"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Feature Scopes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit History
          </button>
        </div>

        {activeTab === "scopes" ? (
          <div className="space-y-4 py-1">
            {/* Scope Selection Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SCOPE_CONFIG) as ModerationScope[]).map((scopeKey) => {
                const cfg = SCOPE_CONFIG[scopeKey];
                const Icon = cfg.icon;
                const scopeData = summary?.scopes[scopeKey];
                const isRestricted = scopeData && scopeData.status !== "active";
                const isSelected = selectedScope === scopeKey;

                return (
                  <button
                    key={scopeKey}
                    type="button"
                    onClick={() => {
                      playHapticSound("click");
                      setSelectedScope(scopeKey);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-amber-500/40 bg-amber-500/10 text-white shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-zinc-500"}`} />
                      {isRestricted ? (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      )}
                    </div>
                    <p className="text-xs font-semibold mt-2 truncate">{cfg.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5 capitalize">
                      {scopeData?.status || "active"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Scope Banner & Form */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {SCOPE_CONFIG[selectedScope].title} Scope
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {SCOPE_CONFIG[selectedScope].description}
                  </p>
                </div>
                {isCurrentlyRestricted ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                    {currentScopeData?.status}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              {isCurrentlyRestricted && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                  <p className="text-rose-300 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Current Restriction: {currentScopeData?.status?.toUpperCase()}
                  </p>
                  {currentScopeData?.reason && (
                    <p className="text-zinc-400 text-[11px]">Reason: {currentScopeData.reason}</p>
                  )}
                  {currentScopeData?.expires_at ? (
                    <p className="text-zinc-400 text-[11px] font-mono">
                      Expires: {new Date(currentScopeData.expires_at).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-zinc-500 text-[11px] font-mono">Duration: Permanent until restored</p>
                  )}
                </div>
              )}

              {/* Action Form Inputs */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-zinc-300">Action Reason / Context</label>
                <Input
                  placeholder="e.g. Violation of community standards in study groups..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs rounded-xl border-white/[0.08] bg-black/40 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Restriction Duration</label>
                <select
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-black/40 text-xs text-white focus:outline-none focus:border-amber-500/40"
                >
                  <option value="0">Permanent (Until manually restored)</option>
                  <option value="60">1 Hour</option>
                  <option value="720">12 Hours</option>
                  <option value="1440">24 Hours (1 Day)</option>
                  <option value="10080">7 Days (1 Week)</option>
                  <option value="43200">30 Days (1 Month)</option>
                </select>
              </div>

              {/* Scope Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {isCurrentlyRestricted && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleApplyAction("active")}
                    disabled={isSubmitting}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs rounded-xl font-semibold gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Access
                  </Button>
                )}

                {SCOPE_CONFIG[selectedScope].actions.map((act) => (
                  <Button
                    key={act.status}
                    type="button"
                    variant="outline"
                    onClick={() => handleApplyAction(act.status)}
                    disabled={isSubmitting || currentScopeData?.status === act.status}
                    className={`text-xs rounded-xl font-semibold gap-1.5 ${
                      act.isDestructive
                        ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    {act.isDestructive ? <Lock className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {act.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {isLoadingSummary ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading audit history...</div>
            ) : summary?.auditEvents.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No moderation audit records found for this student.</p>
            ) : (
              summary?.auditEvents.map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-mono text-amber-400 font-semibold">{ev.action}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(ev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {ev.metadata && (
                    <p className="text-[11px] text-zinc-300 font-mono line-clamp-1">
                      {String(ev.metadata.reason || ev.metadata.scope || "No details specified")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-white/[0.06]">
          <Button
            type="button"
            variant="ghost"
            className="text-xs rounded-xl text-zinc-400 hover:text-white"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
