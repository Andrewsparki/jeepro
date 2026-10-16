import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-[#2B3342] bg-[#0B0D12]/95 backdrop-blur-2xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 pb-12 border-b border-[#2B3342]">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link 
              href="/" 
              aria-label="JEE Pro Home"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] rounded-lg w-fit"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-[#2B3342]">
                <BookOpen className="h-3.5 w-3.5 text-[#F5F7FB] stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#F5F7FB]">
                JEE <span className="font-semibold text-[#A4ADBB]">PRO</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#A4ADBB] max-w-sm leading-relaxed font-normal">
              A high-precision, distraction-free study operating system engineered specifically for JEE Main and Advanced aspirants.
            </p>
          </div>

          {/* Navigation Column 1: Platform Capabilities */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">Platform Features</Link>
              </li>
              <li>
                <Link href="/#subjects" className="hover:text-white transition-colors">Syllabus Architecture</Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-white transition-colors">Daily Study Protocol</Link>
              </li>
              <li>
                <Link href="/dashboard/focus" className="hover:text-white transition-colors">Deep Work Chamber</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Subjects */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">Syllabus</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/dashboard/study/physics" className="hover:text-white transition-colors">Physics (29 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/study/chemistry" className="hover:text-white transition-colors">Chemistry (30 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/study/mathematics" className="hover:text-white transition-colors">Mathematics (31 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/syllabus" className="hover:text-white transition-colors">Full Taxonomy</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About &amp; Mission</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing &amp; Access</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">Register Free</Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-white transition-colors">Support &amp; Feedback</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} JEE Pro. Engineered for serious aspirants.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Principles &amp; Cookies</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
