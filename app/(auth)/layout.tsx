import { ReactNode } from "react";
import Link from "next/link";
import { AmbientBackground } from "@/components/layout/ambient-background";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#F5F7FF] flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Cinematic Ambient Background Environment */}
      <AmbientBackground />

      {/* Top Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto h-20 flex items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          {/* Glowing Faceted Icon Symbol */}
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EA7FF] via-[#7257FF] to-[#C958FF] p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#081020]/90 rounded-[7px] flex items-center justify-center backdrop-blur-md">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
            JEE <span className="text-cyan-400 font-black">PRO</span>
          </span>
        </Link>

        {/* Top Right: System Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-xs font-medium text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#55E6A5] shadow-[0_0_8px_#55E6A5] animate-pulse" />
          <span>System online</span>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
