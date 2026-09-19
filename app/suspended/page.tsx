"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Clock,
  Lock,
  LogOut,
  LifeBuoy,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { logout } from "@/features/auth/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { createSupportTicket } from "@/features/support/services/support.service";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";

export default function SuspendedPage() {
  const [reason, setReason] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Appeal Modal State
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  useEffect(() => {
    async function loadSuspensionDetails() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("suspended_reason, suspended_until")
            .eq("id", user.id)
            .single();

          if (profile) {
            setReason(profile.suspended_reason || null);
            setExpiresAt(profile.suspended_until || null);
          }
        }
      } catch (err) {
        console.error("Error loading suspension details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuspensionDetails();
  }, []);

  const isTemporary = !!expiresAt && new Date(expiresAt) > new Date();

  const handleOpenAppeal = () => {
    dispatchInteractionSound("ui.open");
    setIsAppealOpen(true);
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim() || appealMessage.trim().length < 10) {
      toast.error("Please provide a detailed explanation (at least 10 characters).");
      return;
    }

    setIsSubmittingAppeal(true);
    try {
      const result = await createSupportTicket({
        category: "account",
        subject: `Account Suspension Appeal (${isTemporary ? "Temporary" : "Permanent"})`,
        description: `APPEAL DETAILS:\n${appealMessage.trim()}\n\nSUSPENSION REASON: ${
          reason || "Standard Terms Violation"
        }\nSUSPENSION TYPE: ${isTemporary ? `Temporary (Until ${expiresAt})` : "Permanent"}`,
        priority: "high",
      });

      if (result.success) {
        dispatchInteractionSound("ui.select");
        toast.success("Appeal submitted to administrators.");
        setAppealSubmitted(true);
        setIsAppealOpen(false);
      } else {
        toast.error(result.error || "Failed to submit appeal. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit support appeal.");
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#09090b] text-white relative overflow-hidden select-none">
      {/* Background Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-[130px] rounded-full pointer-events-none ${
          isTemporary ? "bg-amber-500/10" : "bg-rose-500/10"
        }`}
      />

      {/* Main Card Container */}
      <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-zinc-900/70 backdrop-blur-2xl shadow-2xl space-y-6 relative z-10 text-center">
        {/* Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isTemporary
                ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-amber-500/10"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-rose-500/10"
            }`}
          >
            {isTemporary ? <Clock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          {!isLoading && (
            <div>
              {isTemporary ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Temporary Suspension
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                  Permanent Suspension
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Access Suspended</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your JEE Pro student account has been restricted by administrators due to a policy or conduct guidelines violation.
          </p>
        </div>

        {/* Status & Reason Details Card */}
        {!isLoading && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left space-y-3 text-xs">
            {/* Reason */}
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Administrator Reason
              </span>
              <p className="text-zinc-200 font-medium mt-0.5 leading-relaxed">
                {reason || "Violation of JEE Pro Terms of Service & Community Guidelines."}
              </p>
            </div>

            {/* Duration / Expiry */}
            <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Suspension Duration
                </span>
                <p
                  className={`font-semibold text-xs mt-0.5 ${
                    isTemporary ? "text-amber-400 font-mono" : "text-rose-400 font-bold"
                  }`}
                >
                  {isTemporary
                    ? new Date(expiresAt!).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Permanent (Indefinite)"}
                </p>
              </div>

              {isTemporary && expiresAt && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Expires In
                  </span>
                  <p className="text-zinc-300 font-mono text-[11px] mt-0.5">
                    {Math.ceil(
                      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )}{" "}
                    Day(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Integrated Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          {appealSubmitted ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Appeal Submitted to Admins
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleOpenAppeal}
              className="w-full border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.05] text-xs gap-2 py-5 font-semibold"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              Appeal Suspension
            </Button>
          )}

          <form action={logout} className="w-full">
            <Button
              type="submit"
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white hover:bg-rose-500/10 text-xs gap-2 py-4 font-medium rounded-xl"
            >
              <LogOut className="w-4 h-4 text-zinc-500" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* APPEAL SUBMISSION DIALOG */}
      <Dialog open={isAppealOpen} onOpenChange={setIsAppealOpen}>
        <DialogContent className="sm:max-w-md bg-[#0e0e0e]/95 border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              Submit Suspension Appeal
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Provide an explanation or request review from the JEE Pro operations team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAppealSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Appeal Statement / Reason *
              </label>
              <textarea
                placeholder="Explain why your account should be reviewed or reinstated..."
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs rounded-xl bg-black/50 border border-white/[0.1] text-white focus:outline-none focus:border-amber-500/40"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAppealOpen(false)}
                disabled={isSubmittingAppeal}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAppeal}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingAppeal ? "Submitting..." : "Submit Appeal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
