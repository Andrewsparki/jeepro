"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";
import { 
  Home, 
  Sparkles, 
  Layers, 
  CreditCard, 
  Info,
} from "lucide-react";
import { DopamineCTAButton } from "@/components/ui/dopamine-cta-button";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { useSettings } from "@/providers/settings-provider";

const navItems = [
  { id: "home", title: "Home", href: "/", icon: Home },
  { id: "subjects", title: "Subjects", href: "/#subjects", icon: Layers },
  { id: "features", title: "Features", href: "/#features", icon: Sparkles },
  { id: "pricing", title: "Pricing", href: "/pricing", icon: CreditCard },
  { id: "about", title: "About", href: "/about", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const isClickNavigating = useRef(false);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSound } = useSettings();

  // Sync active section on initial mount or route change
  useEffect(() => {
    if (pathname !== "/") return;

    // On home page: handle initial hash if arrived from another page
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          setActiveSection(targetId);
          scrollTo(el, { offset: -80 });
        }, 50);
      }
    }

    const sectionIds = ["subjects", "features"];

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickNavigating.current) return;

      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the intersecting section closest to top of viewport
        visible.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top - 100) -
            Math.abs(b.boundingClientRect.top - 100)
        );
        setActiveSection(visible[0].target.id);
      } else if (window.scrollY < 300) {
        setActiveSection("home");
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-90px 0px -55% 0px",
      threshold: [0, 0.15, 0.5],
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const isPastThreshold = window.scrollY > 20;
      setScrolled(isPastThreshold);

      if (window.scrollY < 120 && !isClickNavigating.current) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [pathname, scrollTo]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    playSound("swish");
    if (pathname === "/" && item.href.startsWith("/#")) {
      e.preventDefault();
      const targetId = item.href.replace("/#", "");
      const el = document.getElementById(targetId);
      if (el) {
        isClickNavigating.current = true;
        setActiveSection(item.id);
        window.history.replaceState(null, "", item.href);
        scrollTo(el, { offset: -80 });

        if (clickTimeout.current) clearTimeout(clickTimeout.current);
        clickTimeout.current = setTimeout(() => {
          isClickNavigating.current = false;
        }, 900);
      }
    } else if (pathname === "/" && item.href === "/") {
      e.preventDefault();
      isClickNavigating.current = true;
      setActiveSection("home");
      window.history.replaceState(null, "", "/");
      scrollTo(0);

      if (clickTimeout.current) clearTimeout(clickTimeout.current);
      clickTimeout.current = setTimeout(() => {
        isClickNavigating.current = false;
      }, 900);
    } else {
      setActiveSection(item.id);
    }
  };

  return (
    <FixedPortal>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 py-3 sm:py-5 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-1 sm:gap-4 rounded-full p-1.5 sm:p-2 max-w-5xl w-full transform-gpu",
            "bg-[#030712]/80 backdrop-blur-md border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]",
            scrolled && "bg-[#030712]/95 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)]",
            "transition-colors duration-200"
          )}
        >
          {/* Left Side: JEE PRO Brand Mark */}
          <Link 
            href="/" 
            onClick={(e) => handleNavClick(e, navItems[0])}
            className="flex items-center gap-2 pl-2 sm:pl-3 pr-1 sm:pr-2 py-1 text-white hover:opacity-90 transition-opacity select-none group shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] group-hover:scale-125 transition-transform" />
            <span className="font-black text-xs sm:text-sm tracking-tighter text-white">
              JEE <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">PRO</span>
            </span>
          </Link>

          {/* Navigation Items with Animated Gliding White Capsule */}
          <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar relative px-1">
            {navItems.map((item) => {
              const isRouteActive = 
                item.href === "/"
                  ? pathname === "/" && activeSection === "home"
                  : item.href.startsWith("/#")
                  ? pathname === "/" && activeSection === item.id
                  : pathname === item.href;

              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "relative text-xs sm:text-sm font-medium tracking-tight transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 rounded-full whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 z-10 select-none",
                    isRouteActive ? "text-black font-semibold" : "text-white/70 hover:text-white"
                  )}
                >
                  {/* Physical Sliding White Capsule (layoutId) */}
                  {isRouteActive && (
                    <motion.div
                      layoutId="navbar-active-capsule"
                      className="absolute inset-0 rounded-full bg-white shadow-md -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 34,
                      }}
                    />
                  )}

                  <Icon className={cn("w-3.5 h-3.5 transition-colors duration-200", isRouteActive ? "text-black stroke-[2.5]" : "text-white/50")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Auth Actions */}
          <div className="flex items-center gap-1 sm:gap-2 pr-1 shrink-0">
            {/* Subtle Divider */}
            <div className="w-[1px] h-4 bg-white/15 mx-0.5 sm:mx-1 hidden xs:block" />

            {/* Sign In */}
            <Link
              href="/login"
              onClick={() => playSound("swish")}
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-white/80 hover:text-white px-2.5 sm:px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>

            {/* Start Free CTA Pill */}
            <DopamineCTAButton
              href="/signup"
              onClick={() => playSound("click")}
              variant="aurora"
              size="sm"
              className="px-3.5 sm:px-4 py-1.5 font-semibold text-xs"
            >
              Start free
            </DopamineCTAButton>
          </div>
        </div>
      </header>
    </FixedPortal>
  );
}
