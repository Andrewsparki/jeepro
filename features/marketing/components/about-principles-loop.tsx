"use client";

import { motion } from "framer-motion";
import { 
  Compass, 
  Focus, 
  Eye, 
  Flame, 
  Target, 
  BookOpen, 
  Edit3, 
  FileCheck, 
  LineChart, 
  RotateCcw, 
  Trophy 
} from "lucide-react";

const principles = [
  {
    title: "FOCUS",
    tagline: "Remove unnecessary noise.",
    description: "Eliminate infinite scrolling feeds, distracting community threads, and sensory overload. When you sit down to study, only your syllabus and practice problems matter.",
    icon: Focus,
  },
  {
    title: "CLARITY",
    tagline: "Always know where you stand.",
    description: "No ambiguity around your preparation state. Granular 5-stage chapter tracking and speed/accuracy matrices show exactly which concepts are exam-ready and which are weak.",
    icon: Eye,
  },
  {
    title: "CONSISTENCY",
    tagline: "Daily compounding progress.",
    description: "Small, disciplined daily habits compound into top percentile rank breakthroughs. Built-in streak trackers and study goals keep your momentum continuous.",
    icon: Flame,
  },
  {
    title: "INTENT",
    tagline: "Purpose behind every problem.",
    description: "Never solve questions aimlessly. Every problem set is chosen with specific intent—targeting past mistakes, reinforcing derivations, or simulating exam timing.",
    icon: Target,
  },
];

const loopSteps = [
  { step: "01", name: "LEARN", desc: "NCERT & Core Derivations", icon: BookOpen },
  { step: "02", name: "PRACTICE", desc: "Adaptive PYQs & Problems", icon: Edit3 },
  { step: "03", name: "TEST", desc: "Timed 3-Hour NTA Mocks", icon: FileCheck },
  { step: "04", name: "ANALYZE", desc: "Error & Speed Heatmaps", icon: LineChart },
  { step: "05", name: "REVISE", desc: "Spaced Memory Reinforcement", icon: RotateCcw },
  { step: "06", name: "IMPROVE", desc: "Rank & Mastery Lift", icon: Trophy },
];

export function AboutPrinciplesLoop() {
  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* ========================================================================= */}
      {/* SECTION 4: CORE PRINCIPLES                                                */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>Foundational Values</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              What we believe.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              The four foundational pillars governing every feature, interface decision, and tool built into JEE Pro.
            </p>
          </div>

          {/* 4 Obsidian Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {principles.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-7 sm:p-8 rounded-xl bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    Pillar 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-white mb-1">
                  {p.title}
                </h3>
                <p className="text-xs font-medium text-zinc-300 mb-3 tracking-wide">
                  {p.tagline}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: PRODUCT PHILOSOPHY (THE 6-STAGE PREPARATION LOOP)              */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Continuous Improvement</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Designed around how preparation works.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              Real score improvements happen through a systematic feedback cycle. JEE Pro is engineered around this continuous 6-stage loop.
            </p>
          </div>

          {/* 6-Node Progression Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {loopSteps.map((node, i) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-xl p-5 bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm flex flex-col justify-between items-center text-center transition-all"
              >
                {/* Step Index Badge */}
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                  Step {node.step}
                </span>

                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-3">
                  <node.icon className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider mb-1">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
