"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/features/admin/components/confirmation-dialog";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { Power, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemSettingsData {
  maintenance: {
    enabled: boolean;
    message: string;
    expected_return_time: string | null;
  };
}

export default function AdminSystemPage() {
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation states
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(false);

  // Form state for maintenance config
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [expectedReturnTime, setExpectedReturnTime] = useState("");

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const data: SystemSettingsData = await res.json();
        setSettings(data);
        setMaintenanceMessage(data.maintenance.message);
        setExpectedReturnTime(data.maintenance.expected_return_time || "");
      }
    } catch (err) {
      console.error("Error fetching system settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  const handleToggleMaintenance = () => {
    const newState = !settings?.maintenance.enabled;
    setToggleTarget(newState);
    setShowToggleConfirm(true);
  };

  const confirmToggle = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_enabled: toggleTarget,
          maintenance_message: maintenanceMessage.trim() || undefined,
          expected_return_time: expectedReturnTime.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast.success(
          toggleTarget ? "Maintenance mode enabled" : "Maintenance mode disabled"
        );
        setShowToggleConfirm(false);
      } else {
        toast.error("Failed to update maintenance mode");
      }
    } catch {
      toast.error("Failed to update maintenance mode");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_enabled: settings?.maintenance.enabled ?? false,
          maintenance_message: maintenanceMessage.trim() || undefined,
          expected_return_time: expectedReturnTime.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast.success("Maintenance configuration saved");
      } else {
        toast.error("Failed to save configuration");
      }
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const maintenanceEnabled = settings?.maintenance.enabled ?? false;
  const status = maintenanceEnabled ? "maintenance" : "online";

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Controls</h1>
          <p className="text-sm text-zinc-500 mt-1">Loading...</p>
        </div>
        <div className="h-[400px] rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Controls</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage website status and maintenance mode
        </p>
      </div>

      {/* Website Status Card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                maintenanceEnabled ? "bg-amber-500/10" : "bg-emerald-500/10"
              }`}>
                <Power className={`w-5 h-5 ${maintenanceEnabled ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Website Status</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Control whether JEE Pro is accessible to users</p>
              </div>
            </div>
            <StatusBadge status={status} size="lg" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/[0.06] bg-white/[0.01]">
            <div>
              <p className="text-sm font-medium text-zinc-200">Maintenance Mode</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {maintenanceEnabled
                  ? "Normal users are currently blocked from accessing the application"
                  : "The application is accessible to all users"
                }
              </p>
            </div>
            <Button
              onClick={handleToggleMaintenance}
              variant={maintenanceEnabled ? "default" : "destructive"}
              className={maintenanceEnabled
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : ""
              }
            >
              {maintenanceEnabled ? "Bring Online" : "Take Offline"}
            </Button>
          </div>
        </div>
      </div>

      {/* Maintenance Configuration */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/10">
              <Wrench className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Maintenance Configuration</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Configure the message users see during maintenance</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Maintenance Message</label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="We are currently performing scheduled maintenance."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 resize-none"
            />
          </div>

          {/* Expected Return Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Expected Return Time (optional ISO timestamp or text phrase)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                placeholder="ISO timestamp or phrase (e.g. 2026-09-16T12:00:00Z or 10:30 PM IST)"
                className="w-full sm:w-96 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 font-mono"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">Quick Presets:</span>
                {[
                  { label: "+15m", mins: 15 },
                  { label: "+30m", mins: 30 },
                  { label: "+1h", mins: 60 },
                  { label: "+2h", mins: 120 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const target = new Date(Date.now() + preset.mins * 60 * 1000);
                      setExpectedReturnTime(target.toISOString());
                    }}
                    className="px-2 py-1 rounded text-xs bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
                {expectedReturnTime && (
                  <button
                    type="button"
                    onClick={() => setExpectedReturnTime("")}
                    className="px-2 py-1 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="pt-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle Confirmation */}
      <ConfirmationDialog
        open={showToggleConfirm}
        onOpenChange={setShowToggleConfirm}
        title={toggleTarget ? "Take Website Offline?" : "Bring Website Online?"}
        description={
          toggleTarget
            ? "This will prevent normal users from accessing JEE Pro until maintenance mode is disabled. Administrators will retain access to the admin panel."
            : "This will restore access for all users. The maintenance page will no longer be shown."
        }
        confirmLabel={toggleTarget ? "Take Offline" : "Bring Online"}
        onConfirm={confirmToggle}
        isDestructive={toggleTarget}
        isLoading={isSaving}
      />
    </div>
  );
}
