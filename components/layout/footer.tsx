import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background/95 backdrop-blur-2xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 pb-12 border-b border-border">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link 
              href="/" 
              aria-label="JEE Pro Home"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg w-fit"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border">
                <BookOpen className="h-3.5 w-3.5 text-foreground stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                JEE <span className="font-semibold text-muted-foreground">PRO</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed font-normal">
              A high-precision, distraction-free study operating system engineered specifically for JEE Main and Advanced aspirants.
            </p>
          </div>

          {/* Navigation Column 1: Platform Capabilities */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">Platform Features</Link>
              </li>
              <li>
                <Link href="/#subjects" className="hover:text-foreground transition-colors">Syllabus Architecture</Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-foreground transition-colors">Daily Study Protocol</Link>
              </li>
              <li>
                <Link href="/dashboard/focus" className="hover:text-foreground transition-colors">Deep Work Chamber</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Subjects */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">Syllabus</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/dashboard/study/physics" className="hover:text-foreground transition-colors">Physics (29 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/study/chemistry" className="hover:text-foreground transition-colors">Chemistry (30 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/study/mathematics" className="hover:text-foreground transition-colors">Mathematics (31 Ch)</Link>
              </li>
              <li>
                <Link href="/dashboard/syllabus" className="hover:text-foreground transition-colors">Full Taxonomy</Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">About &amp; Mission</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing &amp; Access</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">Register Free</Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-foreground transition-colors">Support &amp; Feedback</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} JEE Pro. Engineered for serious aspirants.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Principles &amp; Cookies</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
