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
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[650px] rounded-full pointer-events-none -z-10 transform-gpu" 
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.14) 0%, rgba(6,182,212,0.10) 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 mb-4 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Intelligent Ecosystem</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
          >
            Everything you need to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              study smarter.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.14, ease: "easeOut" }}
            className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto"
          >
            Engineered specifically to remove friction, automate revision cycles, and maximize problem-solving retention.
          </motion.p>
        </div>

        {/* Bento Grid Layout - Clean, Unified Entrance with Hardware-Accelerated Smooth CSS Interactions */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          
          {/* Bento Item 1: Large Hero Feature Card */}
          <div 
            className="md:col-span-8 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(6,182,212,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:via-cyan-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(6,182,212,0.22) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 group-hover:bg-cyan-500/25 transition-all duration-300">
                  <RotateCcw className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  Algorithmic Recall
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3 group-hover:text-cyan-200 transition-colors duration-200">
                Smart Revision & Spaced Repetition
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl mb-8">
                Never let formulas or mechanisms decay. The platform calculates your optimal revision intervals using spaced repetition models tuned for JEE Advanced question types.
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-white/15 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Δ
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Thermodynamics: Carnot Cycle & Entropy</p>
                  <p className="text-[11px] text-slate-400">Scheduled for 1st reinforcement (Today)</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Due Now
              </span>
            </div>
          </div>

          {/* Bento Item 2: Vertical Feature Card - PYQ Practice */}
          <div 
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(168,85,247,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent group-hover:via-purple-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(168,85,247,0.22) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6 group-hover:scale-105 group-hover:bg-purple-500/25 transition-all duration-300">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-purple-200 transition-colors duration-200">
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
          </div>

          {/* Bento Item 3: Mock Tests Simulator */}
          <div 
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-blue-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(59,130,246,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent group-hover:via-blue-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-30 group-hover:opacity-65 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(59,130,246,0.2) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-6 group-hover:scale-105 group-hover:bg-blue-500/25 transition-all duration-300">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-blue-200 transition-colors duration-200">
                Mock Tests Simulator
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Full-length 3-hour NTA-style mock tests with sectional timers, negative marking calibrations, and percentile projections.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Full exam environment</span>
              <Zap className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>

          {/* Bento Item 4: Chapter Tracking */}
          <div 
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-indigo-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(99,102,241,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent group-hover:via-indigo-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-30 group-hover:opacity-65 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-6 group-hover:scale-105 group-hover:bg-indigo-500/25 transition-all duration-300">
                <Layers className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-indigo-200 transition-colors duration-200">
                Chapter Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Granular status flags for every chapter: Not Started, In Progress, Revised 1x, Revised 2x, Mastered.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>90 Total Chapters</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          {/* Bento Item 5: Performance Analytics */}
          <div 
            className="md:col-span-4 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-emerald-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(16,185,129,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent group-hover:via-emerald-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-30 group-hover:opacity-65 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(16,185,129,0.2) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-6 group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all duration-300">
                <LineChart className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-emerald-200 transition-colors duration-200">
                Performance Analytics
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Accuracy breakdowns by question difficulty, time spent per problem, and weak-spot vulnerability detection.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Weak spot alerts</span>
              <LineChart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          {/* Bento Item 6: Deep Focus Mode */}
          <div 
            className="md:col-span-6 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu overflow-hidden"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:via-cyan-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30 group-hover:opacity-65 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(6,182,212,0.18) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-6 group-hover:scale-105 group-hover:bg-cyan-500/25 transition-all duration-300">
                <Focus className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-cyan-200 transition-colors duration-200">
                Deep Focus Mode
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Full-screen distraction-free timer with ambient soundscapes and zero notification interruptions during deep work blocks.
              </p>
            </div>
          </div>

          {/* Bento Item 7: Study Planner */}
          <div 
            className="md:col-span-6 group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/12 hover:border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_70px_rgba(168,85,247,0.15)] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 transform-gpu overflow-hidden"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent group-hover:via-purple-400/60 transition-colors duration-300 pointer-events-none" />

            {/* Corner Ambient Radial Halo */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30 group-hover:opacity-65 transition-opacity duration-500 transform-gpu"
              style={{ background: "radial-gradient(circle at 100% 0%, rgba(168,85,247,0.18) 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6 group-hover:scale-105 group-hover:bg-purple-500/25 transition-all duration-300">
                <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 group-hover:text-purple-200 transition-colors duration-200">
                Intelligent Study Planning
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Dynamically generates your daily and weekly task schedules based on remaining days to exam and weak topic weights.
              </p>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
