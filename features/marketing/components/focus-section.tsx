"use client";

import Link from "next/link";
import { ArrowRight, Check, X, ShieldCheck, Timer } from "lucide-react";

const comparisons = [
  {
    topic: "Advertising & Trackers",
    industry: "Banner ads, sponsored recommendations, and cookie retargeting",
    jeePro: "100% ad-free forever. Zero surveillance trackers or sponsored links",
  },
  {
    topic: "Social & Algorithmic Feeds",
    industry: "Infinite video feeds, public comment arguments, and influencer drama",
    jeePro: "Zero social feeds. Your screen is strictly dedicated to the syllabus",
  },
  {
    topic: "Study Timer Architecture",
    industry: "Browser-locked timers that stop working when you open a PDF",
    jeePro: "Native Picture-in-Picture timer that floats over any desktop window",
  },
  {
    topic: "Retention System",
    industry: "Passive quiz streaks designed to boost Daily Active User (DAU) metrics",
    jeePro: "Algorithmic Ebbinghaus spaced repetition targeting formula decay",
  },
  {
    topic: "Offline Capability",
    industry: "Full page reloads required on unstable hostel and mobile connections",
    jeePro: "Client-cached taxonomy with sub-50ms transitions and offline state",
  },
];

export function FocusSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Structural layout guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="mb-16 sm:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-zinc-300 font-mono text-[11px] uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Attention Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
            A Platform That Respects <br />
            Your Finite Attention.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
            Consumer learning apps are designed to maximize ad views and screen time through algorithmic dopamine loops. 
            JEE Pro was built with the opposite philosophy: zero distractions, pure study throughput, and complete cognitive focus.
          </p>
        </div>

        {/* Concrete Architectural Comparison Table */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 sm:px-8 py-5 border-b border-white/[0.08] bg-[#0B0F19] font-mono text-xs text-zinc-400 uppercase tracking-wider">
            <div className="md:col-span-3">System Dimension</div>
            <div className="md:col-span-4 text-zinc-400">Typical Consumer Platforms</div>
            <div className="md:col-span-5 text-white font-semibold">The JEE Pro Standard</div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-white/[0.06]">
            {comparisons.map((row) => (
              <div 
                key={row.topic} 
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 sm:px-8 py-5 items-center text-sm"
              >
                <div className="md:col-span-3 font-semibold text-white">
                  {row.topic}
                </div>

                <div className="md:col-span-4 flex items-start gap-2.5 text-zinc-400 text-xs sm:text-sm">
                  <X className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{row.industry}</span>
                </div>

                <div className="md:col-span-5 flex items-start gap-2.5 text-zinc-200 text-xs sm:text-sm font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{row.jeePro}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating PiP Feature Highlight Strip */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#0B0F19] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white shrink-0">
              <Timer className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Picture-in-Picture Floating Chamber
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-1">
                Keep your countdown timer and target question counter visible over full-screen PDF question papers, Irodov problems, or online mock tests without opening additional tabs.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/focus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Launch Focus Chamber</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
