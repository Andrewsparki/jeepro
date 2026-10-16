"use client";

import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative pt-32 sm:pt-44 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background vertical guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-4xl flex flex-col items-center">
        <div className="space-y-8 flex flex-col items-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2B3342] bg-[#121722]/85 text-[#A4ADBB] font-mono text-[11px] uppercase tracking-wider">
            <span>Begin Your Preparation Protocol</span>
          </div>

          {/* Solid White Heading */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FB] leading-[1.08] max-w-3xl">
            Stop Fighting Distraction. <br />
            Master the Syllabus.
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#A4ADBB] font-normal leading-relaxed max-w-xl mx-auto">
            Everything you need to turn chaotic preparation into structured progress. 
            Join serious aspirants preparing with mathematical clarity.
          </p>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <DopamineCTAButton
              href="/signup"
              variant="aurora"
              size="lg"
              className="w-full sm:w-auto px-8 font-bold text-sm"
            >
              Launch Free Workspace
            </DopamineCTAButton>

            <Link
              href="/login"
              className="h-13 px-8 text-sm inline-flex items-center justify-center rounded-full font-semibold text-[#F5F7FB] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-[#2B3342] hover:border-white/20 transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF]"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Truthful Trust Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#A4ADBB]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#78A9FF]" />
              100% Free &amp; Open Syllabus
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-zinc-400" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-zinc-400" />
              Instant Browser Access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
