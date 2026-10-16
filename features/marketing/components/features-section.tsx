"use client";

import { 
  Zap, 
  Command, 
  Moon, 
  Sparkles, 
  Keyboard
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background vertical guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="mb-16 sm:mb-24 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-zinc-300 font-mono text-[11px] uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Engineered to Remove Every Point of Study Friction.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
            A software experience built with the responsiveness of a desktop application. 
            Zero page-load delays, sub-millisecond keyboard navigation, and calibrated contrast for long study sessions.
          </p>
        </div>

        {/* Varied Asymmetric Technical Composition */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Feature 1: Wide Technical Specification Banner — Instant Navigation */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RUNTIME PERFORMANCE</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Sub-50ms Chapter Switching &amp; Instant State
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                  Traditional web platforms force full page reloads every time you open a derivation or switch chapters. 
                  JEE Pro runs on an optimized client cache with instant state persistence. Jump between 90 chapters without hydration spinners or layout shifts.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Sub-50ms Route Transitions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Local Cache Persistence
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Zero Layout Jitter
                  </span>
                </div>
              </div>

              {/* Graphic Terminal Representation */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-black border border-white/[0.08] font-mono text-xs text-zinc-300 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-zinc-400 text-[11px]">
                  <span>ENGINE BENCHMARK // LATENCY</span>
                  <span className="text-emerald-400">STATUS: OPTIMAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Route Switching</span>
                  <span className="text-white font-bold">&lt; 32 ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Formula Render Latency</span>
                  <span className="text-white font-bold">&lt; 4 ms (KaTeX Engine)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Telemetry Sync</span>
                  <span className="text-white font-bold">Realtime WebSockets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Offline Resilience</span>
                  <span className="text-emerald-400 font-bold">Client Cached</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 & 3: Two Split Ergonomic Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Split A: Universal Command Palette (Cmd + K) */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white mb-6">
                  <Command className="w-5 h-5 text-zinc-200" />
                </div>

                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-400 uppercase">
                  <span>KEYBOARD FIRST ERGONOMICS</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                  Universal Command Palette
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-6">
                  Never take your hands off the keyboard. Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.14] text-xs font-mono text-zinc-200">Cmd + K</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.14] text-xs font-mono text-zinc-200">Ctrl + K</kbd>) anywhere in the workspace to instantly search any chapter, formula anchor, or past mock test.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black border border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-zinc-400" />
                  <span>Type &quot;Rotational Dynamics&quot;</span>
                </span>
                <span className="text-zinc-200 font-semibold">Jump ↵</span>
              </div>
            </div>

            {/* Split B: Multi-Theme Contrast Engine */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white mb-6">
                  <Moon className="w-5 h-5 text-zinc-200" />
                </div>

                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-400 uppercase">
                  <span>CIRCADIAN ERGONOMICS</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                  Calibrated Dark Themes
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-6">
                  Designed for 12-hour preparation days. Toggle between Midnight (deep slate contrast), AMOLED (true 0-nit pure black for OLED displays to save battery and eye strain), and Titanium for neutral daytime problem solving.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-zinc-400">
                <div className="p-2.5 rounded-lg bg-[#0F1420] border border-white/[0.1] text-white font-medium">
                  Midnight
                </div>
                <div className="p-2.5 rounded-lg bg-black border border-white/[0.1] text-zinc-200 font-medium">
                  AMOLED 0-Nit
                </div>
                <div className="p-2.5 rounded-lg bg-[#141518] border border-white/[0.1] text-zinc-400 font-medium">
                  Titanium
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
