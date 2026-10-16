"use client";

import React from "react";
import { useCookieConsent } from "../context/cookie-consent-context";
import { Cookie, ShieldCheck, Sliders, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CookieConsentBanner() {
  const { isBannerOpen, acceptAll, rejectOptional, openPreferencesModal } = useCookieConsent();

  return (
    <AnimatePresence>
      {isBannerOpen && (
        <motion.aside
          role="region"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-lg z-50 pointer-events-auto"
        >
          <div className="relative rounded-2xl border border-[#2B3342] bg-[#0B0D12]/95 backdrop-blur-2xl p-5 sm:p-6 text-[#F5F7FB] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(120,169,255,0.08)] ring-1 ring-[#78A9FF]/15">
            {/* Ambient subtle glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#78A9FF]/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shrink-0 mt-0.5">
                <Cookie className="w-4 h-4" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-[#F5F7FB] flex items-center gap-1.5">
                    <span>Privacy & Cookie Preferences</span>
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20">
                    Strictly Compliant
                  </span>
                </div>
                <p className="text-xs text-[#A4ADBB] leading-relaxed">
                  JEE Pro uses essential cookies for secure authentication and optional telemetry to improve problem solving and feature responsiveness. We never sell your data or deploy third-party advertising trackers.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3.5 border-t border-[#2B3342]/70 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={openPreferencesModal}
                className="text-xs font-semibold text-[#A4ADBB] hover:text-[#78A9FF] transition-colors flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/[0.04]"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="px-3.5 py-2 rounded-xl border border-[#2B3342] hover:bg-white/[0.05] text-[#A4ADBB] hover:text-[#F5F7FB] text-xs font-semibold transition-all cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="px-4 py-2 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-semibold transition-all cursor-pointer shadow-[0_2px_12px_rgba(120,169,255,0.25)]"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
