"use client";

import { motion } from "framer-motion";
import { Sparkles, Compass, Wrench, BarChart2, Moon } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

export function AboutMissionCTA() {
  return (
    <div className="space-y-28 sm:space-y-36">
      
      {/* ========================================================================= */}
      {/* SECTION 8: MISSION                                                        */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[36px] sm:rounded-[48px] p-8 sm:p-14 lg:p-16 bg-[#070E1E]/60 backdrop-blur-3xl border border-white/[0.14] shadow-[0_30px_100px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] text-center overflow-hidden"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Ambient Radial Flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-semibold text-cyan-400 backdrop-blur-xl">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OUR MISSION</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Make serious preparation <br />
                <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">
                  feel simpler.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[#98A0B3] font-normal leading-relaxed">
                JEE preparation is already demanding enough. The platform should not add another layer of complexity.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: FUTURE VISION (STILL BUILDING)                                 */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
              <Compass className="w-3.5 h-3.5" />
              <span>Continuous Evolution</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Still building.
            </h2>
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              JEE PRO is continuously evolving around the real day-to-day needs of serious aspirants.
            </p>
          </div>

          {/* 3 Vision Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-[28px] bg-[#070E1E]/60 backdrop-blur-2xl border border-white/[0.1] shadow-lg space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">BETTER TOOLS</h4>
              <p className="text-xs sm:text-sm text-[#98A0B3] leading-relaxed">
                Smarter ways to practice, categorize past mistakes, and automate formula revision cycles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-[28px] bg-[#070E1E]/60 backdrop-blur-2xl border border-white/[0.1] shadow-lg space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">BETTER INSIGHT</h4>
              <p className="text-xs sm:text-sm text-[#98A0B3] leading-relaxed">
                More useful, actionable feedback from your mock exams and calculation velocity curves.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-[28px] bg-[#070E1E]/60 backdrop-blur-2xl border border-white/[0.1] shadow-lg space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">BETTER FOCUS</h4>
              <p className="text-xs sm:text-sm text-[#98A0B3] leading-relaxed">
                A calmer, more serene study environment engineered to keep you in flow state longer.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: FINAL CTA                                                     */}
      {/* ========================================================================= */}
      <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 text-center overflow-visible">
        {/* Giant Ambient Glow Flare */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[400px] bg-gradient-to-r from-cyan-500/20 via-purple-600/25 to-blue-500/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.12] bg-[#070E1E]/60 text-xs font-semibold text-cyan-400 backdrop-blur-xl shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Begin Your Journey</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Your preparation <br className="hidden sm:inline" />
              deserves a <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">system.</span>
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
              Start building better study habits with JEE PRO.
            </p>

            {/* High Dopamine Buttons (Image 3) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-5">
              <DopamineCTAButton
                href="/signup"
                variant="aurora"
                size="lg"
              >
                Start for free
              </DopamineCTAButton>
              
              <DopamineCTAButton
                href="/#features"
                variant="neon-glass"
                size="lg"
              >
                Explore features
              </DopamineCTAButton>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
