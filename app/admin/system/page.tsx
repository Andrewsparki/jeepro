"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/features/admin/components/confirmation-dialog";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { Power, Wrench, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ADMIN_SPRING_SNAPPY, ADMIN_EASE_FLUID } from "@/features/admin/components/motion";
import { playHapticSound } from "@/lib/sound-effects";

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
  const shouldReduceMotion = useReducedMotion();

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
          <p className="text-sm text-zinc-500 mt-1">Loading system configuration...</p>
        </div>
        <div className="h-[400px] rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Controls</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage live availability, deployment switches, and maintenance protocols
        </p>
      </div>

      {/* Dynamic Status Notification Banner */}
      <AnimatePresence mode="wait">
        {maintenanceEnabled ? (
          <motion.div
            key="active-maintenance-banner"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={ADMIN_SPRING_SNAPPY}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.12)]"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Maintenance Mode Active</p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Public access is blocked. Users will receive the maintenance screen while admin accounts retain full panel access.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-online-banner"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={ADMIN_SPRING_SNAPPY}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">System Fully Operational</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                All production services, user routes, and real-time sockets are live and accepting traffic.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Website Status Card */}
      <motion.div
        layout
        transition={{ duration: 0.3, ease: ADMIN_EASE_FLUID }}
        className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
      >
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <motion.div
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-colors duration-300 ${
                  maintenanceEnabled
                    ? "bg-amber-500/15 border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.2)]"
                    : "bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                }`}
              >
                <Power
                  className={`w-5 h-5 transition-colors duration-300 ${
                    maintenanceEnabled ? "text-amber-400" : "text-emerald-400"
                  }`}
                />
              </motion.div>
              <div>
                <h2 className="text-base font-semibold text-white">Platform Availability Switch</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Global gatekeeper for JEE Pro user sessions</p>
              </div>
            </div>
            <StatusBadge status={status} size="lg" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.015]">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Maintenance Protocol</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-md">
                {maintenanceEnabled
                  ? "Normal students and users are presently redirected to the maintenance page."
                  : "The application is currently public and accessible to all verified students."}
              </p>
            </div>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                onClick={() => {
                  playHapticSound("click");
                  handleToggleMaintenance();
                }}
                variant={maintenanceEnabled ? "default" : "destructive"}
                className={
                  maintenanceEnabled
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all"
                    : "shadow-[0_0_16px_rgba(239,68,68,0.25)] transition-all"
                }
              >
                {maintenanceEnabled ? "Bring System Online" : "Initiate Maintenance"}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Maintenance Configuration */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Maintenance Broadcast</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Customize the notice message and estimated duration</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Broadcast Message
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="We are currently performing scheduled maintenance."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/15 resize-none transition-all duration-200"
            />
          </div>

          {/* Expected Return Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Estimated Recovery Timestamp
            </label>
            <div className="space-y-2.5">
              <input
                type="text"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                placeholder="ISO timestamp or phrase (e.g. 2026-09-16T12:00:00Z or 10:30 PM IST)"
                className="w-full sm:w-96 px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/15 font-mono transition-all duration-200"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">Quick Presets:</span>
                {[
                  { label: "+15m", mins: 15 },
                  { label: "+30m", mins: 30 },
                  { label: "+1h", mins: 60 },
                  { label: "+2h", mins: 120 },
                ].map((preset) => (
                  <motion.button
                    key={preset.label}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => {
                      playHapticSound("click");
                      const target = new Date(Date.now() + preset.mins * 60 * 1000);
                      setExpectedReturnTime(target.toISOString());
                    }}
                    className="px-2.5 py-1 rounded-md text-xs bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-all"
                  >
                    {preset.label}
                  </motion.button>
                ))}
                {expectedReturnTime && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => {
                      playHapticSound("click");
                      setExpectedReturnTime("");
                    }}
                    className="px-2.5 py-1 rounded-md text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                  >
                    Clear
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
              <Button
                onClick={() => {
                  playHapticSound("click");
                  handleSaveConfig();
                }}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {isSaving ? "Applying Configuration..." : "Save Configuration"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* High-Impact Toggle Confirmation */}
      <ConfirmationDialog
        open={showToggleConfirm}
        onOpenChange={setShowToggleConfirm}
        title={toggleTarget ? "Initiate Maintenance Mode?" : "Restore Public Operations?"}
        description={
          toggleTarget
            ? "CRITICAL ACTION: This immediately cuts off normal user traffic and redirects all active sessions to the maintenance splash screen. Admin panel access will remain uninterrupted."
            : "RESTORE ACCESS: This will take JEE Pro out of maintenance mode and restore full application access for all students worldwide."
        }
        confirmLabel={toggleTarget ? "Take Offline Now" : "Bring Online"}
        onConfirm={confirmToggle}
        isDestructive={toggleTarget}
        isLoading={isSaving}
      />
    </div>
  );
}
