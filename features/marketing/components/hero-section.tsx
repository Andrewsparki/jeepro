"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Flame } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

export function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-24 overflow-visible flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      {/* Ambient Focal Glow behind Headline */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none -z-10 transform-gpu"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.22) 0%, rgba(99,102,241,0.14) 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl flex flex-col items-center">
        
        {/* Eyebrow / System Pill Badge with Luminous Border */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400/50 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="tracking-wider uppercase text-[11px] font-bold text-slate-100">Engineered for JEE Advanced 2026</span>
          </div>
        </motion.div>

        {/* Large Cinematic Headline - Immediately visible for optimal LCP */}
        <h1 className="mb-6 max-w-4xl text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05]">
          Conquer the{" "}
          <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(56,189,248,0.55)]">
            exam.
          </span>
        </h1>

        {/* Supporting Description */}
        <p className="mb-10 max-w-2xl text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
          The most premium, distraction-free platform designed to help you master{" "}
          <span className="text-white font-semibold">Physics</span>,{" "}
          <span className="text-white font-semibold">Chemistry</span>, and{" "}
          <span className="text-white font-semibold">Mathematics</span>.
        </p>

        {/* High-Dopamine Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
        >
          <DopamineCTAButton
            href="/signup"
            variant="aurora"
            size="md"
          >
            Start studying
          </DopamineCTAButton>

          <DopamineCTAButton
            href="/#features"
            variant="neon-glass"
            size="md"
          >
            Explore features
          </DopamineCTAButton>
        </motion.div>

        {/* Low-profile Social Proof Pill Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:scale-105 transition-transform">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>100% Free & Open Syllabus</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:scale-105 transition-transform">
            <Flame className="h-4 w-4 text-purple-400" />
            <span>Adaptive PYQ Practice</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Zero Distractions</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
