"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";
import Link from "next/link";

export function PricingCTA() {
  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="relative mx-auto max-w-4xl flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs font-mono text-zinc-300">
            <span>START YOUR SYSTEM</span>
          </div>

          {/* Solid White Heading */}
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Begin Your Preparation with <br />
            Mathematical Precision.
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
            Build consistency, eliminate distractions, and master all 90 chapters.
          </p>

          {/* CTA Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <DopamineCTAButton
              href="/signup"
              variant="electric-white"
              size="lg"
              className="px-8 font-semibold text-sm"
            >
              Launch Free Workspace
            </DopamineCTAButton>

            <Link
              href="/login"
              className="h-13 px-8 text-sm inline-flex items-center justify-center rounded-full font-semibold text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Trust Line */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 pt-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free &amp; Open Syllabus • No Credit Card Required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
