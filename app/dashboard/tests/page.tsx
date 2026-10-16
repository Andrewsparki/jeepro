import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { FileText, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = constructMetadata({
  title: "Mock Tests & Simulators",
  description: "Timed 3-hour NTA-style test simulators for JEE Main & Advanced.",
  noIndex: true,
});

const UPCOMING_MOCKS = [
  {
    id: "main-mock-01",
    title: "JEE Main 2026 Full Syllabus Simulator 01",
    pattern: "NTA Pattern • 75 Questions • 300 Marks",
    duration: "180 Minutes",
    syllabus: "Complete Physics, Chemistry & Mathematics",
    status: "Available Soon",
    badge: "Full Test",
  },
  {
    id: "adv-paper-01",
    title: "JEE Advanced 2026 Paper 1 (Comprehensive)",
    pattern: "Multi-Correct + Numerical + Matrix Match",
    duration: "180 Minutes",
    syllabus: "High-yield Advanced difficulty mix",
    status: "In Calibration",
    badge: "Advanced",
  },
  {
    id: "adv-paper-02",
    title: "JEE Advanced 2026 Paper 2 (Deep Analytical)",
    pattern: "Paragraph Comprehension + Integer Type",
    duration: "180 Minutes",
    syllabus: "Core conceptual synthesis",
    status: "In Calibration",
    badge: "Advanced",
  },
];

export default function TestsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300 w-fit">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Official Examination Simulators</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Mock Test Arena</h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Simulate real 3-hour NTA examination conditions with verified question patterns, timer pressure, and speed telemetry.
          </p>
        </div>

        {/* NTA Standards Notice */}
        <div className="p-5 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Strict Examination Simulation</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              All upcoming test series follow official NTA marking schemes (+4, -1 for single-choice; partial scoring for multi-correct). Detailed velocity curves and error heatmaps generate automatically after each submission.
            </p>
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Scheduled Simulators</h2>

          <div className="grid gap-4">
            {UPCOMING_MOCKS.map((mock) => (
              <div
                key={mock.id}
                className="rounded-xl p-6 bg-[#090C15] border border-white/[0.08] hover:border-white/[0.16] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-white/[0.05] border border-white/[0.1] text-zinc-300">
                      {mock.badge}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {mock.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{mock.title}</h3>
                  <p className="text-xs text-zinc-400">{mock.pattern}</p>
                  <p className="text-xs text-zinc-500 font-mono">Syllabus: {mock.syllabus}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    {mock.status}
                  </span>
                  <Link
                    href="/dashboard/syllabus"
                    className="inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-medium border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-200 transition-colors"
                  >
                    Prepare Syllabus <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
