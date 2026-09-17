"use client";

import { useState } from "react";
import { Info, Code2, Layers, Database, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AboutSection() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleVersionClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next >= 7) {
      setShowEasterEgg(true);
      setClickCount(0);
    }
  };

  return (
    <>
      <GlassSection
        id="about"
        title="About & Architecture"
        icon={Info}
        badge="Platform"
        description="Kernel specifications, runtime dependencies, and platform release channels."
      >
        {/* Application Version */}
        <SettingRow
          title="Application Version"
          description={
            clickCount > 0 && clickCount < 7
              ? `${7 - clickCount} taps remaining to unlock spatial diagnostics`
              : "Tap version pill multiple times to access developer diagnostics."
          }
          icon={Info}
          iconGradient="from-sky-500 to-indigo-600"
        >
          <button
            type="button"
            onClick={handleVersionClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-mono text-foreground dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:border-white/15 dark:text-white transition-all active:scale-90 cursor-pointer select-none shadow-sm"
          >
            <span>v0.1.0-beta</span>
            {clickCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </SettingRow>

        {/* Kernel Build */}
        <SettingRow
          title="Kernel Build"
          description="Target compilation artifact on Next.js Turbopack engine."
          icon={Cpu}
          iconGradient="from-emerald-500 to-teal-600"
        >
          <span className="px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-xs font-mono text-muted-foreground dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300">
            9482.10a-turbo
          </span>
        </SettingRow>

        {/* Release Channel */}
        <SettingRow
          title="Release Channel"
          description="Automated continuous production delivery status."
          icon={Sparkles}
          iconGradient="from-amber-500 to-orange-600"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stable Production</span>
          </div>
        </SettingRow>

        {/* Framework Stack */}
        <SettingRow
          title="Core Engine Stack"
          description="Architectural primitives powering real-time rendering and state."
          icon={Layers}
          iconGradient="from-violet-500 to-purple-600"
          isLast
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary/70 border border-border/60 px-2.5 py-1 rounded-full text-muted-foreground dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-300">
              <Layers className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Next.js 16
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary/70 border border-border/60 px-2.5 py-1 rounded-full text-muted-foreground dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-300">
              <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Supabase
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary/70 border border-border/60 px-2.5 py-1 rounded-full text-muted-foreground dark:bg-white/[0.06] dark:border-white/10 dark:text-zinc-300">
              <Code2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> React 19
            </span>
          </div>
        </SettingRow>
      </GlassSection>

      {/* VisionOS Spatial Easter Egg Modal */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className={cn(
                "relative w-full max-w-sm rounded-[2.5rem] p-8 sm:p-10",
                "bg-card text-card-foreground border border-border/80 shadow-strong",
                "dark:bg-[#0a0e17]/85 dark:border-white/20 dark:shadow-[0_30px_90px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)]",
                "overflow-hidden text-center",
                "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border dark:before:via-white/40 before:to-transparent"
              )}
            >
              {/* Iridescent background aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* VisionOS Insignia */}
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/25 mb-6">
                  <div className="w-full h-full bg-slate-100 dark:bg-[#080b12]/70 backdrop-blur-md rounded-[22px] flex items-center justify-center border border-border dark:border-white/25">
                    <Sparkles className="w-8 h-8 text-indigo-600 dark:text-white animate-pulse" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white mb-1">
                  JEE PRO
                </h2>
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full text-xs font-mono text-muted-foreground dark:text-zinc-300 bg-secondary border border-border dark:bg-white/10 dark:border-white/15">
                  <span>Build 9482.10a</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 dark:bg-white/40" />
                  <span>Spatial Kernel</span>
                </div>

                <p className="text-sm text-muted-foreground dark:text-zinc-300 leading-relaxed mb-8">
                  Engineered with obsessive attention to fluid motion, zero-latency feedback, and frosted glass optics for serious aspirants.
                </p>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-border dark:via-white/15 to-transparent mb-6" />

                <span className="font-serif italic text-muted-foreground dark:text-zinc-400 text-sm mb-6">
                  Designed in silence. Measured in progress.
                </span>

                <button
                  type="button"
                  onClick={() => setShowEasterEgg(false)}
                  className="px-6 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs sm:text-sm border border-border dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
