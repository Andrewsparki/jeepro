"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  Layers, 
  FolderX, 
  Shuffle, 
  HelpCircle, 
  BellOff, 
  Workflow, 
  TrendingUp, 
  FileText, 
  RotateCcw, 
  Target
} from "lucide-react";

export function AboutProblemSolution() {
  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* ========================================================================= */}
      {/* SECTION 2: THE PROBLEM                                                    */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Glass Chaos Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 relative rounded-2xl p-6 sm:p-8 bg-[#090C15] border border-white/[0.08] shadow-sm overflow-hidden space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white tracking-tight">The Fragmented State</h4>
                  <p className="text-xs text-red-400/90 font-medium">Why preparation breaks down</p>
                </div>
              </div>

              {/* Chaos Points */}
              <div className="space-y-2.5 pt-2">
                {[
                  { icon: FolderX, title: "Resource overload", desc: "Dozens of scattered PDFs, drives, and duplicate problem sets." },
                  { icon: Layers, title: "Disjointed notes", desc: "Formulas written on scraps with no central reference anchor." },
                  { icon: Shuffle, title: "Arbitrary practice", desc: "Solving questions without calibrated exam targeting." },
                  { icon: HelpCircle, title: "Opaque retention", desc: "Never knowing if a concept is genuinely exam-ready or decaying." },
                  { icon: BellOff, title: "Algorithmic friction", desc: "Social feeds and forum notifications interrupting deep work." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <item.icon className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Editorial Philosophy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Core Dilemma</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                JEE preparation shouldn&apos;t feel chaotic.
              </h2>

              <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
                Students don&apos;t need another place to collect resources. They need an intentional system that clarifies what to study, what to practice, what to revise, and where they stand.
              </p>

              <div className="p-5 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs sm:text-sm text-zinc-300 leading-relaxed italic border-l-2 border-l-white">
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
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <Workflow className="w-3.5 h-3.5 text-zinc-400" />
              <span>Unified Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              One system. One direction.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              JEE Pro brings the critical parts of preparation together so students spend less time organizing and more time learning.
            </p>
          </div>

          {/* Connected 5-Node Ecosystem Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl p-6 sm:p-10 lg:p-12 bg-[#090C15] border border-white/[0.08] shadow-sm overflow-hidden"
          >
            {/* 5 Connected Obsidian Nodes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 relative z-10">
              {[
                { name: "SYLLABUS", desc: "90-Chapter Matrix", icon: Layers },
                { name: "PROGRESS", desc: "Real-time Telemetry", icon: TrendingUp },
                { name: "PRACTICE", desc: "Adaptive PYQ Engine", icon: Target },
                { name: "REVISION", desc: "Spaced Retention Cycles", icon: RotateCcw },
                { name: "TESTS", desc: "3-Hour NTA Simulators", icon: FileText },
              ].map((node) => (
                <div
                  key={node.name}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center space-y-3 hover:border-white/[0.16] transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider">{node.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Supporting Note */}
            <div className="mt-10 text-center pt-6 border-t border-white/[0.06]">
              <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-xl mx-auto">
                No context switching. No lost notes. Everything flows through one cohesive preparation operating system.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
