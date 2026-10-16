"use client";

import { useState } from "react";
import { useBreakRoom } from "../context/break-room-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Brain,
  Zap,
  Compass,
  Wind,
  Coffee,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { BrainTeasersActivity } from "./activities/brain-teasers-activity";
import { ReflexChallengeActivity } from "./activities/reflex-challenge-activity";
import { RandomQuestActivity } from "./activities/random-quest-activity";
import { ResetModeActivity } from "./activities/reset-mode-activity";
import { motion, useReducedMotion } from "framer-motion";

type ActivityTab = "teasers" | "reflex" | "quest" | "reset";

interface TabItem {
  id: ActivityTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabItem[] = [
  {
    id: "teasers",
    label: "Brain Teasers",
    shortLabel: "Teasers",
    icon: Brain,
    badge: "Logic",
  },
  {
    id: "reflex",
    label: "Reflex Challenge",
    shortLabel: "Reflex",
    icon: Zap,
    badge: "Mini-game",
  },
  {
    id: "quest",
    label: "Random Quest",
    shortLabel: "Quests",
    icon: Compass,
    badge: "Reset",
  },
  {
    id: "reset",
    label: "Reset Mode",
    shortLabel: "Breathing",
    icon: Wind,
    badge: "Zen",
  },
];

export function BreakRoomModal() {
  const { isOpen, closeBreakRoom } = useBreakRoom();
  const [activeTab, setActiveTab] = useState<ActivityTab>("teasers");
  const shouldReduceMotion = useReducedMotion();

  const handleSelectTab = (tabId: ActivityTab) => {
    dispatchInteractionSound("ui.tab");
    setActiveTab(tabId);
  };

  const handleBackToStudy = () => {
    dispatchInteractionSound("study.sessionStart");
    closeBreakRoom();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeBreakRoom()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl sm:max-w-2xl bg-[#0B0D12] border border-[#2B3342] text-[#F5F7FB] p-0 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(120,169,255,0.12)] overflow-hidden"
      >
        {/* Ambient Backlight Glow behind the Modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#78A9FF]/15 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute -bottom-20 right-10 w-64 h-32 bg-[#A8C5FF]/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Top Header Bar */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 sm:p-6 pb-4 border-b border-[#2B3342]/70 bg-[#121722]/80 flex items-start justify-between gap-4 relative z-10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0.7, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 350, damping: 20 }}
                className="w-8 h-8 rounded-lg bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shadow-[0_0_15px_rgba(120,169,255,0.25)]"
              >
                <Coffee className="w-4 h-4" />
              </motion.div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F5F7FB] flex items-center gap-2">
                <span>JEE Pro Break Room</span>
                <motion.span
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                  className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/30 shadow-xs"
                >
                  Secret Room
                </motion.span>
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#A4ADBB] pl-10">
              Take a tactical cognitive pause. Recharge attention before your next deep problem set.
            </DialogDescription>
          </div>

          <button
            type="button"
            onClick={closeBreakRoom}
            className="w-8 h-8 rounded-lg bg-[#171D28] hover:bg-white/[0.08] text-[#A4ADBB] hover:text-[#F5F7FB] border border-[#2B3342] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close Break Room (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </button>
        </motion.div>

        {/* Tab Navigation Pill Bar with Staggered Rise */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 sm:px-6 pt-4 relative z-10"
        >
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#121722] border border-[#2B3342]">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + idx * 0.05,
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleSelectTab(tab.id)}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#78A9FF]",
                    isSelected
                      ? "bg-[#171D28] text-[#F5F7FB] border border-[#78A9FF]/40 shadow-[0_2px_12px_rgba(120,169,255,0.12)]"
                      : "text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-white/[0.03] border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isSelected ? "text-[#78A9FF]" : "text-[#A4ADBB]"
                    )}
                  />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  <span className="inline sm:hidden text-[11px] truncate">{tab.shortLabel}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Active Activity Body with Podium-style Rise & Fade */}
        <motion.div
          key={activeTab}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 sm:p-6 min-h-[290px] relative z-10"
        >
          {activeTab === "teasers" && <BrainTeasersActivity />}
          {activeTab === "reflex" && <ReflexChallengeActivity />}
          {activeTab === "quest" && <RandomQuestActivity />}
          {activeTab === "reset" && <ResetModeActivity />}
        </motion.div>

        {/* Footer with 'Back to studying' action */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 px-5 sm:px-6 border-t border-[#2B3342]/70 bg-[#121722]/50 flex items-center justify-between gap-3 relative z-10"
        >
          <div className="flex items-center gap-1.5 text-xs text-[#A4ADBB]">
            <Sparkles className="w-3.5 h-3.5 text-[#78A9FF]" />
            <span className="hidden sm:inline">Activated by typing &apos;bored&apos; anywhere</span>
            <span className="inline sm:hidden">Secret easter egg</span>
          </div>

          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={handleBackToStudy}
            className="px-4 py-2 rounded-lg bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_12px_rgba(120,169,255,0.25)]"
          >
            <span>Back to studying</span>
          </motion.button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
