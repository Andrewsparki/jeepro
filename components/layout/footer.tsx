import Link from "next/link";
import { siteConfig } from "@/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-lg font-bold tracking-tight">
              {siteConfig.name}
            </span>
            <p className="text-sm text-slate-300 max-w-xs text-center md:text-left">
              The most premium JEE preparation platform ever created.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <Link
              href="/about"
              className="text-sm text-slate-300 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-300 hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-300 hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-300 hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
