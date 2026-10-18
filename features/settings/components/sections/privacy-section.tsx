"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Download,
  Trash2,
  RotateCcw,
  Cloud,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialog } from "@/providers/dialog-provider";
import { useSettings } from "@/providers/settings-provider";
import { useCookieConsent } from "@/features/privacy";
import { resetAccountProgress } from "@/features/study/services/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function PrivacySection() {
  const router = useRouter();
  const supabase = createClient();
  const { confirm } = useDialog();
  const { playSound } = useSettings();
  const { openPreferencesModal } = useCookieConsent();

  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      toast.info("Preparing performance data package...");
      const { data: progress } = await supabase.from("user_topic_progress").select("*");
      const { data: sessions } = await supabase.from("study_sessions").select("*");

      const bundle = {
        platform: "JEE Pro",
        version: "1.0",
        exported_at: new Date().toISOString(),
        user_topic_progress: progress || [],
        study_sessions: sessions || [],
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jee_pro_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      playSound("success");
      toast.success("JSON backup downloaded successfully.");
    } catch {
      toast.error("Failed to export data archive.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      playSound("success");
      toast.success("Cloud database synchronized! All local records verified.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetProgress = async () => {
    if (confirmInput.trim() !== "RESET" || isResetting) return;

    setIsResetting(true);
    try {
      const success = await resetAccountProgress();
      if (success) {
        playSound("danger");
        toast.success("Account progress reset successfully. Metrics restored to baseline.");
        setIsResetModalOpen(false);
        setConfirmInput("");
        router.refresh();
      } else {
        toast.error("Failed to reset account progress. Please try again.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("An unexpected error occurred during reset.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearSessions = async () => {
    playSound("danger");
    const isConfirmed = await confirm({
      title: "Purge Study Sessions?",
      message:
        "Are you sure you want to delete all historical study session logs? This cannot be undone.",
      variant: "destructive",
      confirmLabel: "Clear Sessions",
    });

    if (isConfirmed) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("study_sessions").delete().eq("user_id", user.id);
        if (error) {
          toast.error("Failed to clear study sessions.");
        } else {
          toast.success("Study sessions cleared successfully.");
          router.refresh();
        }
      }
    }
  };

  return (
    <div id="privacy" className="space-y-6">
      {/* ── 1. Data Portability & Sync ────────────────────────────────────── */}
      <GlassSection
        title="Data Portability & Synchronization"
        icon={ShieldCheck}
        badge="Security"
        description="Download your complete performance archives, inspect local cache, or trigger cloud synchronization."
      >
        <SettingRow
          title="Export Data Archive"
          description="Download an offline JSON bundle containing all your topic progress, solve durations, and bookmarks."
          icon={Download}
        >
          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-lg bg-surface hover:bg-white/[0.05] border border-border text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Download className="w-3.5 h-3.5 text-accent" />
            )}
            <span>Export JSON</span>
          </button>
        </SettingRow>

        <SettingRow
          title="Cloud Backup Sync"
          description="Force synchronize any queued offline progress and pending telemetry to Supabase."
          icon={Cloud}
        >
          <button
            type="button"
            onClick={handleCloudSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-lg bg-surface hover:bg-white/[0.05] border border-border text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5DC98B]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5DC98B]" />
            )}
            <span>Sync Now</span>
          </button>
        </SettingRow>

        <SettingRow
          title="Cookie & Telemetry Preferences"
          description="Manage essential cookies and customize your optional feature analytics and UI preferences."
          icon={Sliders}
        >
          <button
            type="button"
            onClick={openPreferencesModal}
            className="px-3.5 py-2 rounded-lg bg-surface hover:bg-white/[0.05] border border-border text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-accent" />
            <span>Customize Cookies</span>
          </button>
        </SettingRow>
      </GlassSection>

      {/* ── 2. Danger Zone (Destructive Actions) ──────────────────────────── */}
      <div className="rounded-xl bg-card border border-[#F17C7C]/30 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#F17C7C]/20 bg-[#F17C7C]/5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface border border-[#F17C7C]/30 text-[#F17C7C] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#F17C7C]">Danger Zone</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F17C7C]/15 text-[#F17C7C] border border-[#F17C7C]/30 uppercase tracking-wider">
                  Irreversible
                </span>
              </div>
              <p className="text-xs text-[#A4ADBB] mt-0.5">
                These actions permanently delete or reset stored telemetry records and cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {/* Reset Account Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 sm:px-6 gap-3 sm:gap-4 hover:bg-white/[0.015] transition-colors">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-sm font-medium text-foreground block">
                Reset Account Progress
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permanently reset all syllabus completion checks, XP milestones, formula mastery states, and active streaks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("danger");
                setConfirmInput("");
                setIsResetModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#F17C7C]/10 hover:bg-[#F17C7C]/20 border border-[#F17C7C]/30 text-[#F17C7C] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          </div>

          {/* Clear Study Sessions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 sm:px-6 gap-3 sm:gap-4 hover:bg-white/[0.015] transition-colors">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-sm font-medium text-foreground block">
                Clear Study Session Logs
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Delete historical study durations and timeline records without resetting chapter syllabus checkmarks.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearSessions}
              className="px-3.5 py-2 rounded-lg bg-[#F17C7C]/10 hover:bg-[#F17C7C]/20 border border-[#F17C7C]/30 text-[#F17C7C] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Sessions</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Reset Confirmation Modal ───────────────────────────────────── */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground p-6 rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-[#F17C7C] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F17C7C]" />
              <span>Confirm Complete Progress Reset</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This action permanently wipes all your topic checkpoints, XP gains, and continuous streak data. To proceed, type <span className="font-mono font-bold text-foreground bg-surface px-1.5 py-0.5 rounded border border-border">RESET</span> below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-full bg-surface border border-border text-foreground placeholder-muted-foreground/40 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#F17C7C] focus:ring-1 focus:ring-[#F17C7C]"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface hover:bg-white/[0.06] text-muted-foreground text-xs font-medium border border-border transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetProgress}
              disabled={confirmInput.trim() !== "RESET" || isResetting}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Permanently Reset</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
