import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#03060E]/80 backdrop-blur-2xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 pb-12 border-b border-white/[0.06]">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1EA7FF] via-[#7257FF] to-[#C958FF] p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#050A14]">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                JEE <span className="text-cyan-400 font-black">PRO</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#98A0B3] max-w-sm leading-relaxed font-normal">
              A high-precision, distraction-free study operating system engineered specifically for JEE Main and Advanced aspirants.
            </p>
          </div>

          {/* Navigation Column 1 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-xs text-[#98A0B3]">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              </li>
              <li>
                <Link href="#subjects" className="hover:text-white transition-colors">Subjects</Link>
              </li>
              <li>
                <Link href="/dashboard/tests" className="hover:text-white transition-colors">Mock Tests</Link>
              </li>
              <li>
                <Link href="/dashboard/focus" className="hover:text-white transition-colors">Focus Mode</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Syllabus</h5>
            <ul className="space-y-2 text-xs text-[#98A0B3]">
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
                <Link href="/dashboard/syllabus" className="hover:text-white transition-colors">Full Syllabus</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2 text-xs text-[#98A0B3]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#98A0B3]">
          <p>© {new Date().getFullYear()} JEE Pro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
