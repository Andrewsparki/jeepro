"use client";

import { useState } from "react";
import {
  User,
  Palette,
  BookOpen,
  Volume2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { ProfileSection } from "./sections/profile-section";
import { AppearanceSection } from "./sections/appearance-section";
import { StudyExperienceSection } from "./sections/study-experience-section";
import { SoundNotificationSection } from "./sections/sound-notification-section";
import { PrivacySection } from "./sections/privacy-section";
import { AboutSection } from "./sections/about-section";
import { PerformanceSection } from "./sections/performance-section";
import { Zap } from "lucide-react";

export type SettingsTabId =
  | "account"
  | "appearance"
  | "performance"
  | "study"
  | "notifications"
  | "privacy"
  | "about";

interface SettingsCategory {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: React.ElementType;
}

const CATEGORIES: SettingsCategory[] = [
  {
    id: "account",
    label: "Account",
    description: "Profile, exam target, and annual milestones",
    icon: User,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Themes, layouts, and display viewports",
    icon: Palette,
  },
  {
    id: "performance",
    label: "Performance & Effects",
    description: "Hardware presets, animations, and low-end PC optimization",
    icon: Zap,
  },
  {
    id: "study",
    label: "Study & Focus",
    description: "Focus chamber, auto-sync, and break cues",
    icon: BookOpen,
  },
  {
    id: "notifications",
    label: "Sound & Alerts",
    description: "Acoustic feedback, volume, and toast alerts",
    icon: Volume2,
  },
  {
    id: "privacy",
    label: "Privacy & Data",
    description: "Data export, cloud sync, and danger zone",
    icon: ShieldCheck,
  },
  {
    id: "about",
    label: "About & Platform",
    description: "System build, runtime specs, and support",
    icon: Info,
  },
];

const SECTION_COMPONENTS: Record<SettingsTabId, React.ComponentType> = {
  account: ProfileSection,
  appearance: AppearanceSection,
  performance: PerformanceSection,
  study: StudyExperienceSection,
  notifications: SoundNotificationSection,
  privacy: PrivacySection,
  about: AboutSection,
};

export function SettingsLayout({
  initialTab = "account",
}: {
  initialTab?: SettingsTabId;
} = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  const currentCategory =
    CATEGORIES.find((cat) => cat.id === activeTab) || CATEGORIES[0];

  const handleSelectTab = (id: SettingsTabId) => {
    dispatchInteractionSound("ui.tab");
    setActiveTab(id);
  };

  const ActiveSection = SECTION_COMPONENTS[activeTab] ?? ProfileSection;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Settings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium text-accent bg-accent/10 border border-accent/20">
              Preferences
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Configure your student credentials, study environment, haptics, and data management.
          </p>
        </div>
      </div>

      {/* ── Mobile Horizontal Navigation Tabs (< lg) ────────────────────── */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-xl bg-card border border-border">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectTab(cat.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap select-none cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive
                    ? "bg-accent text-accent-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-accent-foreground" : "text-accent")} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Two-Column Layout (>= lg) ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Secondary Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-6 space-y-1 bg-card border border-border rounded-xl p-2 shadow-xs">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </div>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectTab(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent group",
                  isActive
                    ? "bg-accent/10 text-foreground border border-accent/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-transparent"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                    isActive
                      ? "bg-accent/15 border-accent/30 text-accent"
                      : "bg-surface border-border text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-tight block truncate",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </span>
                </div>

                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)] shrink-0" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Active Category View Pane */}
        <main className="lg:col-span-8 min-w-0 space-y-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {currentCategory.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentCategory.description}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <ActiveSection />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
