"use client";

import { motion } from "framer-motion";
import { 
  XCircle, 
  CheckCircle2, 
  Layers, 
  Atom, 
  FlaskConical, 
  Binary, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import Link from "next/link";

const typicalFlaws = [
  "Dozens of open browser tabs and unindexed PDFs",
  "Unorganized notes with no central formula anchors",
  "Manual tracking on notebooks or fragmented spreadsheets",
  "Unclear priorities leading to syllabus neglect",
  "Sensory overload from distracting social algorithms",
];

const proAdvantages = [
  "Complete 90-chapter curriculum in one unified workspace",
  "Connected concept summaries and high-yield formula decks",
  "Live real-time telemetry across 5 mastery tiers",
  "Automated spaced-repetition revision cycles",
  "Pure, distraction-free environment engineered for deep work",
];

const subjectPipelines = [
  {
    title: "Physics",
    workflow: "Concept Derivation → Calibrated Practice → Speed Analysis",
    description: "From Classical Mechanics to Electrodynamics and Modern Physics. Master fundamental physical laws with derivation anchors, practice calibrated numericals, and identify conceptual gaps.",
    icon: Atom,
    badge: "29 Chapters",
    href: "/dashboard/study/physics",
  },
  {
    title: "Chemistry",
    workflow: "Theory Alignment → Reaction Pathways → Spaced Retention",
    description: "Deep organic reaction mechanisms, physical chemistry stoichiometry, and NCERT-aligned inorganic periodicity. Built-in periodic anchors and spaced repetition for formula retention.",
    icon: FlaskConical,
    badge: "30 Chapters",
    href: "/dashboard/study/chemistry",
  },
  {
    title: "Mathematics",
    workflow: "Pattern Recognition → Problem Execution → Error Review",
    description: "Comprehensive problem suites across Differential Calculus, Integral Calculus, Vectors, 3D Geometry, and Advanced Algebra. Train speed, calculation precision, and multi-concept synthesis.",
    icon: Binary,
    badge: "31 Chapters",
    href: "/dashboard/study/mathematics",
  },
];

export function AboutDifference() {
  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* ========================================================================= */}
      {/* SECTION 6: THE JEE PRO DIFFERENCE                                         */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Architectural Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Not another resource dump.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              See why serious aspirants choose a structured study operating system over fragmented tools.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
            
            {/* Left Card: Typical Preparation */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl p-6 sm:p-8 bg-[#090C15]/70 border border-white/[0.06] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.06]">
                  <h3 className="text-lg font-semibold text-zinc-300">Typical Preparation</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Fragmented
                  </span>
                </div>

                <div className="space-y-3.5">
                  {typicalFlaws.map((flaw) => (
                    <div key={flaw} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-400">
                      <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                      <span>{flaw}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 text-xs text-zinc-500 font-normal">
                Results in cognitive fatigue and inconsistent study pacing.
              </div>
            </motion.div>

            {/* Right Card: JEE PRO (Elevated Obsidian) */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl p-6 sm:p-8 bg-[#090C15] border border-white/[0.14] shadow-sm flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.08]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>JEE Pro</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.08] text-white border border-white/[0.16]">
                    Unified OS
                  </span>
                </div>

                <div className="space-y-3.5">
                  {proAdvantages.map((adv) => (
                    <div key={adv} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 font-normal">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 text-xs text-zinc-400 font-normal flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Engineered for prolonged deep work without cognitive switching.</span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: BUILT FOR JEE (3 SUBJECT PIPELINES)                            */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tailored Curricula</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Built for JEE.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              Every subject has its own cognitive demands. JEE Pro provides dedicated workflows tailored to each discipline.
            </p>
          </div>

          {/* 3 Subject Obsidian Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {subjectPipelines.map((subj, idx) => (
              <motion.div
                key={subj.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-xl p-6 sm:p-7 bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                      <subj.icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
                      {subj.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                    {subj.title}
                  </h3>

                  {/* Workflow pill */}
                  <div className="inline-block px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-400 mb-4">
                    {subj.workflow}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed mb-6">
                    {subj.description}
                  </p>
                </div>

                <Link
                  href={subj.href}
                  className="inline-flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors"
                >
                  <span>Explore {subj.title} Syllabus</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-zinc-400 group-hover:text-white" />
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
