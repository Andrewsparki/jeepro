"use client";

import { useState } from "react";
import { BRAIN_TEASERS, BrainTeaser } from "@/features/break-room/data/break-room-data";
import { Eye, EyeOff, RotateCcw, Lightbulb, Sparkles, ArrowRight } from "lucide-react";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

export function BrainTeasersActivity() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentTeaser: BrainTeaser = BRAIN_TEASERS[currentIndex];

  const handleNext = () => {
    dispatchInteractionSound("ui.select");
    setShowHint(false);
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % BRAIN_TEASERS.length);
  };

  const handleToggleHint = () => {
    dispatchInteractionSound("ui.press");
    setShowHint((prev) => !prev);
  };

  const handleToggleAnswer = () => {
    dispatchInteractionSound("ui.toggleOn");
    setShowAnswer((prev) => !prev);
  };

  const handleReset = () => {
    dispatchInteractionSound("ui.press");
    setShowHint(false);
    setShowAnswer(false);
  };

  const subjectColorMap: Record<BrainTeaser["subjectTag"], string> = {
    Physics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Mathematics: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Chemistry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Pure Logic": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2B3342]/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-[#78A9FF] bg-[#78A9FF]/10 px-2 py-0.5 rounded-md border border-[#78A9FF]/20">
            Puzzle {currentIndex + 1} of {BRAIN_TEASERS.length}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-md border",
              subjectColorMap[currentTeaser.subjectTag]
            )}
          >
            {currentTeaser.subjectTag}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78A9FF] hover:text-[#A8C5FF] transition-colors cursor-pointer"
        >
          <span>Next Teaser</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Question Card */}
      <div className="p-4 rounded-xl bg-[#121722] border border-[#2B3342] shadow-inner space-y-3">
        <p className="text-sm sm:text-base font-medium text-[#F5F7FB] leading-relaxed">
          {currentTeaser.question}
        </p>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 rounded-lg bg-[#171D28] border border-[#F1BE62]/30 text-xs text-[#F1BE62] flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <Lightbulb className="w-4 h-4 shrink-0 text-[#F1BE62] mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">Hint: </span>
              {currentTeaser.hint}
            </p>
          </div>
        )}

        {/* Answer Box */}
        {showAnswer && (
          <div className="p-3.5 rounded-lg bg-[#171D28] border border-[#5DC98B]/30 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5DC98B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authoritative Answer</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#F5F7FB]">
              {currentTeaser.answer}
            </p>
            <p className="text-xs text-[#A4ADBB] leading-relaxed pt-1 border-t border-[#2B3342]/60">
              {currentTeaser.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleHint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D28] hover:bg-white/[0.05] border border-[#2B3342] text-xs font-medium text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F1BE62]" />
            <span>{showHint ? "Hide Hint" : "Get Hint"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAnswer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D28] hover:bg-white/[0.05] border border-[#2B3342] text-xs font-medium text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors cursor-pointer"
          >
            {showAnswer ? (
              <EyeOff className="w-3.5 h-3.5 text-[#78A9FF]" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-[#78A9FF]" />
            )}
            <span>{showAnswer ? "Hide Answer" : "Reveal Answer"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors cursor-pointer"
          title="Reset card visibility"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
