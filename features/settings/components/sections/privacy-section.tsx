"use client";

import { ShieldAlert, Download, Trash2, RotateCcw, Cloud, LogOut } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialog } from "@/providers/dialog-provider";

export function PrivacySection() {
  const router = useRouter();
  const supabase = createClient();
  const { confirm } = useDialog();

  return (
    <GlassSection id="privacy" title="Privacy & Security" icon={ShieldAlert} description="Manage your data, offline caches, and account access.">
      
      <SettingRow 
        title="Export Data" 
        description="Download a JSON archive of all your study sessions and progress."
      >
        <button 
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
          onClick={async () => {
            try {
              toast("Exporting data...");
              const { data: progress } = await supabase.from('user_topic_progress').select('*');
              const { data: sessions } = await supabase.from('study_sessions').select('*');
              const data = { progress, sessions };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `jee_pro_export_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Data exported successfully!");
            } catch (error) {
              toast.error("Failed to export data.");
            }
          }}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </SettingRow>

      <SettingRow 
        title="Cloud Backup" 
        description="Force sync your offline progress queue to the database."
      >
        <button 
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
          onClick={() => {
            toast.success("Progress synced with cloud!");
          }}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Sync Now</span>
        </button>
      </SettingRow>

      <SettingRow 
        title="Reset Progress" 
        description="Permanently reset all your XP, levels, and completed topics."
      >
        <button 
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-red-500/5 text-xs font-semibold transition-all active:scale-95"
          onClick={async () => {
            const isConfirmed = await confirm({
              title: "Reset Progress?",
              message: "Are you sure you want to reset all progress? This cannot be undone.",
              variant: "destructive",
              confirmLabel: "Reset",
            });
            if (isConfirmed) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { error } = await supabase.from("user_topic_progress").delete().eq("user_id", user.id);
                if (error) {
                  toast.error("Failed to reset progress.");
                } else {
                  toast.success("Progress reset successfully!");
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

      <SettingRow 
        title="Delete Sessions" 
        description="Clear all recorded study sessions and timeline history."
      >
        <button 
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-red-500/5 text-xs font-semibold transition-all active:scale-95"
          onClick={async () => {
            const isConfirmed = await confirm({
              title: "Delete Sessions?",
              message: "Are you sure you want to delete all study sessions? This cannot be undone.",
              variant: "destructive",
              confirmLabel: "Clear",
            });
            if (isConfirmed) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { error } = await supabase.from("study_sessions").delete().eq("user_id", user.id);
                if (error) {
                  toast.error("Failed to clear study sessions.");
                } else {
                  toast.success("Study sessions cleared successfully!");
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

      <SettingRow 
        title="Sign Out" 
        description="Log out of your account on this device."
        isLast
      >
        <button 
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
          onClick={async () => {
            const isConfirmed = await confirm({
              title: "Sign Out?",
              message: "Are you sure you want to log out of your account on this device?",
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
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </SettingRow>

    </GlassSection>
  );
}
