"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Maximize2, Coffee, Flame } from "lucide-react";
import { useFocusStore } from "../store/focus-store";
import { useSettings } from "@/providers/settings-provider";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { SessionService } from "@/features/study-engine/services/session.service";
import { FocusCompletionModal } from "./focus-completion-modal";
import { calculateSessionXP } from "@/features/progress/config/xp-config";
import { cn } from "@/lib/utils";

export function FocusFloatingTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const { playSound } = useSettings();

  const {
    timerMode,
    defaultStudyTime,
    defaultBreakTime,
    isActive,
    phase,
    sessionAccumulated,
    phaseAccumulated,
    lastResumeTime,
    initialStartTime,
    setInitialStartTime,
    setIsActive,
    setPhaseAccumulated,
    setSessionAccumulated,
    setLastResumeTime,
    restartTimer,
    handleTimerComplete,
    totalCompletedSittingSeconds,
    setTotalCompletedSittingSeconds,
    isCompletionModalOpen,
    setIsCompletionModalOpen,
  } = useFocusStore();

  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Exact time calculation helpers
  const getPhaseElapsed = () =>
    phaseAccumulated + (isActive && lastResumeTime ? (Date.now() - lastResumeTime) / 1000 : 0);

  const getSessionElapsed = () =>
    sessionAccumulated + (isActive && phase === "study" && lastResumeTime ? (Date.now() - lastResumeTime) / 1000 : 0);

  const getTotalPhaseTime = () => {
    if (timerMode === "stopwatch") return 0;
    if (phase === "study") return defaultStudyTime;
    if (phase === "shortBreak") return defaultBreakTime;
    return defaultBreakTime * 4;
  };

  // Keep a ref to store state for beforeunload handler
  const stateRef = useRef({
    isActive,
    phase,
    sessionAccumulated,
    lastResumeTime,
    initialStartTime,
  });

  useEffect(() => {
    stateRef.current = {
      isActive,
      phase,
      sessionAccumulated,
      lastResumeTime,
      initialStartTime,
    };
  }, [isActive, phase, sessionAccumulated, lastResumeTime, initialStartTime]);

  // Window beforeunload session flush (if user closes browser tab while focus timer is active)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { isActive: wasActive, phase: curPhase, sessionAccumulated: acc, lastResumeTime: lrt, initialStartTime: ist } = stateRef.current;
      const activeSeconds = acc + (wasActive && curPhase === "study" && lrt ? (Date.now() - lrt) / 1000 : 0);
      if (activeSeconds >= 60) {
        const endedAt = new Date();
        const startedAt = ist ? new Date(ist) : new Date(endedAt.getTime() - activeSeconds * 1000);
        SessionService.endSession({
          durationSeconds: Math.floor(activeSeconds),
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Continuous background auto-completion ticker & UI frame loop
  useEffect(() => {
    let animFrame: number;

    const tick = () => {
      const elapsed = getPhaseElapsed();
      const total = getTotalPhaseTime();

      // Check auto-completion for countdown/pomodoro
      if (isActive && timerMode !== "stopwatch" && total > 0 && total - elapsed <= 0) {
        playSound("chime");
        handleTimerComplete();
        return;
      }

      // Calculate display time
      if (timerMode === "stopwatch") {
        setDisplaySeconds(Math.floor(elapsed));
        setProgressPercent(0);
      } else {
        const remaining = Math.max(0, Math.ceil(total - elapsed));
        setDisplaySeconds(remaining);
        const fraction = total > 0 ? Math.min(1, Math.max(0, (total - remaining) / total)) : 0;
        setProgressPercent(fraction * 100);
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isActive, phase, timerMode, sessionAccumulated, phaseAccumulated, lastResumeTime, defaultStudyTime, defaultBreakTime]);

  // Determine visibility:
  // Must NOT show on /dashboard/focus
  // Must show whenever timer is active OR has accumulated session/phase time
  const hasStarted = isActive || sessionAccumulated > 0 || phaseAccumulated > 0;
  const isVisible = pathname !== "/dashboard/focus" && hasStarted;

  const formatTime = (totalSeconds: number) => {
    const clamped = Math.max(0, totalSeconds);
    const hrs = Math.floor(clamped / 3600);
    const mins = Math.floor((clamped % 3600) / 60);
    const secs = clamped % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTogglePlay = () => {
    const now = Date.now();
    if (!isActive) {
      playSound("pop-up");
      setLastResumeTime(now);
      setIsActive(true);
    } else {
      playSound("pop-down");
      const delta = (now - (lastResumeTime || now)) / 1000;
      if (phase === "study") {
        setSessionAccumulated(sessionAccumulated + delta);
      }
      setPhaseAccumulated(phaseAccumulated + delta);
      setLastResumeTime(null);
      setIsActive(false);
    }
  };

  const handleStopAndSave = async () => {
    playSound("pop-down");
    const finalElapsed = getSessionElapsed();
    const exactDuration = Math.floor(finalElapsed);

    setIsActive(false);
    setLastResumeTime(null);
    setSessionAccumulated(0);
    setPhaseAccumulated(0);
    setInitialStartTime(null);

    if (exactDuration >= 60) {
      const endedAt = new Date();
      const startedAt = initialStartTime ? new Date(initialStartTime) : new Date(endedAt.getTime() - exactDuration * 1000);
      try {
        await SessionService.endSession({
          durationSeconds: exactDuration,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
        });
      } catch (e) {
        console.error("Focus floating timer save failed:", e);
      }
      setTotalCompletedSittingSeconds(exactDuration);
      setIsCompletionModalOpen(true);
    } else {
      restartTimer();
    }
  };

  const handleExpandToFocus = () => {
    playSound("nav-drop");
    router.push("/dashboard/focus");
  };

  return (
    <FixedPortal>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed bottom-6 right-6 z-[95] select-none"
          >
            <div className="relative group">
              {/* Outer soft ambient glow */}
              <div
                className="absolute -inset-1 rounded-full opacity-40 blur-md pointer-events-none transition-opacity duration-300 group-hover:opacity-65"
                style={{
                  background:
                    phase === "study"
                      ? "radial-gradient(circle, var(--accent-glow) 0%, transparent 75%)"
                      : "radial-gradient(circle, rgba(93,201,139,0.3) 0%, transparent 75%)",
                }}
              />

              {/* Main PiP Capsule Card */}
              <div className="relative flex items-center gap-3.5 bg-background/85 dark:bg-zinc-950/85 backdrop-blur-xl border border-border/70 rounded-full pl-4 pr-2.5 py-2 shadow-xl shadow-black/20">
                {/* Status Dot / Phase Icon */}
                <button
                  type="button"
                  onClick={handleExpandToFocus}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                  title="Return to Focus Mode"
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isActive
                          ? phase === "study"
                            ? "bg-accent animate-pulse"
                            : "bg-emerald-500 animate-pulse"
                          : "bg-muted-foreground/60"
                      )}
                    />
                    {isActive && (
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full animate-ping opacity-40",
                          phase === "study" ? "bg-accent" : "bg-emerald-500"
                        )}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {phase === "study" ? (
                      <Flame className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="capitalize hidden sm:inline-block">
                      {phase === "study" ? "Focus" : "Break"}
                    </span>
                  </div>
                </button>

                {/* Digital Tabular Time Display */}
                <div
                  onClick={handleExpandToFocus}
                  className="font-mono text-sm font-semibold tabular-nums tracking-tight text-foreground cursor-pointer px-1 hover:text-accent transition-colors"
                  title="Click to view full Focus screen"
                >
                  {formatTime(displaySeconds)}
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-5 bg-border/60" />

                {/* Actions: Play/Pause, Stop, Expand */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-foreground/90 hover:text-foreground"
                    title={isActive ? "Pause" : "Resume"}
                  >
                    {isActive ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSave}
                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-muted-foreground hover:text-rose-400"
                    title="Stop Session"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExpandToFocus}
                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                    title="Open Full Focus Mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hairline Progress Underline */}
                {timerMode !== "stopwatch" && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300 ease-linear",
                        phase === "study" ? "bg-accent" : "bg-emerald-400"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FocusCompletionModal
        isOpen={isCompletionModalOpen && pathname !== "/dashboard/focus"}
        onOpenChange={(open) => {
          setIsCompletionModalOpen(open);
          if (!open) restartTimer();
        }}
        durationSeconds={totalCompletedSittingSeconds}
        xpEarned={calculateSessionXP(totalCompletedSittingSeconds)}
      />
    </FixedPortal>
  );
}
