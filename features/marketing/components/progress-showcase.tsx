"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Flame, 
  Activity, 
  BarChart3, 
  Zap
} from "lucide-react";

export function ProgressShowcase() {
  return (
    <section id="progress" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full pointer-events-none -z-10 transform-gpu" 
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.16) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-18"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs font-bold text-purple-300 mb-4 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Precision Telemetry</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
            Know exactly <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
              where you stand.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
            Real-time analytics across all 90 chapters. Track concept mastery, accuracy distributions, and your historical velocity towards JEE Advanced.
          </p>
        </motion.div>

        {/* Hero Dashboard Smoked Glass Showcase Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden"
        >
          {/* Specular Top Glare Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Aspirant Intelligence Center
                </h4>
                <p className="text-xs text-slate-300">Active Preparation Cycle • Phase 4</p>
              </div>
            </div>

            {/* Streak & Status Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                <span>18 Day Streak</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
                <span>Optimal Pace</span>
              </div>
            </div>
          </div>

          {/* Dashboard Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-8">
            {/* Metric 1 */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                <span>Overall Syllabus</span>
                <Target className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">74.2%</p>
              <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "74.2%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]" 
                />
              </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                <span>Chapters Mastered</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">67 <span className="text-sm font-normal text-slate-400">/ 90</span></p>
              <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "74.4%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" 
                />
              </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                <span>Questions Solved</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">2,840+</p>
              <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "85%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]" 
                />
              </div>
            </motion.div>

            {/* Metric 4 */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                <span>Avg. Accuracy</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">89.6%</p>
              <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "89.6%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" 
                />
              </div>
            </motion.div>
          </div>

          {/* Subject Progress Breakdowns & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            
            {/* Left 7 Columns: Subject Progress Bars */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
              <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider">Subject Mastery Status</h5>

              {/* Physics Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                    Physics (Mechanics, Electrodynamics, Modern)
                  </span>
                  <span className="text-cyan-300 font-extrabold">82%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.7)]" 
                  />
                </div>
              </div>

              {/* Chemistry Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                    Chemistry (Physical, Organic, Inorganic)
                  </span>
                  <span className="text-purple-300 font-extrabold">76%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "76%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.7)]" 
                  />
                </div>
              </div>

              {/* Mathematics Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                    Mathematics (Calculus, Vectors, Coordinate)
                  </span>
                  <span className="text-indigo-300 font-extrabold">65%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "65%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.7)]" 
                  />
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Recent Activity Log */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider">Recent Activity</h5>

              <div className="space-y-3">
                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-black border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">P</div>
                    <div>
                      <p className="text-xs font-bold text-white">Rotational Dynamics PYQ</p>
                      <p className="text-[11px] text-slate-400">25 Questions • 92% Acc.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">2h ago</span>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-black border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">C</div>
                    <div>
                      <p className="text-xs font-bold text-white">Aldehydes & Ketones Test</p>
                      <p className="text-[11px] text-slate-400">30 Questions • 88% Acc.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">5h ago</span>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]">M</div>
                    <div>
                      <p className="text-xs font-bold text-white">Definite Integrals Revision</p>
                      <p className="text-[11px] text-slate-400">20 Questions • 85% Acc.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Yesterday</span>
                </motion.div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
