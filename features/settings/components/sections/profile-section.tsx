"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogIn, LogOut, CheckCircle2, ShieldCheck, Sparkles, CloudCheck } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfileSection() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    toast("Signing out...");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <section
      id="profile"
      className={cn(
        "relative rounded-3xl sm:rounded-[2rem] p-6 sm:p-8",
        "bg-card text-card-foreground border border-border/70 shadow-soft",
        "dark:bg-[#0d121c]/45 dark:border-white/[0.12] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)]",
        "overflow-hidden transition-all duration-300",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border dark:before:via-white/30 before:to-transparent before:pointer-events-none"
      )}
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Profile Card Header / Apple ID Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60 dark:border-white/[0.08]">
          <div className="flex items-center gap-4">
            {/* Apple Squircle Avatar */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-100 dark:bg-[#0c1018]/80 backdrop-blur-md flex items-center justify-center text-foreground dark:text-white font-bold text-xl sm:text-2xl tracking-tight border border-border dark:border-white/20">
                  {user ? userInitial : <User className="w-7 h-7 text-muted-foreground dark:text-white/80" />}
                </div>
              </div>
              {user && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card dark:border-[#0d121c] flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white truncate">
                  {user ? displayName : "Guest Aspirant"}
                </h3>
                {user ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>PRO Member</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                    Offline Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal truncate">
                {user ? user.email : "Sign in to sync your study progress, formulas, and history."}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full sm:w-auto px-5 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white dark:border-white/15 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-muted-foreground dark:text-zinc-300" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-foreground text-background font-semibold text-xs sm:text-sm transition-all hover:bg-foreground/90 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-background" />
                <span>Sign In to Account</span>
              </Link>
            )}
          </div>
        </div>

        {/* Apple Style Telemetry / Sync Micro-Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground dark:text-white truncate">Cloud Synchronization</span>
              <span className="text-[11px] text-muted-foreground dark:text-zinc-400">{user ? "Active & Up to Date" : "Local Storage Only"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground dark:text-white truncate">Security Protocol</span>
              <span className="text-[11px] text-muted-foreground dark:text-zinc-400">Row-Level Security</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <CloudCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground dark:text-white truncate">Offline Cache</span>
              <span className="text-[11px] text-muted-foreground dark:text-zinc-400">PWA IndexedDB Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
