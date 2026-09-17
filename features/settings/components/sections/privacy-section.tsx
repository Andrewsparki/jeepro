"use client";

import { ShieldCheck, Download, Trash2, RotateCcw, Cloud, LogOut, AlertTriangle } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialog } from "@/providers/dialog-provider";
import { cn } from "@/lib/utils";

import { useSettings } from "@/providers/settings-provider";

export function PrivacySection() {
  const router = useRouter();
  const supabase = createClient();
  const { confirm } = useDialog();
  const { playSound } = useSettings();

  return (
    <div id="privacy" className="flex flex-col gap-6">
      {/* Primary Data Management Card */}
      <GlassSection
        title="Privacy & Data Control"
        icon={ShieldCheck}
        badge="Security"
        description="Download your complete performance archives, inspect telemetry, or trigger cloud sync."
      >
        {/* Export Data Archive */}
        <SettingRow
          title="Export Data Archive"
          description="Download an offline JSON bundle containing all your progress, sessions, and bookmarks."
          icon={Download}
          iconGradient="from-sky-500 to-blue-600"
        >
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:border-white/15 dark:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer select-none"
            onClick={async () => {
              try {
                toast("Preparing export package...");
                const { data: progress } = await supabase.from("user_topic_progress").select("*");
                const { data: sessions } = await supabase.from("study_sessions").select("*");
                const data = {
                  version: "1.0",
                  exported_at: new Date().toISOString(),
                  user_topic_progress: progress || [],
                  study_sessions: sessions || [],
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `jee_pro_backup_${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                playSound("success");
                toast.success("Archive exported successfully!");
              } catch {
                toast.error("Failed to export data archive.");
              }
            }}
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground dark:text-zinc-300" />
            <span>Export JSON</span>
          </button>
        </SettingRow>

        {/* Cloud Sync Now */}
        <SettingRow
          title="Cloud Backup Sync"
          description="Force synchronize any queued offline progress directly to the Supabase database."
          icon={Cloud}
          iconGradient="from-emerald-500 to-teal-600"
          isLast
        >
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:border-white/15 dark:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer select-none"
            onClick={() => {
              playSound("success");
              toast.success("Cloud database synchronized!");
            }}
          >
            <Cloud className="w-3.5 h-3.5 text-muted-foreground dark:text-zinc-300" />
            <span>Sync Now</span>
          </button>
        </SettingRow>
      </GlassSection>

      {/* Apple Danger Zone Card with Crimson Frosted Glass */}
      <section
        className={cn(
          "relative rounded-3xl sm:rounded-[2rem] p-6 sm:p-8",
          "bg-rose-500/5 dark:bg-rose-950/15 backdrop-blur-3xl border border-rose-500/20",
          "shadow-soft dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(244,63,94,0.15)]",
          "overflow-hidden transition-all duration-300",
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-rose-400/30 before:to-transparent before:pointer-events-none"
        )}
      >
        {/* Ambient Crimson Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-rose-500/15">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground dark:text-white">
                  Danger Zone
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  Irreversible
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400 font-normal leading-relaxed">
                Actions here permanently modify or erase stored cloud records and local sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2 flex flex-col">
          {/* Reset Progress */}
          <SettingRow
            title="Reset Topic Mastery"
            description="Permanently delete all chapter XP, mastery ratings, and completed question checks."
            icon={RotateCcw}
            iconGradient="from-amber-600 to-red-600"
          >
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15 bg-rose-500/10 text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer select-none"
              onClick={async () => {
                playSound("danger");
                const isConfirmed = await confirm({
                  title: "Reset Progress?",
                  message: "Are you sure you want to reset all topic progress? This action cannot be undone.",
                  variant: "destructive",
                  confirmLabel: "Reset Progress",
                });
                if (isConfirmed) {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { error } = await supabase.from("user_topic_progress").delete().eq("user_id", user.id);
                    if (error) {
                      toast.error("Failed to reset progress.");
                    } else {
                      toast.success("All progress reset successfully.");
                      router.refresh();
                    }
                  }
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </SettingRow>

          {/* Delete Sessions */}
          <SettingRow
            title="Clear Study Sessions"
            description="Purge all logged study durations, timeline intervals, and focus history."
            icon={Trash2}
            iconGradient="from-red-600 to-rose-700"
          >
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15 bg-rose-500/10 text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer select-none"
              onClick={async () => {
                playSound("danger");
                const isConfirmed = await confirm({
                  title: "Delete All Sessions?",
                  message: "Are you sure you want to delete all recorded study sessions? This action cannot be undone.",
                  variant: "destructive",
                  confirmLabel: "Clear Sessions",
                });
                if (isConfirmed) {
                  const { data: { user } } = await supabase.auth.getUser();
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
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </SettingRow>

          {/* Sign Out Device */}
          <SettingRow
            title="Sign Out of Device"
            description="Deauthorize current session and remove secure cached credentials."
            icon={LogOut}
            iconGradient="from-zinc-600 to-zinc-800"
            isLast
          >
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-foreground dark:border-white/15 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer select-none"
              onClick={async () => {
                playSound("click");
                const isConfirmed = await confirm({
                  title: "Sign Out?",
                  message: "Are you sure you want to log out of your JEE PRO account on this device?",
                  variant: "default",
                  confirmLabel: "Sign Out",
                });
                if (isConfirmed) {
                  toast("Signing out...");
                  await supabase.auth.signOut();
                  router.push("/login");
                }
              }}
            >
              <LogOut className="w-3.5 h-3.5 text-muted-foreground dark:text-zinc-300" />
              <span>Sign Out</span>
            </button>
          </SettingRow>
        </div>
      </section>
    </div>
  );
}
