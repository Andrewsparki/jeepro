"use client";

import { motion } from "framer-motion";
import { Layers, Target, Compass, CheckCircle2 } from "lucide-react";

const pillars = [
  {
    id: "clutter-free",
    title: "Study without clutter",
    tagline: "Everything important stays in one place.",
    description: "Say goodbye to scattered PDFs, unorganized notes, and confusing forums. Your entire 90-chapter syllabus, theory highlights, formula anchors, and active test records are unified in one physical workspace.",
    icon: Layers,
    badge: "Clarity",
    highlights: ["Unified 90-chapter curriculum", "Integrated formula reference", "Zero distracting advertisements"],
  },
  {
    id: "analytics",
    title: "Know what to fix",
    tagline: "Performance analytics show where you're losing marks.",
    description: "Stop guessing your readiness. High-precision telemetry tracks your accuracy curves across question difficulties, monitors time spent per calculation, and pinpoints conceptual weak spots before test day.",
    icon: Target,
    badge: "Telemetry",
    highlights: ["Speed vs. Accuracy breakdown", "Error classification diagnostics", "Chapter mastery scorecards"],
  },
  {
    id: "systematic",
    title: "Prepare with intent",
    tagline: "Track chapters, practice, revise and test yourself systematically.",
    description: "Follow a structured, proven progression model. Advance each chapter across 5 mastery tiers, lock in formulas with spaced repetition, and simulate real testing conditions.",
    icon: Compass,
    badge: "Execution",
    highlights: ["5-stage mastery tracking", "Spaced-repetition review triggers", "Timed problem sets"],
  },
];

export function PricingWhy() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs font-mono text-zinc-300 mb-4">
            <span>ENGINEERED FOR RIGOR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Why Aspirants Build on JEE Pro.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
            Three principles behind the preparation platform designed specifically for the cognitive demands of JEE Advanced.
          </p>
        </motion.div>

        {/* 3 Value Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-300 uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-mono text-zinc-400 mb-4">
                    {pillar.tagline}
                  </p>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  {pillar.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
