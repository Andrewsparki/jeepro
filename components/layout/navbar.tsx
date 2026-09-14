"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";
import { 
  Home, 
  Sparkles, 
  Layers, 
  FileText, 
  TrendingUp, 
  ArrowRight 
} from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";

const navItems = [
  { id: "home", title: "Home", href: "/", icon: Home },
  { id: "features", title: "Features", href: "/#features", icon: Sparkles },
  { id: "subjects", title: "Subjects", href: "/#subjects", icon: Layers },
  { id: "tests", title: "Tests", href: "/dashboard/tests", icon: FileText },
  { id: "progress", title: "Progress", href: "/#progress", icon: TrendingUp },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // ScrollSpy logic for landing page sections
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (pathname === "/") {
        const scrollPosition = window.scrollY + 200;

        const progressEl = document.getElementById("progress");
        const featuresEl = document.getElementById("features");
        const subjectsEl = document.getElementById("subjects");

        if (progressEl && scrollPosition >= progressEl.offsetTop) {
          setActiveSection("progress");
        } else if (featuresEl && scrollPosition >= featuresEl.offsetTop) {
          setActiveSection("features");
        } else if (subjectsEl && scrollPosition >= subjectsEl.offsetTop) {
          setActiveSection("subjects");
        } else {
          setActiveSection("home");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (pathname === "/" && item.href.startsWith("/#")) {
      e.preventDefault();
      const targetId = item.href.replace("/#", "");
      const el = document.getElementById(targetId);
      if (el) {
        scrollTo(el, { offset: -80 });
        setActiveSection(item.id);
        window.history.replaceState(null, "", item.href);
      }
    } else if (pathname === "/" && item.href === "/") {
      e.preventDefault();
      scrollTo(0);
      setActiveSection("home");
      window.history.replaceState(null, "", "/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 sm:py-5 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full p-1.5 sm:p-2 transition-all duration-300 max-w-5xl w-full",
          "bg-black/50 backdrop-blur-3xl backdrop-saturate-[180%] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]",
          scrolled && "bg-black/75 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        )}
      >
        {/* Left Side: JEE PRO Brand Mark */}
        <Link 
          href="/" 
          onClick={(e) => handleNavClick(e, navItems[0])}
          className="flex items-center gap-2 pl-3 pr-2 py-1 text-white hover:opacity-90 transition-opacity select-none group"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] group-hover:scale-125 transition-transform" />
          <span className="font-black text-sm tracking-tighter text-white">
            JEE <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">PRO</span>
          </span>
        </Link>

        {/* Navigation Items with Animated Gliding White Capsule */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar relative">
          {navItems.map((item) => {
            const isRouteActive = item.href === "/" 
              ? pathname === "/" && activeSection === "home"
              : item.href.startsWith("/#")
              ? pathname === "/" && activeSection === item.id
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "relative text-xs sm:text-sm font-semibold tracking-tight transition-colors duration-200 flex items-center gap-2 rounded-full whitespace-nowrap px-4 sm:px-5 py-2 z-10 select-none",
                  isRouteActive ? "text-black font-bold" : "text-white/70 hover:text-white"
                )}
              >
                {/* Physical Sliding White Capsule (layoutId) */}
                {isRouteActive && (
                  <motion.div
                    layoutId="navbar-active-capsule"
                    className="absolute inset-0 rounded-full bg-white shadow-md -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}

                {isRouteActive && <Icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Auth Actions */}
        <div className="flex items-center gap-2 pr-1">
          {/* Subtle Divider */}
          <div className="w-[1px] h-4 bg-white/15 mx-1 hidden xs:block" />

          {/* Sign In */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>

          {/* Start Free Dopamine CTA Pill */}
          <DopamineCTAButton
            href="/signup"
            variant="aurora"
            size="sm"
            className="px-4 py-1.5 font-black text-xs"
          >
            Start free
          </DopamineCTAButton>
        </div>
      </div>
    </header>
  );
}
