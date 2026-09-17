"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TypographyArt() {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Soft background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-36 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-2xl px-8 py-10 rounded-[2.5rem] bg-card/70 border border-border/70 backdrop-blur-2xl shadow-soft dark:bg-white/[0.02] dark:border-white/[0.08] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border dark:before:via-white/20 before:to-transparent"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border dark:bg-white/[0.05] dark:border-white/10 mb-6">
          <Sparkles className="w-3 h-3 text-muted-foreground dark:text-zinc-400" />
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted-foreground dark:text-zinc-300">
            Design Philosophy
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground/90 dark:text-white/90 leading-tight">
          Crafted in <span className="font-serif italic font-normal text-foreground dark:text-white drop-shadow-[0_0_12px_rgba(67,56,202,0.15)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">silence</span>.<br />
          Measured in <span className="font-serif italic font-normal text-foreground dark:text-white drop-shadow-[0_0_12px_rgba(67,56,202,0.15)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">progress</span>.
        </h2>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-border dark:via-white/20 to-transparent mt-8" />
      </motion.div>
    </div>
  );
}
