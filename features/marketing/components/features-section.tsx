"use client";

import { motion } from "framer-motion";
import { 
  RotateCcw, 
  Target, 
  FileText, 
  Layers, 
  LineChart, 
  Focus, 
  CalendarCheck, 
  Sparkles, 
  Zap, 
  CheckCircle2 
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-blue-500/10 via-cyan-500/15 to-purple-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 mb-4 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Intelligent Ecosystem</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
          >
            Everything you need to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              study smarter.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto"
          >
            Engineered specifically to remove friction, automate revision cycles, and maximize problem-solving retention.
          </motion.p>
        </div>

        {/* Bento Grid Layout with Smooth Sequential Glide */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Item 1: Large Hero Feature Card */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-8 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl group-hover:bg-cyan-500/25 transition-all duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  Algorithmic Recall
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                Smart Revision & Spaced Repetition
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl mb-8">
                Never let formulas or mechanisms decay. The platform calculates your optimal revision intervals using spaced repetition models tuned for JEE Advanced question types.
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Δ
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Thermodynamics: Carnot Cycle & Entropy</p>
                  <p className="text-[11px] text-slate-400">Scheduled for 1st reinforcement (Today)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                Due Now
              </span>
            </div>
          </motion.div>

          {/* Bento Item 2: Vertical Feature Card - PYQ Practice */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl group-hover:bg-purple-500/25 transition-all duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                PYQ Practice
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6">
                10+ years of categorized JEE Main and Advanced previous year questions with step-by-step verified solutions.
              </p>
            </div>

            <div className="relative z-10 space-y-2 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Chapter-wise filters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Single/Multi-correct tags</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 3: Mock Tests Simulator */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-blue-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                Mock Tests Simulator
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Full-length 3-hour NTA-style mock tests with sectional timers, negative marking calibrations, and percentile projections.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Full exam environment</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
          </motion.div>

          {/* Bento Item 4: Chapter Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-indigo-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                Chapter Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Granular status flags for every chapter: Not Started, In Progress, Revised 1x, Revised 2x, Mastered.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>90 Total Chapters</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
          </motion.div>

          {/* Bento Item 5: Performance Analytics */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.36, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-emerald-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                Performance Analytics
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Accuracy breakdowns by question difficulty, time spent per problem, and weak-spot vulnerability detection.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Weak spot alerts</span>
              <LineChart className="w-4 h-4 text-emerald-400" />
            </div>
          </motion.div>

          {/* Bento Item 6: Deep Focus Mode */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.42, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-6 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-6 group-hover:scale-110 transition-transform">
              <Focus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              Deep Focus Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Full-screen distraction-free timer with ambient soundscapes and zero notification interruptions during deep work blocks.
            </p>
          </motion.div>

          {/* Bento Item 7: Study Planner */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.48, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="md:col-span-6 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-3xl border border-white/15 hover:border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              Intelligent Study Planning
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Dynamically generates your daily and weekly task schedules based on remaining days to exam and weak topic weights.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
