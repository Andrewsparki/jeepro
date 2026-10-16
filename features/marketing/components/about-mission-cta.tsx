"use client";

import { motion } from "framer-motion";
import { Compass, Wrench, BarChart2, Moon } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

export function AboutMissionCTA() {
  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* ========================================================================= */}
      {/* SECTION 8: MISSION                                                        */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl p-8 sm:p-14 lg:p-16 bg-[#090C15] border border-white/[0.08] text-center shadow-sm"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 backdrop-blur-xl">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <span>Our Mission</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Make serious preparation feel simpler.
              </h2>

              <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
                JEE preparation is already demanding enough. Your software environment should eliminate friction, not create it.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: FUTURE VISION (STILL BUILDING)                                 */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 mb-3 backdrop-blur-xl">
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span>Continuous Engineering</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Still building.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              JEE Pro is continuously evolving around the genuine day-to-day needs of serious aspirants.
            </p>
          </div>

          {/* 3 Vision Obsidian Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="p-7 sm:p-8 rounded-xl bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">BETTER TOOLS</h4>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                Refined ways to practice, categorize conceptual errors, and automate spaced repetition intervals.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="p-7 sm:p-8 rounded-xl bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">BETTER TELEMETRY</h4>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                Direct, actionable telemetry from practice sessions, accuracy splits, and problem resolution speed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="p-7 sm:p-8 rounded-xl bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">BETTER FOCUS</h4>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                A serene, high-contrast dark environment engineered to support prolonged deep concentration.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: FINAL CTA                                                     */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center overflow-visible">
        <div className="relative mx-auto max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-zinc-300 backdrop-blur-xl">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>Begin Your Preparation</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Your preparation deserves a system.
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              Start building structured study habits with JEE Pro today.
            </p>

            {/* High-Contrast Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <DopamineCTAButton
                href="/signup"
                variant="electric-white"
                size="lg"
              >
                Start for free
              </DopamineCTAButton>
              
              <DopamineCTAButton
                href="/#subjects"
                variant="neon-glass"
                size="lg"
              >
                Explore syllabus matrix
              </DopamineCTAButton>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
