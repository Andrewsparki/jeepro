"use client";

import Link from "next/link";
import { ArrowRight, Compass, Clock, CheckCircle2, RefreshCw } from "lucide-react";

const steps = [
  {
    phase: "01",
    time: "07:00 AM",
    title: "Calibrate & Queue",
    sub: "Morning Roadmap",
    description:
      "Open your personalized dashboard. Inspect which formulas are scheduled for spaced review today, view high-yield syllabus gaps, and set your targeted problem count.",
    icon: Compass,
    outcome: "Target: 2 High-Yield Chapters Selected",
  },
  {
    phase: "02",
    time: "09:00 AM",
    title: "Deep Work Sprint",
    sub: "Distraction-Free Focus",
    description:
      "Launch the Focus Chamber. Activate the Picture-in-Picture countdown to float directly over your problem PDF or mock test portal with 40Hz acoustic focus soundscapes.",
    icon: Clock,
    outcome: "Standard Block: 90 Minutes Uninterrupted",
  },
  {
    phase: "03",
    time: "02:00 PM",
    title: "PYQ Verification",
    sub: "Error Categorization",
    description:
      "Solve curated JEE Advanced past-year questions under timed exam constraints. Tag mistakes immediately as Conceptual, Calculation, or Time Pressure to build error diagnostics.",
    icon: CheckCircle2,
    outcome: "Target: >85% First-Pass Accuracy",
  },
  {
    phase: "04",
    time: "08:00 PM",
    title: "Spaced Retention Cycle",
    sub: "Evening Recall",
    description:
      "Clear the algorithmic review queue. Reinforce critical formula derivations at 24-hour, 3-day, 7-day, and 21-day intervals so zero concepts decay before exam day.",
    icon: RefreshCw,
    outcome: "Retention Rate: 92%+ Long-Term Recall",
  },
];

export function DailyRitualSection() {
  return (
    <section id="workflow" className="relative py-24 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Structural layout guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="mb-16 sm:mb-24 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-zinc-300 font-mono text-[11px] uppercase tracking-wider mb-6">
            <span>The Daily Protocol</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
            From Chaotic Cramming to Disciplined Execution.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
            Success in JEE Advanced is not about passive video watching. 
            It is about an unforgiving daily loop of targeted roadmap calibration, deep sprint focus, active error classification, and automated spaced formula retention.
          </p>
        </div>

        {/* Clean Typographic Process Stepper (No Nested Cards) */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.phase}
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Phase Number & Time Stamp */}
                <div className="lg:col-span-3 flex items-center lg:items-start gap-4">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-500">
                    {step.phase}
                  </span>
                  <div>
                    <span className="font-mono text-xs uppercase text-zinc-400 block">
                      {step.sub}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {step.time}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-6 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Telemetry Outcome Tag */}
                <div className="lg:col-span-3 flex lg:justify-end items-center">
                  <div className="px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-xs text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{step.outcome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Context Callout */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-zinc-400">
            SYSTEM DESIGN // CALIBRATED FOR 8-12 HOUR DAILY JEE PREPARATION CYCLES
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
          >
            <span>Begin your preparation protocol</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
