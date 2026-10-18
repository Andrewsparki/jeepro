"use client";

import { useState } from "react";
import {
  Info,
  Code2,
  Layers,
  Database,
  Cpu,
  Sparkles,
  CheckCircle2,
  Heart,
  Coffee,
  QrCode,
  Copy,
  ExternalLink,
} from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { useSettings } from "@/providers/settings-provider";

export function AboutSection() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const { playSound } = useSettings();

  const handleVersionClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next >= 7) {
      setShowEasterEgg(true);
      setClickCount(0);
      playSound("success");
    } else {
      playSound("tick");
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("joshh@fam");
    setCopiedUpi(true);
    playSound("success");
    toast.success("UPI ID copied to clipboard: joshh@fam");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div id="about" className="space-y-6">
      {/* ── 1. Platform Specifications ────────────────────────────────────── */}
      <GlassSection
        title="About & Architecture"
        icon={Info}
        badge="Platform"
        description="Kernel build, compilation artifact version, and runtime dependencies."
      >
        <SettingRow
          title="Application Version"
          description={
            clickCount > 0 && clickCount < 7
              ? `${7 - clickCount} taps remaining to unlock spatial diagnostics`
              : "Tap version pill multiple times to access developer diagnostics."
          }
          icon={Info}
        >
          <button
            type="button"
            onClick={handleVersionClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-mono text-foreground transition-all active:scale-95 cursor-pointer select-none"
          >
            <span>v0.1.0-beta</span>
            {clickCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            )}
          </button>
        </SettingRow>

        <SettingRow
          title="Kernel Build"
          description="Target production artifact compiled on Next.js Turbopack engine."
          icon={Cpu}
        >
          <span className="px-3 py-1 rounded-md bg-surface border border-border text-xs font-mono text-muted-foreground">
            9482.10a-turbo
          </span>
        </SettingRow>

        <SettingRow
          title="Release Channel"
          description="Continuous automated production delivery pipeline."
          icon={Sparkles}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stable Production</span>
          </div>
        </SettingRow>

        <SettingRow
          title="Core Runtime Stack"
          description="Engineered with Next.js 16 (App Router), React 19, and Supabase."
          icon={Layers}
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface border border-border px-2.5 py-1 rounded-md text-muted-foreground">
              <Layers className="w-3 h-3 text-accent" /> Next.js 16
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface border border-border px-2.5 py-1 rounded-md text-muted-foreground">
              <Database className="w-3 h-3 text-emerald-400" /> Supabase
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface border border-border px-2.5 py-1 rounded-md text-muted-foreground">
              <Code2 className="w-3 h-3 text-accent" /> React 19
            </span>
          </div>
        </SettingRow>
      </GlassSection>

      {/* ── 2. Creator Appreciation & Support ─────────────────────────────── */}
      <div className="rounded-xl bg-card border border-border p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface border border-border text-rose-400 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 fill-rose-400/20" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Creator & Platform Development
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                JEE Pro is independently engineered for focused aspirants. Support continuous hosting and maintenance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="https://buymeacoffee.com/devandrew"
            target="_blank"
            rel="noreferrer"
            onClick={() => playSound("click")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-foreground transition-colors"
          >
            <Coffee className="w-3.5 h-3.5 text-[#F1BE62]" />
            <span>Buy Me A Coffee</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>

          <a
            href="https://patreon.com/devAndrew"
            target="_blank"
            rel="noreferrer"
            onClick={() => playSound("click")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-foreground transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Patreon</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => playSound("click")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-accent" />
                <span>UPI / QR Code</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-xs bg-card border border-border text-foreground p-6 rounded-xl">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-base font-bold text-foreground text-center">
                  Direct UPI Contribution
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4 py-3">
                <div className="p-3 bg-white rounded-xl shadow-md border border-border">
                  <Image
                    src="/images/fampay_qr.jpeg"
                    alt="FamPay UPI QR Code"
                    width={180}
                    height={180}
                    className="rounded-lg object-contain"
                  />
                </div>

                <div className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border">
                  <span className="font-mono text-xs text-accent pl-2 font-semibold select-all">
                    joshh@fam
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── 3. Diagnostic Easter Egg Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-xl p-6 bg-card border border-border text-center shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-surface border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1">JEE Pro Diagnostic Kernel</h3>
                <span className="text-xs font-mono text-accent mb-4 block">Build 9482.10a</span>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Telemetry pipelines healthy. Memory footprint nominal. Designed for zero-distraction engineering preparation.
                </p>

                <p className="text-xs italic text-muted-foreground/70 font-serif mb-6">
                  &ldquo;Crafted in silence. Measured in progress.&rdquo;
                </p>

                <button
                  type="button"
                  onClick={() => setShowEasterEgg(false)}
                  className="w-full py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  Close Diagnostics
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
