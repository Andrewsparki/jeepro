"use client";

import { ShieldAlert, Download, Trash2, RotateCcw, Cloud, LogOut } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PrivacySection() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <GlassSection id="privacy" title="Privacy & Data" icon={ShieldAlert} description="Manage your data and account access.">
      
      <SettingRow 
        title="Export Data" 
        description="Download a JSON archive of all your study sessions and progress."
      >
        <Button variant="outline" size="sm" className="h-8 gap-2 bg-surface hover:bg-surface-hover border-glass-border">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </SettingRow>

      <SettingRow 
        title="Cloud Backup" 
        description="Force sync your offline progress queue to the database."
      >
        <Button variant="outline" size="sm" className="h-8 gap-2 bg-surface hover:bg-surface-hover border-glass-border">
          <Cloud className="w-3.5 h-3.5" />
          Sync Now
        </Button>
      </SettingRow>

      <SettingRow 
        title="Reset Progress" 
        description="Permanently reset all your XP, levels, and completed topics."
      >
        <Button variant="outline" size="sm" className="h-8 gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-red-500/5">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </SettingRow>

      <SettingRow 
        title="Delete Sessions" 
        description="Clear all recorded study sessions and timeline history."
      >
        <Button variant="outline" size="sm" className="h-8 gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 bg-red-500/5">
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
            toast("Signing out...");
            await supabase.auth.signOut();
            router.push("/auth/login");
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </SettingRow>

    </GlassSection>
  );
}
