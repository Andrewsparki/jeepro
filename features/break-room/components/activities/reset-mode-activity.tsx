"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Wind, Heart } from "lucide-react";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Rest";

const PHASES: { name: BreathPhase; duration: number; instruction: string }[] = [
  { name: "Inhale", duration: 4, instruction: "Breathe in deeply through your nose..." },
  { name: "Hold", duration: 4, instruction: "Hold gently with relaxed shoulders..." },
  { name: "Exhale", duration: 4, instruction: "Slowly release the breath through your mouth..." },
  { name: "Rest", duration: 4, instruction: "Pause and clear your mind before the next cycle..." },
];

export function ResetModeActivity() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupTimer();
  }, [cleanupTimer]);

  useEffect(() => {
    if (!isActive) {
      cleanupTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Switch to next phase
          setPhaseIndex((currPhase) => {
            const nextPhase = (currPhase + 1) % PHASES.length;
            if (nextPhase === 0) {
              setCyclesCompleted((c) => c + 1);
            }
            return nextPhase;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => cleanupTimer();
  }, [isActive, cleanupTimer]);

  const handleToggle = () => {
    dispatchInteractionSound(isActive ? "ui.toggleOff" : "study.focusStart");
    setIsActive((prev) => !prev);
  };

  const handleReset = () => {
    dispatchInteractionSound("ui.press");
    cleanupTimer();
    setIsActive(false);
    setPhaseIndex(0);
    setCountdown(4);
    setCyclesCompleted(0);
  };

  const currentPhase = PHASES[phaseIndex];

  // Animation ring scaling
  const getScale = () => {
    if (!isActive) return 1;
    if (currentPhase.name === "Inhale") return 1.35;
    if (currentPhase.name === "Hold") return 1.35;
    if (currentPhase.name === "Exhale") return 0.85;
    return 1;
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2B3342]/70">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-[#78A9FF]" />
          <span className="text-xs font-semibold text-[#F5F7FB]">
            Box Breathing Protocol (4-4-4-4)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#A4ADBB]">
            Cycles: <span className="text-[#5DC98B] font-bold">{cyclesCompleted}</span>
          </span>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors cursor-pointer"
            title="Reset breathing cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Guided Orb Arena */}
      <div className="w-full h-44 sm:h-48 rounded-xl bg-[#121722] border border-[#2B3342] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "w-24 h-24 rounded-full border border-[#78A9FF]/40 bg-[#78A9FF]/10 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-[0_0_30px_rgba(120,169,255,0.15)]",
              isActive && currentPhase.name === "Inhale" && "bg-[#78A9FF]/25 shadow-[0_0_40px_rgba(120,169,255,0.35)]",
              isActive && currentPhase.name === "Hold" && "bg-[#F1BE62]/20 border-[#F1BE62]/40 shadow-[0_0_40px_rgba(241,190,98,0.25)]",
              isActive && currentPhase.name === "Exhale" && "bg-[#5DC98B]/20 border-[#5DC98B]/40 shadow-[0_0_30px_rgba(93,201,139,0.25)]"
            )}
            style={{
              transform: `scale(${getScale()})`,
            }}
          >
            <span className="text-xl font-bold font-mono text-[#F5F7FB]">
              {isActive ? countdown : "4s"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78A9FF]">
              {isActive ? currentPhase.name : "Ready"}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A4ADBB] font-medium text-center mt-3 line-clamp-1">
          {isActive ? currentPhase.instruction : "4-second rhythmic breathing used by tactical teams to lower cortisol."}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-[#A4ADBB]">
          <Heart className="w-3.5 h-3.5 text-[#F17C7C]" />
          <span>Vagal Nerve Calming</span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            isActive
              ? "bg-[#171D28] hover:bg-white/[0.05] border border-[#2B3342] text-[#F5F7FB]"
              : "bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12]"
          )}
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Session</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Begin Breathing</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
