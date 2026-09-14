"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
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
import { MagneticCard } from "@/components/ui/magnetic-card";

const principles = [
  {
    title: "FOCUS",
    tagline: "Remove unnecessary noise.",
    description: "Eliminate infinite scrolling feeds, distracting community threads, and sensory overload. When you sit down to study, only your syllabus and practice problems matter.",
    icon: Focus,
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    glowColor: "rgba(6, 182, 212, 0.22)",
    bgAccent: "from-cyan-500/15 via-blue-500/5 to-transparent",
  },
  {
    title: "CLARITY",
    tagline: "Always know where you stand.",
    description: "No ambiguity around your preparation state. Granular 5-stage chapter tracking and speed/accuracy matrices show exactly which concepts are exam-ready and which are weak.",
    icon: Eye,
    color: "text-purple-400",
    border: "border-purple-500/20",
    glowColor: "rgba(168, 85, 247, 0.22)",
    bgAccent: "from-purple-500/15 via-pink-500/5 to-transparent",
  },
  {
    title: "CONSISTENCY",
    tagline: "Daily compounding progress.",
    description: "Small, disciplined daily habits compound into top percentile rank breakthroughs. Built-in streak trackers and study goals keep your momentum unstoppable.",
    icon: Flame,
    color: "text-amber-400",
    border: "border-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.22)",
    bgAccent: "from-amber-500/15 via-orange-500/5 to-transparent",
  },
  {
    title: "INTENT",
    tagline: "Purpose behind every problem.",
    description: "Never solve questions aimlessly. Every problem set is chosen with specific intent—targeting past mistakes, reinforcing derivations, or simulating exam timing.",
    icon: Target,
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.22)",
    bgAccent: "from-emerald-500/15 via-teal-500/5 to-transparent",
  },
];

const loopSteps = [
  { step: "01", name: "LEARN", desc: "NCERT & Core Derivations", icon: BookOpen, color: "text-cyan-400" },
  { step: "02", name: "PRACTICE", desc: "Adaptive PYQs & Problems", icon: Edit3, color: "text-blue-400" },
  { step: "03", name: "TEST", desc: "Timed 3-Hour NTA Mocks", icon: FileCheck, color: "text-indigo-400" },
  { step: "04", name: "ANALYZE", desc: "Error & Speed Heatmaps", icon: LineChart, color: "text-purple-400" },
  { step: "05", name: "REVISE", desc: "Spaced Memory Reinforcement", icon: RotateCcw, color: "text-pink-400" },
  { step: "06", name: "IMPROVE", desc: "Rank & Mastery Lift", icon: Trophy, color: "text-emerald-400" },
];

export function AboutPrinciplesLoop() {
  return (
    <div className="space-y-28 sm:space-y-36">
      
      {/* ========================================================================= */}
      {/* SECTION 4: CORE PRINCIPLES                                                */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#c084fc] mb-3 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Foundational Values</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              What we believe.
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              The four unshakeable pillars governing every feature, interface decision, and tool built into JEE PRO.
            </p>
          </div>

          {/* 4 Magnetic Glass Pillar Cards with Dynamic 3D Cursor Physics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {principles.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <MagneticCard
                  glowColor={p.glowColor}
                  tiltAmount={6}
                  className={`p-8 sm:p-10 bg-[#070E1E]/65 backdrop-blur-2xl border ${p.border} hover:border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]`}
                >
                  {/* Background ambient flare */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${p.bgAccent} rounded-full blur-3xl opacity-60 pointer-events-none`} />

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white shadow-inner">
                          <p.icon className={`w-6 h-6 ${p.color}`} />
                        </div>
                        <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                          Pillar 0{idx + 1}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black tracking-tight text-white mb-1">
                        {p.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 mb-4 tracking-wide">
                        {p.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-[#98A0B3] font-normal leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: PRODUCT PHILOSOPHY (THE 6-STAGE PREPARATION LOOP)              */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Continuous Improvement</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Designed around the way <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">
                preparation actually works.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              Real rank improvements happen through a systematic feedback cycle. JEE PRO is engineered around this continuous 6-stage loop.
            </p>
          </div>

          {/* 6-Node Progression Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {loopSteps.map((node, i) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-[24px] p-6 bg-[#070E1E]/65 backdrop-blur-2xl border border-white/[0.1] hover:border-white/[0.2] shadow-lg flex flex-col justify-between items-center text-center group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Step Index Badge */}
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4">
                  Step {node.step}
                </span>

                <div className={`w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${node.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <node.icon className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-black text-white tracking-wider mb-1">
                    {node.name}
                  </h4>
                  <p className="text-[10px] text-[#98A0B3] leading-relaxed">
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
