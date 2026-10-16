import { ReactNode } from "react";
import Link from "next/link";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { BrandLogo } from "@/features/dashboard/components/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0B0D12] text-[#F5F7FB] flex flex-col justify-between overflow-x-hidden selection:bg-[#78A9FF] selection:text-[#0B0D12]">
      {/* Zero-Video Obsidian Canvas Background */}
      <AmbientBackground variant="obsidian" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto h-20 flex items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] rounded-lg">
          <BrandLogo size="md" />
        </Link>

        {/* Top Right: System Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#2B3342] backdrop-blur-md text-xs font-mono text-[#A4ADBB] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#5DC98B] shadow-[0_0_8px_#5DC98B]" />
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        {children}
      </main>

      {/* Subtle Auth Footer */}
      <footer className="relative z-20 py-4 text-center text-xs font-mono text-zinc-400">
        JEE PRO // SECURE AUTHENTICATED ACCESS
      </footer>
    </div>
  );
}
