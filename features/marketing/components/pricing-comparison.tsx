"use client";

import { motion } from "framer-motion";
import { Check, Minus, Sparkles, HelpCircle } from "lucide-react";

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
    name: "Progress analytics",
    description: "Completion rates, study streaks, and topic status distribution",
    free: "Basic metrics",
    pro: "Deep telemetry",
    proMax: "Real-time AI insights",
  },
  {
    name: "Practice questions",
    description: "Curated problem sets categorized by difficulty & topic",
    free: "Limited / day",
    pro: "Unlimited",
    proMax: "Unlimited + Custom sets",
  },
  {
    name: "PYQ practice",
    description: "10+ years of JEE Main and Advanced previous year questions",
    free: "Selected questions",
    pro: "Complete 10-year bank",
    proMax: "Complete bank + Trend filters",
  },
  {
    name: "Mock tests",
    description: "Full-length 3-hour NTA-calibrated mock exam simulator",
    free: "1 Sample test",
    pro: "Unlimited tests",
    proMax: "Unlimited + National ranking",
  },
  {
    name: "Smart revision",
    description: "Algorithmic spaced repetition schedule for formula retention",
    free: false,
    pro: true,
    proMax: "Adaptive memory decay engine",
  },
  {
    name: "Focus mode",
    description: "Full-screen distraction-free timer with ambient soundscapes",
    free: "Standard timer",
    pro: "Full immersion mode",
    proMax: "Full immersion + Session notes",
  },
  {
    name: "Advanced analytics",
    description: "Time-per-question telemetry, error heatmaps, and weak-spot alerts",
    free: false,
    pro: true,
    proMax: "Predictive rank modeling",
  },
  {
    name: "Personalized planning",
    description: "Dynamic schedule generation balancing weak topics with exam date",
    free: false,
    pro: false,
    proMax: true,
  },
];

export function PricingComparison() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feature Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Everything compared.
          </h2>
          <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
            A transparent overview of features across all preparation tiers.
          </p>
        </div>

        {/* Comparison Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[32px] bg-[#070E1E]/65 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden"
        >
          {/* Top Glare Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Horizontally Scrollable Table for Mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              
              {/* Table Head */}
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="p-6 sm:p-7 text-sm font-bold text-white uppercase tracking-wider w-[40%]">
                    Features
                  </th>
                  <th className="p-6 sm:p-7 text-center w-[20%]">
                    <span className="text-sm font-bold text-white block">FREE</span>
                    <span className="text-[11px] text-[#98A0B3] font-medium">₹0</span>
                  </th>
                  <th className="p-6 sm:p-7 text-center w-[20%] bg-cyan-500/[0.04] border-x border-white/[0.06]">
                    <span className="text-sm font-bold text-cyan-300 block">PRO</span>
                    <span className="text-[11px] text-cyan-400/80 font-medium">Recommended</span>
                  </th>
                  <th className="p-6 sm:p-7 text-center w-[20%]">
                    <span className="text-sm font-bold text-purple-300 block">PRO MAX</span>
                    <span className="text-[11px] text-purple-400/80 font-medium">Ultimate Suite</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/[0.05]">
                {features.map((item, idx) => (
                  <tr 
                    key={item.name} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Feature Name & Description */}
                    <td className="p-5 sm:p-6 pl-6 sm:pl-7">
                      <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#98A0B3] mt-0.5 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </td>

                    {/* Free Column */}
                    <td className="p-5 sm:p-6 text-center text-xs">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto stroke-[2.5]" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium text-slate-300">{item.free}</span>
                      )}
                    </td>

                    {/* Pro Column */}
                    <td className="p-5 sm:p-6 text-center text-xs bg-cyan-500/[0.03] border-x border-white/[0.06]">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="w-4 h-4 text-cyan-400 mx-auto stroke-[2.5]" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-cyan-200">{item.pro}</span>
                      )}
                    </td>

                    {/* Pro Max Column */}
                    <td className="p-5 sm:p-6 text-center text-xs">
                      {typeof item.proMax === "boolean" ? (
                        item.proMax ? (
                          <Check className="w-4 h-4 text-purple-400 mx-auto stroke-[2.5]" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-purple-200">{item.proMax}</span>
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
