"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Atom, FlaskConical, Binary, ArrowUpRight, BookOpen, Layers } from "lucide-react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const subjects = [
  {
    id: "physics",
    title: "PHYSICS",
    tagline: "Track chapters, concepts, formulas and revision.",
    description: "From Classical Mechanics to Modern Physics and Electrodynamics. Master core derivations with formula memory anchors.",
    topics: ["Mechanics", "Electromagnetism", "Optics & Waves", "Thermodynamics", "Modern Physics"],
    chaptersCount: 29,
    icon: Atom,
    iconGlow: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]",
    cardGlow: "from-cyan-500/20 via-blue-500/5 to-transparent",
    glowColor: "rgba(6, 182, 212, 0.25)",
    border: "border-cyan-500/30",
    badgeColor: "text-cyan-300 border-cyan-500/30 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
    href: "/dashboard/study/physics",
  },
  {
    id: "chemistry",
    title: "CHEMISTRY",
    tagline: "Organize physical, organic and inorganic chemistry.",
    description: "Detailed reaction pathways, periodic periodicity, physical chemistry stoichiometry, and NCERT-aligned revision modules.",
    topics: ["Physical Chemistry", "Organic Mechanisms", "Inorganic Coordination", "Electrochemistry", "Polymers"],
    chaptersCount: 30,
    icon: FlaskConical,
    iconGlow: "bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    cardGlow: "from-purple-500/20 via-pink-500/5 to-transparent",
    glowColor: "rgba(168, 85, 247, 0.25)",
    border: "border-purple-500/30",
    badgeColor: "text-purple-300 border-purple-500/30 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    href: "/dashboard/study/chemistry",
  },
  {
    id: "mathematics",
    title: "MATHEMATICS",
    tagline: "Master concepts, practice problems and important questions.",
    description: "Deep problem sets across Differential Calculus, Integral Calculus, Vectors, 3D Geometry, and Advanced Algebra.",
    topics: ["Calculus", "Coordinate Geometry", "Vectors & 3D", "Algebra", "Trigonometry"],
    chaptersCount: 31,
    icon: Binary,
    iconGlow: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.4)]",
    cardGlow: "from-indigo-500/20 via-blue-500/5 to-transparent",
    glowColor: "rgba(99, 102, 241, 0.25)",
    border: "border-indigo-500/30",
    badgeColor: "text-indigo-300 border-indigo-500/30 bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    href: "/dashboard/study/mathematics",
  },
];

export function SubjectsSection() {
  return (
    <section id="subjects" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full pointer-events-none -z-10 transform-gpu" 
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.14) 0%, rgba(168,85,247,0.10) 40%, transparent 70%)",
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 mb-4 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Complete Architecture</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
            Your entire syllabus. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              One place.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
            Everything organized into structured chapters, high-yield concept summaries, formula decks, and categorized test sets.
          </p>
        </motion.div>

        {/* 3 Ultra-Glossy Magnetic Smoked Glass Subject Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {subjects.map((subj, idx) => (
            <motion.div
              key={subj.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: "easeOut" }}
            >
              <MagneticCard
                glowColor={subj.glowColor}
                tiltAmount={5}
                className={`p-7 sm:p-9 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/75 backdrop-blur-xl border ${subj.border} shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between h-full`}
              >
                {/* Internal Accent Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${subj.cardGlow} rounded-full blur-3xl opacity-50 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Header Icon & Chapter Count Badge */}
                  <div className="flex items-center justify-between mb-7">
                    <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center text-white ${subj.iconGlow}`}>
                      <subj.icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${subj.badgeColor}`}>
                      {subj.chaptersCount} Chapters
                    </span>
                  </div>

                  {/* Subject Title */}
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                    {subj.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs font-bold text-slate-200 mb-3 tracking-wide">
                    {subj.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6">
                    {subj.description}
                  </p>

                  {/* Topic Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {subj.topics.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-slate-100 font-semibold transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Link Footer */}
                <Link
                  href={subj.href}
                  className="relative z-10 inline-flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Explore {subj.title} syllabus</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-white transition-transform" />
                </Link>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
