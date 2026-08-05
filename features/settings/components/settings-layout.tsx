"use client";

import { useEffect, useState } from "react";
import { UserCircle, Palette, BookOpen, ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "study", label: "Study Experience", icon: BookOpen },
  { id: "privacy", label: "Privacy & Data", icon: ShieldAlert },
  { id: "about", label: "About", icon: Info },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const { scrollTo } = useSmoothScroll();

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to find the highest visible one
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -40% 0px", // Detect when it hits the top 100px mark
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
    const el = document.getElementById(id);
    if (el) {
      // Get the container with custom scrollbar, fallback to window
      const scrollContainer = document.querySelector('[data-scroll-container]') || window;
      const yOffset = -100; // Account for any fixed headers
      const y = el.getBoundingClientRect().top + (scrollContainer === window ? window.pageYOffset : (scrollContainer as HTMLElement).scrollTop) + yOffset;
      
      scrollTo(y);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto w-full pb-24">
      {/* Sidebar Navigation */}
      <aside className="md:w-64 shrink-0">
        <div className="sticky top-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                activeSection === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", activeSection === id ? "text-primary" : "opacity-70")} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-24 pt-2">
        {children}
      </div>
    </div>
  );
}
