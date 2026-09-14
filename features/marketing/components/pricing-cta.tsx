"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

export function PricingCTA() {
  return (
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
            <span>Join Serious JEE Aspirants</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Your preparation <br className="hidden sm:inline" />
            starts <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">here.</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto">
            Build consistency. Track your progress. Conquer the exam.
          </p>

          {/* High-Dopamine CTA Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <DopamineCTAButton
              href="/signup"
              variant="aurora"
              size="lg"
            >
              Start for free
            </DopamineCTAButton>
          </div>

          {/* Trust Line */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#98A0B3]/80 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No credit card required • Instant access to 90 chapters</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
