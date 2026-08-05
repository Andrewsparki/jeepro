"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { marketingNav } from "@/constants/navigation";
import { Logo } from "@/components/shared/logo";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Logo />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-all duration-300 hover:-translate-y-0.5",
                pathname === item.href
                  ? "text-foreground drop-shadow-sm"
                  : "text-slate-300 hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-foreground transition-all duration-300 hover:-translate-y-0.5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-2 text-sm font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-foreground/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
