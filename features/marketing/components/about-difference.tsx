"use client";

import { motion } from "framer-motion";
import { 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Atom, 
  FlaskConical, 
  Binary, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const typicalFlaws = [
  "Dozens of open browser tabs and scattered PDFs",
  "Unorganized notes with no central formula anchors",
  "Manual tracking on notebooks or fragmented spreadsheets",
  "Unclear priorities leading to syllabus neglect",
  "Sensory overload from distracting social algorithms",
];

const proAdvantages = [
  "Unified 90-chapter curriculum in one workspace",
  "Connected concept summaries and high-yield formula decks",
  "Live real-time telemetry across 5 mastery tiers",
  "Automated spaced-repetition revision schedules",
  "Pure, distraction-free environment engineered for deep work",
];

const subjectPipelines = [
  {
    title: "PHYSICS",
    workflow: "Concepts → Problems → Tests → Analysis",
    description: "From Classical Mechanics to Electrodynamics and Quantum Physics. Master fundamental physical laws with derivation anchors, practice calibrated numericals, and analyze conceptual errors.",
    icon: Atom,
    accent: "from-cyan-500/20 to-transparent",
    badge: "29 Chapters",
    color: "text-cyan-400",
    href: "/dashboard/study/physics",
  },
  {
    title: "CHEMISTRY",
    workflow: "Learn → Practice → Revise → Retain",
    description: "Deep organic reaction mechanisms, physical chemistry stoichiometry, and NCERT-aligned inorganic periodicity. Built-in periodic anchors and spaced repetition for formula retention.",
    icon: FlaskConical,
    accent: "from-purple-500/20 to-transparent",
    badge: "30 Chapters",
    color: "text-purple-400",
    href: "/dashboard/study/chemistry",
  },
  {
    title: "MATHEMATICS",
    workflow: "Understand → Solve → Analyze → Improve",
    description: "Comprehensive problem suites across Differential Calculus, Integral Calculus, Vectors, 3D Geometry, and Advanced Algebra. Train speed, calculation precision, and multi-concept synthesis.",
    icon: Binary,
    accent: "from-indigo-500/20 to-transparent",
    badge: "31 Chapters",
    color: "text-indigo-400",
    href: "/dashboard/study/mathematics",
  },
];

export function AboutDifference() {
  return (
    <div className="space-y-28 sm:space-y-36">
      
      {/* ========================================================================= */}
      {/* SECTION 6: THE JEE PRO DIFFERENCE                                         */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
              <Layers className="w-3.5 h-3.5" />
              <span>Architectural Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Not another <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-white via-slate-200 to-[#98A0B3] bg-clip-text text-transparent">
                resource dump.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              See why serious aspirants choose a structured study operating system over fragmented tools.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Left Card: Typical Preparation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] p-8 sm:p-10 bg-[#070E1E]/40 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/[0.06]">
                  <h3 className="text-xl font-bold text-slate-400">Typical Preparation</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Fragmented
                  </span>
                </div>

                <div className="space-y-4">
                  {typicalFlaws.map((flaw) => (
                    <div key={flaw} className="flex items-start gap-3 text-xs sm:text-sm text-[#98A0B3]">
                      <XCircle className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />
                      <span>{flaw}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 text-xs text-slate-500 font-medium">
                Results in cognitive fatigue and inconsistent study pacing.
              </div>
            </motion.div>

            {/* Right Card: JEE PRO (Brighter & Elevated) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[32px] p-8 sm:p-10 bg-[#081226]/85 backdrop-blur-xl border-2 border-cyan-400/40 shadow-[0_30px_100px_rgba(30,167,255,0.25),inset_0_1px_2px_rgba(255,255,255,0.3)] flex flex-col justify-between overflow-hidden transform-gpu"
            >
              <div 
                className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none transform-gpu" 
                style={{
                  background: "radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.18) 0%, transparent 70%)",
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/[0.08]">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>JEE PRO</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-md shadow-cyan-500/20">
                    Unified OS
                  </span>
                </div>

                <div className="space-y-4">
                  {proAdvantages.map((adv) => (
                    <div key={adv} className="flex items-start gap-3 text-xs sm:text-sm text-slate-100 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Empowers you to enter deep flow and study with measurable velocity.</span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: BUILT FOR JEE (3 SUBJECT PIPELINES)                            */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#c084fc] mb-3 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Curricula</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Built for JEE.
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              Every subject has its own unique cognitive demands. JEE PRO provides dedicated workflows tailored to each discipline.
            </p>
          </div>

          {/* 3 Subject Glass Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {subjectPipelines.map((subj, idx) => (
              <motion.div
                key={subj.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-[32px] p-8 sm:p-9 bg-[#070E1E]/75 backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.22] shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none transform-gpu" 
                  style={{
                    background: subj.title === "PHYSICS" 
                      ? "radial-gradient(circle at 100% 0%, rgba(6,182,212,0.18) 0%, transparent 70%)"
                      : subj.title === "CHEMISTRY"
                      ? "radial-gradient(circle at 100% 0%, rgba(168,85,247,0.18) 0%, transparent 70%)"
                      : "radial-gradient(circle at 100% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)"
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                      <subj.icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/[0.1] text-slate-300">
                      {subj.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {subj.title}
                  </h3>

                  {/* Workflow pill */}
                  <div className="inline-block px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-cyan-400 mb-4">
                    {subj.workflow}
                  </div>

                  <p className="text-xs sm:text-sm text-[#98A0B3] font-normal leading-relaxed mb-6">
                    {subj.description}
                  </p>
                </div>

                <Link
                  href={subj.href}
                  className="inline-flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors"
                >
                  <span>Explore {subj.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
