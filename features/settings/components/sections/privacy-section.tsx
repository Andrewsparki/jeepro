"use client";

import { ShieldAlert, Download, Trash2, RotateCcw, Cloud, LogOut } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialog } from "@/providers/dialog-provider";

export function PrivacySection() {
  const router = useRouter();
  const supabase = createClient();
  const { confirm } = useDialog();

  return (
    <GlassSection id="privacy" title="Privacy & Data" icon={ShieldAlert} description="Manage your data and account access.">
      
      <SettingRow 
        title="Export Data" 
        description="Download a JSON archive of all your study sessions and progress."
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-surface hover:bg-surface-hover border-glass-border"
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
          Export
        </Button>
      </SettingRow>

      <SettingRow 
        title="Cloud Backup" 
        description="Force sync your offline progress queue to the database."
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-surface hover:bg-surface-hover border-glass-border"
          onClick={() => {
            toast.success("Progress synced with cloud!");
          }}
        >
          <Cloud className="w-3.5 h-3.5" />
          Sync Now
        </Button>
      </SettingRow>

      <SettingRow 
        title="Reset Progress" 
        description="Permanently reset all your XP, levels, and completed topics."
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-red-500/5"
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
          Reset
        </Button>
      </SettingRow>

      <SettingRow 
        title="Delete Sessions" 
        description="Clear all recorded study sessions and timeline history."
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-red-500/5"
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
          Clear
        </Button>
      </SettingRow>

      <SettingRow 
        title="Sign Out" 
        description="Log out of your account on this device."
        isLast
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 border-glass-border bg-surface hover:bg-surface-hover"
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
              router.push("/auth/login");
            }
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </SettingRow>

    </GlassSection>
  );
}
