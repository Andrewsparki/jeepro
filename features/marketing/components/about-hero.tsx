"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative pt-36 sm:pt-44 lg:pt-52 pb-20 sm:pb-28 overflow-visible flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl flex flex-col items-center">
        
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.12] bg-[#070E1E]/60 text-xs font-semibold text-[#38bdf8] backdrop-blur-2xl shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase text-[11px]">THE IDEA BEHIND JEE PRO</span>
          </div>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]"
        >
          Built for students who want to{" "}
          <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(30,167,255,0.35)]">
            prepare with purpose.
          </span>
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-14 max-w-2xl text-base sm:text-xl text-[#98A0B3] font-normal leading-relaxed"
        >
          JEE PRO is a focused study operating system designed to bring preparation, practice, revision, and progress into one distraction-free environment.
        </motion.p>

        {/* Subtle Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-2 text-xs text-slate-400/80 font-medium"
        >
          <span className="tracking-widest uppercase text-[10px]">The Story</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-[#38bdf8]" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
