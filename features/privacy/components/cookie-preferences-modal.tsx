"use client";

import React, { useState } from "react";
import { useCookieConsent } from "../context/cookie-consent-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { COOKIE_DECLARATIONS, CookieCategory } from "../types/cookie-consent.types";
import { ShieldCheck, Check, Lock, BarChart3, Sliders, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CookiePreferencesModal() {
  const {
    isPreferencesModalOpen,
    closePreferencesModal,
    preferences,
    saveCustomPreferences,
    acceptAll,
    rejectOptional,
  } = useCookieConsent();

  const [analytics, setAnalytics] = useState<boolean>(preferences?.analytics ?? false);
  const [prefSetting, setPrefSetting] = useState<boolean>(preferences?.preferences ?? true);

  // Sync state when preferences change
  React.useEffect(() => {
    if (preferences) {
      setAnalytics(preferences.analytics);
      setPrefSetting(preferences.preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    saveCustomPreferences({
      analytics,
      preferences: prefSetting,
    });
  };

  return (
    <Dialog open={isPreferencesModalOpen} onOpenChange={(open) => !open && closePreferencesModal()}>
      <DialogContent
        showCloseButton={true}
        className="max-w-xl sm:max-w-2xl bg-[#0B0D12] border border-[#2B3342] text-[#F5F7FB] p-0 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(120,169,255,0.08)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#2B3342]/70 bg-[#121722]/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F7FB]">
              Cookie & Telemetry Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A4ADBB]">
              Customize which cookies and privacy-respecting telemetry categories you permit during your sessions.
            </DialogDescription>
          </div>
        </div>

        {/* Categories List */}
        <div
          data-lenis-prevent
          className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar"
        >
          {/* Category 1: Strictly Essential */}
          <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/50 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5DC98B]" />
                <span className="text-sm font-semibold text-[#F5F7FB]">Strictly Necessary (Authentication & Security)</span>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#5DC98B]/10 text-[#5DC98B] border border-[#5DC98B]/20">
                Always Active
              </span>
            </div>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              Essential for authentication, secure API token exchange, and maintaining your signed-in state. Cannot be disabled without breaking the application.
            </p>
          </div>

          {/* Category 2: Functional Preferences */}
          <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#78A9FF]" />
                <span className="text-sm font-semibold text-[#F5F7FB]">Interface & Accessibility Preferences</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefSetting}
                  onChange={(e) => setPrefSetting(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#171D28] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#78A9FF]"></div>
              </label>
            </div>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              Remembers your chosen Obsidian/Midnight theme, study audio volume, sound effects toggle, and workspace panel collapse states.
            </p>
          </div>

          {/* Category 3: Privacy-Conscious Analytics */}
          <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#A8C5FF]" />
                <span className="text-sm font-semibold text-[#F5F7FB]">Usage & Feature Telemetry (Optional)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#171D28] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#78A9FF]"></div>
              </label>
            </div>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              Aggregated, coarse usage events (such as chapter views and study timer usage) to help us improve the platform. We never track keystrokes, personal names, passwords, message contents, or precise GPS coordinates.
            </p>
          </div>

          {/* Specific Cookie Audit Transparency Table */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#A4ADBB]/70 font-semibold mb-2">
              Declared Storage & Cookies
            </div>
            <div className="space-y-1.5 text-xs">
              {COOKIE_DECLARATIONS.map((c) => (
                <div key={c.name} className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#2B3342]/60 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-[#78A9FF] font-semibold block">{c.name}</span>
                    <span className="text-[11px] text-[#A4ADBB]">{c.purpose}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A4ADBB]/60 shrink-0">{c.expiry}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-5 sm:px-6 border-t border-[#2B3342]/70 bg-[#121722]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/privacy"
            onClick={closePreferencesModal}
            className="text-xs text-[#78A9FF] hover:underline flex items-center gap-1"
          >
            <span>Read full Privacy Principles</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={rejectOptional}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-[#2B3342] hover:bg-white/[0.04] text-[#A4ADBB] hover:text-[#F5F7FB] text-xs font-semibold transition-all cursor-pointer"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
