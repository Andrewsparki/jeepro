"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Volume2, 
  Maximize2, 
  ChevronRight,
  Layers,
  Clock,
  CheckSquare
} from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

type ActiveTab = "syllabus" | "focus" | "pyq";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("syllabus");

  return (
    <section className="relative pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-32 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Structural hairline vertical guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="mx-auto max-w-6xl w-full flex flex-col items-center text-center">
        
        {/* Monospaced Identification Tag */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#2B3342] bg-[#121722]/85 px-4 py-1.5 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-[#78A9FF] shadow-[0_0_8px_#78A9FF]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#A4ADBB]">
            JEE Advanced &amp; Main 2026 // Study Operating System
          </span>
        </div>

        {/* Primary Editorial Headline */}
        <h1 className="mb-6 max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FB] leading-[1.08]">
          The Focused Study Operating System for JEE Main &amp; Advanced.
        </h1>

        {/* Concrete Supporting Value Proposition */}
        <p className="mb-10 max-w-2xl text-base sm:text-lg text-[#A4ADBB] font-normal leading-relaxed">
          Engineered for serious aspirants drowning in disorganized PDFs and ad-heavy video platforms. 
          Track all 90 chapters, review decaying formulas on an automated spaced schedule, and study inside a zero-distraction focus chamber.
        </p>

        {/* Primary & Secondary Action Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
          <DopamineCTAButton
            href="/signup"
            variant="aurora"
            size="md"
            className="w-full sm:w-auto px-8 font-bold text-sm"
          >
            Launch Free Workspace
          </DopamineCTAButton>

          <Link
            href="/#subjects"
            className="w-full sm:w-auto h-11 px-7 inline-flex items-center justify-center rounded-full text-sm font-semibold text-[#F5F7FB] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-[#2B3342] hover:border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF]"
          >
            Explore 90-Chapter Syllabus
          </Link>
        </div>

        {/* Engineering Specification Strip */}
        <div className="mb-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl w-full text-left sm:text-center py-4 border-y border-[#2B3342]">
          <div>
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Chapter Taxonomy</div>
            <div className="text-sm font-semibold text-zinc-100 mt-0.5">90 Full Chapters</div>
          </div>
          <div>
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Subject Coverage</div>
            <div className="text-sm font-semibold text-zinc-100 mt-0.5">Phys (29) • Chem (30) • Math (31)</div>
          </div>
          <div>
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Retention Engine</div>
            <div className="text-sm font-semibold text-zinc-100 mt-0.5">Algorithmic Spaced Recall</div>
          </div>
          <div>
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Attention Hygiene</div>
            <div className="text-sm font-semibold text-zinc-100 mt-0.5">Zero Ads • Zero Social Feeds</div>
          </div>
        </div>

        {/* Authentic Product Viewport Preview */}
        <div className="w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#090C15] shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden text-left">
          {/* Window Frame Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0B0F19]">
            {/* Window Dots & Navigation URL */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="h-3 w-3 rounded-full bg-[#EF4444]/80" />
                <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
                <div className="h-3 w-3 rounded-full bg-[#10B981]/80" />
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
                <span className="text-zinc-500">https://</span>
                <span className="text-zinc-200">jeepro.app/workspace/study</span>
              </div>
            </div>

            {/* Interactive Preview View Switcher */}
            <div 
              role="tablist" 
              aria-label="JEE Pro product views" 
              className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]"
            >
              <button
                type="button"
                role="tab"
                id="tab-syllabus"
                aria-selected={activeTab === "syllabus"}
                aria-controls="panel-syllabus"
                onClick={() => setActiveTab("syllabus")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                  activeTab === "syllabus"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Syllabus Workspace</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-focus"
                aria-selected={activeTab === "focus"}
                aria-controls="panel-focus"
                onClick={() => setActiveTab("focus")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                  activeTab === "focus"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Focus Chamber</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-pyq"
                aria-selected={activeTab === "pyq"}
                aria-controls="panel-pyq"
                onClick={() => setActiveTab("pyq")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                  activeTab === "pyq"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>PYQ Matrix</span>
              </button>
            </div>

            {/* Session Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ACTIVE SESSION</span>
            </div>
          </div>

          {/* Interactive Dynamic Workspace Screen */}
          <div className="p-5 sm:p-8 min-h-[420px] bg-[#07090F]">
            <AnimatePresence mode="wait">
              {activeTab === "syllabus" && (
                <motion.div
                  key="syllabus"
                  role="tabpanel"
                  id="panel-syllabus"
                  aria-labelledby="tab-syllabus"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Workspace Header Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
                        <span>PHYSICS</span>
                        <span>•</span>
                        <span>MECHANICS</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">HIGH YIELD (8.4%)</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Chapter 07: Rotational Dynamics &amp; Inertia Tensors
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-zinc-400 font-mono">Mastery Level</span>
                        <p className="text-lg font-bold text-white font-mono">84%</p>
                      </div>
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout: Concept Tree + Formula Memory Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Cols: Concept Checklist */}
                    <div className="lg:col-span-7 space-y-3">
                      <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                        Concept Breakdown &amp; Scheduled Review
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-zinc-200">
                              Moment of Inertia &amp; Parallel/Perpendicular Axis Theorems
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                            MASTERED
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-zinc-200">
                              Torque &amp; Conservation of Angular Momentum (L = Iω)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                            REVIEW IN 2D
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="text-xs font-medium text-zinc-200">
                              Pure Rolling Motion on Inclined Plane &amp; Friction Work
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                            IN PROGRESS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Cols: Formula Anchor & Derivation Deck */}
                    <div className="lg:col-span-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono text-zinc-400">FORMULA ANCHOR #04</span>
                          <span className="text-[10px] font-mono text-zinc-400">HIGH RETENTION PRIORITY</span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-2">Acceleration of Rolling Body</p>
                        <div className="p-3 rounded-lg bg-black border border-white/[0.1] font-mono text-xs text-zinc-200 mb-3">
                          a_cm = (g · sin θ) / (1 + I_cm / M·R²)
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          For solid sphere, I_cm = (2/5)MR² → a = (5/7)g sin θ.
                          Static friction force f_s prevents slipping without dissipating mechanical energy.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                        <span>42 Historical Questions Mapped</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "focus" && (
                <motion.div
                  key="focus"
                  role="tabpanel"
                  id="panel-focus"
                  aria-labelledby="tab-focus"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-2xl bg-black border border-white/[0.08] text-center max-w-xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>FOCUS CHAMBER // TIMER RUNNING</span>
                    </div>

                    <div className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight my-4">
                      48:22
                    </div>

                    <p className="text-xs text-zinc-300 mb-6 font-mono">
                      SESSION TARGET: 15 ADVANCED MULTI-CORRECT PROBLEMS
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300">
                        <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Acoustic: 40Hz Alpha Frequency</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300">
                        <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Picture-in-Picture Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "pyq" && (
                <motion.div
                  key="pyq"
                  role="tabpanel"
                  id="panel-pyq"
                  aria-labelledby="tab-pyq"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-5 sm:p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                        JEE ADVANCED 2024 • PAPER 1
                      </span>
                      <span>DIFFICULTY: HIGH • MULTI-CORRECT (+4, -2)</span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      A uniform ring of mass M and radius R rolls without slipping on a horizontal surface with linear velocity v₀. It then encounters a rough inclined plane of angle θ = 30°...
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <span>(A) Maximum height reached h = v₀² / g</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <span>(B) Time to reach crest t = 2v₀ / (g sin θ)</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <span>(C) Net mechanical energy is conserved</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <span>(D) Angular momentum about contact point</span>
                        <span className="text-zinc-400">○ Incorrect</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.06]">
                      <span className="font-mono">ERROR CLASSIFICATION: CONCEPTUAL • TIME SPENT: 2M 48S</span>
                      <span className="text-emerald-400 font-semibold">+4 MARKS RECORDED</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
