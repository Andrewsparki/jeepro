"use client";

import { motion } from "framer-motion";
import { ChevronDown, Compass } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 overflow-visible flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-zinc-300 backdrop-blur-xl">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span className="tracking-wide uppercase text-[11px]">The Philosophy of JEE Pro</span>
          </div>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 max-w-3xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
        >
          Built for students who prepare with purpose.
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 max-w-2xl text-base sm:text-lg text-zinc-400 font-normal leading-relaxed"
        >
          JEE Pro is a focused study operating system designed to bring syllabus tracking, adaptive practice, spaced revision, and telemetry into one distraction-free environment.
        </motion.p>

        {/* Subtle Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-2 text-xs text-zinc-500 font-medium"
        >
          <span className="tracking-widest uppercase text-[10px]">The Architecture</span>
          <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
        </motion.div>

      </div>
    </section>
  );
}
