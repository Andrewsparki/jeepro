"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { toast } from "sonner";

export function ProfileSection() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Aspirant";

  const handleSignOut = async () => {
    toast("Signing out...");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <GlassSection
      id="profile"
      title="Account"
      description="Sign in to sync your settings, formulas, and study progress across devices."
      icon={User}
    >
      {user ? (
        <SettingRow
          title={`Signed in as ${displayName}`}
          description={user.email || "Active JEE PRO Account"}
          isLast
        >
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pro Active</span>
            </span>
            <button
              onClick={handleSignOut}
              className="bg-white hover:bg-white/90 text-black font-semibold text-xs sm:text-sm rounded-full px-5 py-2 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </SettingRow>
      ) : (
        <SettingRow
          title="Not signed in"
          description="Create an account or sign in to sync your data"
          isLast
        >
          <Link
            href="/login"
            className="bg-white hover:bg-white/90 text-black font-semibold text-xs sm:text-sm rounded-full px-6 py-2 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </SettingRow>
      )}
    </GlassSection>
  );
}
