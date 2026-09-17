"use client";

import { useEffect, useState } from "react";
import { User, Palette, BookOpen, ShieldCheck, Info, Heart, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";

import { useSettings } from "@/providers/settings-provider";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "profile", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "study", label: "Study & Focus", icon: BookOpen },
  { id: "privacy", label: "Privacy & Data", icon: ShieldCheck },
  { id: "about", label: "About", icon: Info },
  { id: "support", label: "Creator", icon: Heart },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const { scrollTo } = useSmoothScroll();
  const { playSound } = useSettings();

  // Scroll spy to highlight active section in pill nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -40% 0px",
        threshold: 0,
      }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    playSound("nav-drop");
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      scrollTo(el, { offset: -140 });
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full pb-32">
      {/* Hero Header Banner */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border/60 w-fit backdrop-blur-xl dark:bg-white/[0.05] dark:border-white/10">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-foreground/80">
            System Preferences
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground font-normal mt-1 leading-relaxed max-w-xl">
              Personalize your workspace, privacy parameters, and study algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Frosted Capsule Sub-Navigation */}
      <div className="sticky top-20 z-30 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-1">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-card/85 backdrop-blur-2xl border border-border/80 shadow-medium dark:bg-[#0a0d14]/75 dark:border-white/[0.12] dark:shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18)]">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium tracking-tight rounded-full transition-all whitespace-nowrap cursor-pointer z-10 select-none",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Sliding Capsule Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsTabPill"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute inset-0 rounded-full bg-accent/15 border border-accent/30 shadow-xs dark:bg-white/[0.14] dark:border-white/20 dark:shadow-[0_2px_12px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.25)] -z-10"
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-accent dark:text-white" : "text-muted-foreground"
                    )}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Sections Container */}
      <div className="flex flex-col gap-10">
        {children}
      </div>
    </div>
  );
}
