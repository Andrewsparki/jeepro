"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogIn,
  LogOut,
  Sparkles,
  Gift,
  Save,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Mail,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { BirthdayService } from "@/features/birthday/services/birthday.service";
import { useBirthdayMode } from "@/features/birthday/context/birthday-mode-context";
import { toast } from "sonner";
import { useDialog } from "@/providers/dialog-provider";
import { useSettings } from "@/providers/settings-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TARGET_EXAMS = [
  "Both JEE Main & Advanced",
  "JEE Advanced",
  "JEE Main",
] as const;

const TARGET_YEARS = [2025, 2026, 2027, 2028, 2029] as const;

interface StudentCredentialsFormProps {
  userId: string;
  userEmail: string;
  initialFullName: string;
  initialTargetExam: string;
  initialTargetYear: number;
}

function StudentCredentialsForm({
  userId,
  userEmail,
  initialFullName,
  initialTargetExam,
  initialTargetYear,
}: StudentCredentialsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [targetExam, setTargetExam] = useState(initialTargetExam);
  const [targetYear, setTargetYear] = useState(initialTargetYear);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { playSound } = useSettings();
  const supabase = createClient();
  const router = useRouter();

  const hasProfileChanges =
    fullName.trim() !== initialFullName ||
    targetExam !== initialTargetExam ||
    targetYear !== initialTargetYear;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter a valid full name.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          target_exam: targetExam,
          target_year: targetYear,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        toast.error("Failed to update profile: " + error.message);
      } else {
        playSound("success");
        toast.success("Profile preferences updated successfully.");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred while saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveProfile}
      className="rounded-xl bg-[#121722] border border-[#2B3342] overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-[#2B3342]/70 bg-[#151B27]/40 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#F5F7FB]">
            Student Credentials
          </h3>
          <p className="text-xs text-[#A4ADBB] mt-0.5">
            Update your display name, target examination, and cohort graduation year.
          </p>
        </div>
        <button
          type="submit"
          disabled={!hasProfileChanges || isSavingProfile}
          className="px-4 py-2 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] disabled:opacity-40 disabled:hover:bg-[#78A9FF] text-[#0B0D12] text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {isSavingProfile ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="full-name"
              className="block text-xs font-semibold text-[#F5F7FB] uppercase tracking-wider"
            >
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aryan Sharma"
              className="w-full bg-[#171D28] border border-[#2B3342] text-[#F5F7FB] placeholder-[#A4ADBB]/50 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#78A9FF] focus:ring-1 focus:ring-[#78A9FF] transition-colors"
            />
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-readonly"
                className="block text-xs font-semibold text-[#A4ADBB] uppercase tracking-wider"
              >
                Account Email
              </label>
              <span className="text-[10px] text-[#5DC98B] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
            <input
              id="email-readonly"
              type="email"
              value={userEmail}
              disabled
              readOnly
              className="w-full bg-[#171D28]/50 border border-[#2B3342]/60 text-[#A4ADBB] rounded-lg px-3.5 py-2 text-sm cursor-not-allowed select-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#2B3342]/60">
          {/* Target Exam */}
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold text-[#F5F7FB] uppercase tracking-wider flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>Target Exam</span>
            </label>
            <Select value={targetExam} onValueChange={setTargetExam}>
              <SelectTrigger className="w-full bg-[#171D28] border-[#2B3342] text-[#F5F7FB] text-sm">
                <SelectValue placeholder="Select target exam" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_EXAMS.map((exam) => (
                  <SelectItem key={exam} value={exam}>
                    {exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Year */}
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold text-[#F5F7FB] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>Target Exam Year</span>
            </label>
            <Select
              value={String(targetYear)}
              onValueChange={(val) => setTargetYear(Number(val))}
            >
              <SelectTrigger className="w-full bg-[#171D28] border-[#2B3342] text-[#F5F7FB] text-sm">
                <SelectValue placeholder="Select class cohort year" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    Class of {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </form>
  );
}

export function ProfileSection() {
  const { user, profile } = useAuth();
  const { openRecapModal, recapData } = useBirthdayMode();
  const { confirm } = useDialog();
  const { playSound } = useSettings();
  const router = useRouter();
  const supabase = createClient();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Birthday fields
  const [birthday, setBirthday] = useState<string>("");
  const [isSavingBirthday, setIsSavingBirthday] = useState(false);

  useEffect(() => {
    if (user?.id) {
      BirthdayService.getBirthdayInfo(user.id).then((info) => {
        if (info.birthday) {
          setBirthday(info.birthday);
        }
      });
    }
  }, [user?.id]);

  const handleSaveBirthday = async () => {
    if (!birthday) {
      toast.error("Please select a valid birthday (YYYY-MM-DD).");
      return;
    }

    const trimmedInput = birthday.trim();

    if (trimmedInput === "BDAYTEST2026") {
      setIsSavingBirthday(true);
      toast.info("Triggering birthday test sequence... 🎂");

      const resetSuccess = await BirthdayService.triggerTestBirthday(user?.id);
      setIsSavingBirthday(false);

      if (resetSuccess) {
        const todayStr = new Date().toISOString().split("T")[0];
        setBirthday(todayStr);
        toast.success("Birthday set to today! Launching celebration modal...");
        window.dispatchEvent(new CustomEvent("trigger-birthday-celebration"));
      } else {
        toast.error("Failed to execute birthday test code.");
      }
      return;
    }

    setIsSavingBirthday(true);
    const success = await BirthdayService.setBirthday(birthday, user?.id);
    setIsSavingBirthday(false);
    if (success) {
      playSound("success");
      toast.success("Birthday recorded! You'll receive celebratory milestones on your day. 🎉");
    } else {
      toast.error("Failed to save birthday. Please verify format YYYY-MM-DD.");
    }
  };

  const handleSignOut = async () => {
    playSound("click");
    const isConfirmed = await confirm({
      title: "Sign Out?",
      message: "Are you sure you want to log out of your JEE Pro session?",
      confirmLabel: "Sign Out",
      variant: "default",
    });

    if (isConfirmed) {
      toast("Signing out...");
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div id="profile" className="space-y-6">
      {/* ── 1. Account Identity Header ─────────────────────────────────────── */}
      <div className="rounded-xl bg-[#121722] border border-[#2B3342] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#171D28] border border-[#2B3342] flex items-center justify-center text-[#78A9FF] font-bold text-xl sm:text-2xl shrink-0 shadow-inner">
            {user ? userInitial : <User className="w-6 h-6 text-[#A4ADBB]" />}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F7FB] truncate">
                {user ? displayName : "Guest Aspirant"}
              </h2>
              {user ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/25">
                  <Sparkles className="w-3 h-3" />
                  <span>Pro Member</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#171D28] text-[#A4ADBB] border border-[#2B3342]">
                  Offline
                </span>
              )}
            </div>
            <p className="text-xs text-[#A4ADBB] flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>{user ? user.email : "Not signed in"}</span>
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-[#171D28] hover:bg-rose-500/10 text-[#A4ADBB] hover:text-rose-400 border border-[#2B3342] hover:border-rose-500/30 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Offline / Guest Aspirant Info Banner ──────────────────────────── */}
      {!user && (
        <div className="rounded-xl bg-[#121722] border border-[#2B3342] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-[#78A9FF]" />
            <h3 className="text-sm font-semibold text-[#F5F7FB]">
              Student Profile Sync
            </h3>
          </div>
          <p className="text-xs text-[#A4ADBB] leading-relaxed max-w-xl">
            You are currently browsing JEE Pro as a guest. Sign in to customize your target examination year (Class of 2025–2029), track JEE Main & Advanced chapter progress, sync solve milestones, and access annual birthday XP bonuses.
          </p>
          <div className="pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in to access student credentials</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── 2. Editable Profile Form ──────────────────────────────────────── */}
      {user && (
        <StudentCredentialsForm
          key={profile?.id || user.id}
          userId={user.id}
          userEmail={user.email || ""}
          initialFullName={profile?.full_name || ""}
          initialTargetExam={profile?.target_exam || "Both JEE Main & Advanced"}
          initialTargetYear={profile?.target_year || 2026}
        />
      )}

      {/* ── 3. Birthday & Annual Journey ──────────────────────────────────── */}
      {user && (
        <div className="rounded-xl bg-[#121722] border border-[#2B3342] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B3342]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#171D28] border border-[#2B3342] text-[#78A9FF] flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">
                  Annual Birthday & Milestone Rewards
                </h3>
                <p className="text-xs text-[#A4ADBB]">
                  Receive an annual celebration story, badge unlocks, and +500 Bonus XP on your day.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openRecapModal}
              className="px-3.5 py-1.5 rounded-lg bg-[#171D28] hover:bg-white/[0.05] border border-[#2B3342] text-[#F5F7FB] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F1BE62]" />
              <span>Replay Recap</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label htmlFor="birthday-input" className="text-xs font-medium text-[#F5F7FB] block">
                Birth Date (YYYY-MM-DD)
              </label>
              <span className="text-[11px] text-[#A4ADBB]">
                Locked to your student profile once verified.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="birthday-input"
                type="text"
                placeholder="2007-08-15"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-36 sm:w-40 bg-[#171D28] border border-[#2B3342] text-[#F5F7FB] placeholder-[#A4ADBB]/40 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#78A9FF] focus:ring-1 focus:ring-[#78A9FF]"
              />
              <button
                type="button"
                onClick={handleSaveBirthday}
                disabled={isSavingBirthday}
                className="px-3 py-1.5 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] disabled:opacity-50 text-[#0B0D12] text-xs font-semibold transition-colors cursor-pointer"
              >
                {isSavingBirthday ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {recapData?.isAlreadyClaimedThisYear && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5DC98B]/10 border border-[#5DC98B]/20 text-[#5DC98B] text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Annual Milestone Claimed: {recapData.milestoneTitle}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
