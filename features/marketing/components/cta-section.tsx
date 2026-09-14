"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-visible">
      {/* Radiant Glowing Ambient Halo Behind CTA */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.6, 0.35]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[850px] h-[400px] bg-gradient-to-r from-cyan-500/25 via-purple-600/30 to-blue-500/25 rounded-full blur-[120px] pointer-events-none transform-gpu" 
      />

      <div className="relative mx-auto max-w-4xl flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Start Your Preparation System Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Ready to conquer <br className="hidden sm:inline" />
            the <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(56,189,248,0.5)]">exam?</span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
            Everything you need to turn preparation into progress. Join thousands of serious aspirants preparing with high precision.
          </p>

          {/* High-Dopamine CTA Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <DopamineCTAButton
              href="/signup"
              variant="aurora"
              size="lg"
            >
              Start studying
            </DopamineCTAButton>
          </div>

          <p className="text-xs text-slate-400 pt-2 font-medium">
            Free forever • No credit card required • Instant access
          </p>
        </motion.div>
      </div>
    </section>
  );
}
