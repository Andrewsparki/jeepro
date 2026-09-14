"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers, Target, Compass, CheckCircle2 } from "lucide-react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const pillars = [
  {
    id: "clutter-free",
    title: "Study without clutter",
    tagline: "Everything important stays in one place.",
    description: "Say goodbye to scattered PDFs, unorganized notes, and confusing forums. Your entire 90-chapter syllabus, theory highlights, formula anchors, and active test records are unified in one physical workspace.",
    icon: Layers,
    badge: "Clarity",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    glowColor: "rgba(6, 182, 212, 0.22)",
    accentColor: "from-cyan-500/20 via-blue-500/10 to-transparent",
    highlights: ["Unified 90-chapter curriculum", "Integrated formula reference", "Zero distracting advertisements"],
  },
  {
    id: "analytics",
    title: "Know what to fix",
    tagline: "Performance analytics show where you're losing marks.",
    description: "Stop guessing your readiness. High-precision telemetry tracks your accuracy curves across question difficulties, monitors time spent per calculation, and pinpoints conceptual weak spots before test day.",
    icon: Target,
    badge: "Telemetry",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    glowColor: "rgba(168, 85, 247, 0.22)",
    accentColor: "from-purple-500/20 via-indigo-500/10 to-transparent",
    highlights: ["Speed vs. Accuracy breakdown", "Weak-spot vulnerability alerts", "Chapter mastery scorecards"],
  },
  {
    id: "systematic",
    title: "Prepare with intent",
    tagline: "Track chapters, practice, revise and test yourself systematically.",
    description: "Follow a structured, proven progression model. Advance each chapter across 5 mastery tiers, lock in formulas with spaced repetition, and simulate real NTA testing conditions with 3-hour mocks.",
    icon: Compass,
    badge: "Execution",
    badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    glowColor: "rgba(99, 102, 241, 0.22)",
    accentColor: "from-indigo-500/20 via-cyan-500/10 to-transparent",
    highlights: ["5-stage mastery tracking", "Spaced-repetition review triggers", "Full-length 3-hour NTA simulator"],
  },
];

export function PricingWhy() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#c084fc] mb-3 backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Built around your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">
              preparation.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
            Everything in JEE PRO is engineered to replace chaos with focus and turn daily effort into measurable percentile gains.
          </p>
        </motion.div>

        {/* 3 Value Pillars with Magnetic 3D Cursor Physics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
            >
              <MagneticCard
                glowColor={item.glowColor}
                tiltAmount={7}
                className="p-8 sm:p-9 bg-[#070E1E]/65 backdrop-blur-2xl border border-white/[0.12] hover:border-white/[0.22] shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col justify-between h-full"
              >
                {/* Background ambient corner flare */}
                <div className={`absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl ${item.accentColor} rounded-full blur-3xl opacity-60 pointer-events-none`} />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* Header Icon & Badge */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-cyan-400">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-300 mb-4 tracking-wide">
                      {item.tagline}
                    </p>

                    {/* Body Text */}
                    <p className="text-xs sm:text-sm text-[#98A0B3] font-normal leading-relaxed mb-8">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights Checklist */}
                  <div className="pt-6 border-t border-white/[0.08] space-y-2.5">
                    {item.highlights.map((hl) => (
                      <div key={hl} className="flex items-center gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
