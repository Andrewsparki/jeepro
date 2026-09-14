"use client";

import { useEffect, useState } from "react";
import { User, Palette, Play, ShieldAlert, Info, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "profile", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "study", label: "Practice & Study", icon: Play },
  { id: "privacy", label: "Privacy & Security", icon: ShieldAlert },
  { id: "about", label: "About", icon: Info },
  { id: "support", label: "Support & Creator", icon: Heart },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const { scrollTo } = useSmoothScroll();

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -40% 0px",
        threshold: 0
      }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      scrollTo(y);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full pb-32">
      {/* Top Horizontal Sub-Navigation Header with White Underline Active Indicator */}
      <div className="sticky top-20 z-30 pt-2 pb-4 bg-[#03060E]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-tight transition-all whitespace-nowrap",
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-white/60")} />
                <span>{label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Smoked Glass Content Cards */}
      <div className="flex flex-col gap-10">
        {children}
      </div>
    </div>
  );
}
