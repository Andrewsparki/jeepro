"use client";

import { useState } from "react";
import { RANDOM_QUESTS, RandomQuest } from "@/features/break-room/data/break-room-data";
import { Shuffle, CheckCircle2, Clock, Lightbulb, Compass } from "lucide-react";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

export function RandomQuestActivity() {
  const [questIndex, setQuestIndex] = useState(0);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const currentQuest: RandomQuest = RANDOM_QUESTS[questIndex];
  const isCompleted = completedQuests.has(currentQuest.id);

  const handleShuffle = () => {
    dispatchInteractionSound("ui.select");
    let nextIndex = Math.floor(Math.random() * RANDOM_QUESTS.length);
    if (nextIndex === questIndex && RANDOM_QUESTS.length > 1) {
      nextIndex = (nextIndex + 1) % RANDOM_QUESTS.length;
    }
    setQuestIndex(nextIndex);
  };

  const handleToggleComplete = () => {
    dispatchInteractionSound(isCompleted ? "ui.toggleOff" : "feedback.success");
    setCompletedQuests((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuest.id)) {
        next.delete(currentQuest.id);
      } else {
        next.add(currentQuest.id);
      }
      return next;
    });
  };

  const categoryColorMap: Record<RandomQuest["category"], string> = {
    "Physical Reset": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Mental Recalibration": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "JEE Zen": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Focus Micro-Habit": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2B3342]/70">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#78A9FF]" />
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-md border",
              categoryColorMap[currentQuest.category]
            )}
          >
            {currentQuest.category}
          </span>
          <span className="text-xs text-[#A4ADBB] flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-[#A4ADBB]" />
            {currentQuest.duration}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78A9FF] hover:text-[#A8C5FF] transition-colors cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Roll Quest</span>
        </button>
      </div>

      {/* Quest Card */}
      <div
        className={cn(
          "p-5 rounded-xl border transition-all duration-200 space-y-3.5 relative overflow-hidden",
          isCompleted
            ? "bg-[#0E2018] border-[#5DC98B]/50"
            : "bg-[#121722] border-[#2B3342]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F5F7FB]">
              {currentQuest.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed">
              {currentQuest.prompt}
            </p>
          </div>
        </div>

        {/* Tactical Tip */}
        <div className="p-3 rounded-lg bg-[#171D28] border border-[#2B3342]/80 text-xs text-[#A4ADBB] flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-[#F1BE62] mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[#F5F7FB]">Why this works: </span>
            {currentQuest.tip}
          </p>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[#A4ADBB]">
          Completed: {completedQuests.size} of {RANDOM_QUESTS.length} available
        </span>

        <button
          type="button"
          onClick={handleToggleComplete}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            isCompleted
              ? "bg-[#5DC98B]/15 text-[#5DC98B] border border-[#5DC98B]/30 hover:bg-[#5DC98B]/25"
              : "bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12]"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? "Mark Incomplete" : "I Did This Quest"}</span>
        </button>
      </div>
    </div>
  );
}
