"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

const features = [
  {
    name: "Syllabus access",
    description: "Complete 90-chapter Physics, Chemistry & Maths curriculum",
    free: "Full access (90 chapters)",
    pro: "Full access (90 chapters)",
    proMax: "Full access (90 chapters)",
  },
  {
    name: "Chapter tracking",
    description: "5-stage mastery flags (Not Started, In Progress, Revised 1x, 2x, Mastered)",
    free: true,
    pro: true,
    proMax: true,
  },
  {
    name: "Progress telemetry",
    description: "Completion rates, study roadmaps, and topic status distribution",
    free: "Basic metrics",
    pro: "Deep telemetry",
    proMax: "Predictive insights",
  },
  {
    name: "Practice questions",
    description: "Curated problem sets categorized by difficulty & topic",
    free: "Daily practice",
    pro: "Unlimited",
    proMax: "Unlimited + Custom sets",
  },
  {
    name: "PYQ matrix",
    description: "10+ years of JEE Main and Advanced previous year questions",
    free: "Core chapters",
    pro: "Complete 10-year bank",
    proMax: "Complete bank + Trend filters",
  },
  {
    name: "Spaced revision queue",
    description: "Algorithmic spaced repetition schedule for formula retention",
    free: false,
    pro: true,
    proMax: "Adaptive memory decay engine",
  },
  {
    name: "Focus chamber",
    description: "Picture-in-Picture floating timer with 40Hz acoustic focus soundscapes",
    free: "Standard timer",
    pro: "Floating PiP + Audio",
    proMax: "Full chamber + Session notes",
  },
  {
    name: "Advanced analytics",
    description: "Time-per-question telemetry, error heatmaps, and weak-spot alerts",
    free: false,
    pro: true,
    proMax: "Advanced exam tier modeling",
  },
  {
    name: "Offline resilience",
    description: "Local client cache for sub-50ms transitions and unstable connection sync",
    free: true,
    pro: true,
    proMax: true,
  },
];

export function PricingComparison() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs font-mono text-zinc-300 mb-3">
            <span>DETAILED SPECIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Everything Compared.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
            A transparent overview of features across all preparation tiers.
          </p>
        </div>

        {/* Comparison Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Horizontally Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              
              {/* Table Head */}
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0B0F19]">
                  <th className="p-5 sm:p-6 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider w-[40%]">
                    Features
                  </th>
                  <th className="p-5 sm:p-6 text-center w-[20%]">
                    <span className="text-sm font-bold text-white block">FREE</span>
                    <span className="text-[11px] font-mono text-zinc-400">₹0</span>
                  </th>
                  <th className="p-5 sm:p-6 text-center w-[20%] bg-white/[0.02] border-x border-white/[0.06]">
                    <span className="text-sm font-bold text-white block">PRO</span>
                    <span className="text-[11px] font-mono text-emerald-400">Recommended</span>
                  </th>
                  <th className="p-5 sm:p-6 text-center w-[20%]">
                    <span className="text-sm font-bold text-white block">PRO MAX</span>
                    <span className="text-[11px] font-mono text-zinc-400">Single-Digit Ranks</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/[0.05]">
                {features.map((item) => (
                  <tr 
                    key={item.name} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5 sm:p-6">
                      <p className="text-sm font-semibold text-white tracking-tight">{item.name}</p>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{item.description}</p>
                    </td>

                    {/* Free Column */}
                    <td className="p-5 sm:p-6 text-center text-xs text-zinc-300">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-zinc-400 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-xs">{item.free}</span>
                      )}
                    </td>

                    {/* Pro Column */}
                    <td className="p-5 sm:p-6 text-center text-xs text-zinc-100 bg-white/[0.02] border-x border-white/[0.06] font-medium">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-zinc-400 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-xs text-zinc-200">{item.pro}</span>
                      )}
                    </td>

                    {/* Pro Max Column */}
                    <td className="p-5 sm:p-6 text-center text-xs text-zinc-300">
                      {typeof item.proMax === "boolean" ? (
                        item.proMax ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-zinc-400 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-xs">{item.proMax}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
