"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  Layers, 
  FolderX, 
  Shuffle, 
  HelpCircle, 
  BellOff, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  RotateCcw, 
  Compass, 
  ArrowRight,
  Target
} from "lucide-react";

export function AboutProblemSolution() {
  return (
    <div className="space-y-28 sm:space-y-36">
      
      {/* ========================================================================= */}
      {/* SECTION 2: THE PROBLEM                                                    */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Glass Chaos Card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative rounded-[32px] p-8 sm:p-10 bg-[#070E1E]/65 backdrop-blur-2xl border border-red-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden space-y-6"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">The Scattered State</h4>
                  <p className="text-xs text-red-400/80 font-medium">Why preparation breaks down</p>
                </div>
              </div>

              {/* Chaos Points */}
              <div className="space-y-3 pt-2">
                {[
                  { icon: FolderX, title: "Too many resources", desc: "Dozens of PDFs, unindexed drive links, and duplicate sheets." },
                  { icon: Layers, title: "Scattered notes", desc: "Formulas written on scraps with no central reference anchor." },
                  { icon: Shuffle, title: "Random practice", desc: "Solving problems without difficulty calibration or target focus." },
                  { icon: HelpCircle, title: "No clear progress", desc: "Never knowing if a chapter is genuinely mastered or decaying." },
                  { icon: BellOff, title: "Constant distractions", desc: "Social feeds, algorithms, and clutter interrupting deep study." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <item.icon className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] text-[#98A0B3]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Editorial Philosophy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-rose-400 backdrop-blur-xl">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Core Dilemma</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                JEE preparation shouldn&apos;t feel <br />
                <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                  chaotic.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[#98A0B3] font-normal leading-relaxed">
                Students don&apos;t need another place to collect resources. They need a system that helps them know what to study, what to practice, what to revise, and where they stand.
              </p>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-slate-200 leading-relaxed italic border-l-2 border-l-[#1EA7FF]">
                &ldquo;More content is not the answer. Clarity, structure, and focused daily execution are what actually create top percentile ranks.&rdquo;
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: THE SOLUTION                                                   */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              One system. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">
                One direction.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              JEE PRO brings the important parts of preparation together so students can spend less time managing their preparation and more time actually preparing.
            </p>
          </div>

          {/* Connected 5-Node Ecosystem Visual */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[36px] p-8 sm:p-12 lg:p-16 bg-[#070E1E]/70 backdrop-blur-3xl border border-white/[0.14] shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden"
          >
            {/* Top Specular Glare */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Ambient Backlight Flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 5 Connected Glass Nodes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 relative z-10">
              {[
                { name: "SUBJECTS", desc: "90-Chapter Syllabus", icon: Layers, color: "text-cyan-400", border: "border-cyan-500/30" },
                { name: "PROGRESS", desc: "Live Telemetry", icon: TrendingUp, color: "text-indigo-400", border: "border-indigo-500/30" },
                { name: "PRACTICE", desc: "PYQ & Problem Engine", icon: Target, color: "text-purple-400", border: "border-purple-500/30" },
                { name: "REVISION", desc: "Spaced Repetition", icon: RotateCcw, color: "text-pink-400", border: "border-pink-500/30" },
                { name: "TESTS", desc: "3-Hour NTA Mocks", icon: FileText, color: "text-emerald-400", border: "border-emerald-500/30" },
              ].map((node, i) => (
                <div
                  key={node.name}
                  className={`p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${node.border} shadow-sm flex flex-col items-center text-center space-y-3 hover:bg-white/[0.06] transition-all hover:scale-105 duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center ${node.color} shadow-inner`}>
                    <node.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white tracking-wider">{node.name}</h4>
                    <p className="text-[10px] text-[#98A0B3] mt-0.5">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Supporting Quote */}
            <div className="mt-12 text-center pt-8 border-t border-white/[0.08]">
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto">
                No context switching. No lost notes. Everything flows naturally in one cohesive preparation operating system.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
