"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { useFocusStore, TimerMode } from "@/features/focus/store/focus-store";
import { FocusTimer } from "@/features/focus/components/focus-timer";
import { FocusControls } from "@/features/focus/components/focus-controls";
import { useKeyboardShortcuts } from "@/features/focus/hooks/use-keyboard-shortcuts";
import { FocusCompletionModal } from "@/features/focus/components/focus-completion-modal";
import { usePipTimer } from "@/features/focus/hooks/use-pip-timer";
import { PipTimerContent } from "@/features/focus/components/pip-timer-content";
import { FallbackFloatingTimer } from "@/features/focus/components/fallback-floating-timer";
import { useStudySession } from "@/features/study/context/study-session-context";
import { SessionService } from "@/features/study-engine/services/session.service";
import { calculateSessionXP } from "@/features/progress/config/xp-config";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useSettings } from "@/providers/settings-provider";
import { ContextMenuTarget } from "@/features/context-menu";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { cn } from "@/lib/utils";

const TIMER_MODES: { id: TimerMode; label: string }[] = [
  { id: "countdown", label: "Countdown" },
  { id: "stopwatch", label: "Stopwatch" },
  { id: "pomodoro", label: "Pomodoro" },
];

export default function FocusPage() {
  const { 
    timerMode, 
    setTimerMode,
    defaultStudyTime, 
    defaultBreakTime, 
    pomodoroCycles,
    isImmersive,
    toggleImmersive
  } = useFocusStore();

  const { triggerRefresh } = useStudySession();
  const { playSound } = useSettings();

  // Local state for timer (absolute time)
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"study" | "shortBreak" | "longBreak">("study");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // Track total elapsed seconds for the current phase/session
  const [sessionAccumulated, setSessionAccumulated] = useState<number>(0);
  const [phaseAccumulated, setPhaseAccumulated] = useState<number>(0);
  const [lastResumeTime, setLastResumeTime] = useState<number | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  
  // Overall session start for saving
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null);

  // ── Picture-in-Picture / Floating Timer ──
  const { isPipSupported, isPipOpen, pipContainer, openPip, closePip } = usePipTimer();
  const [showFallbackFloat, setShowFallbackFloat] = useState(false);

  // Helper functions for exact elapsed time
  const getSessionElapsed = () => sessionAccumulated + (isActive && lastResumeTime ? (Date.now() - lastResumeTime) / 1000 : 0);
  const getPhaseElapsed = () => phaseAccumulated + (isActive && lastResumeTime ? (Date.now() - lastResumeTime) / 1000 : 0);

  const getTotalTime = () => {
    if (timerMode === 'stopwatch') return 0;
    if (phase === 'study') return defaultStudyTime;
    if (phase === 'shortBreak') return defaultBreakTime;
    return defaultBreakTime * 4;
  };

  const handleRestart = (silent?: boolean) => {
    if (!silent) playSound("pop-down");
    setIsActive(false);
    setSessionAccumulated(0);
    setPhaseAccumulated(0);
    setLastResumeTime(null);
    setInitialStartTime(null);
    setPhase("study");
  };

  const handleEndSession = async (overrideSessionElapsed?: number) => {
    const finalElapsed = typeof overrideSessionElapsed === 'number' ? overrideSessionElapsed : getSessionElapsed();
    
    setIsActive(false);
    setSessionAccumulated(finalElapsed);
    setPhaseAccumulated(getPhaseElapsed());
    setLastResumeTime(null);
    
    if (finalElapsed < 10) {
      // Silently discard spam/accidental starts
      handleRestart();
    } else if (finalElapsed < 60) {
      playSound("muted-error");
      toast("Session too short to record.");
      handleRestart(true);
    } else {
      playSound("chime");
      const endedAt = new Date();
      const startedAt = initialStartTime || new Date(endedAt.getTime() - finalElapsed * 1000);
      const exactDuration = Math.floor(finalElapsed);
      
      try {
        await SessionService.endSession({
          durationSeconds: exactDuration,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
        });
        toast.success("Study session saved successfully!");
      } catch (e) {
        console.error("Session sync failed:", e);
        toast.warning("Network issue: Session saved offline", {
          description: "We'll sync it automatically when you reconnect."
        });
      }
      triggerRefresh();
      setIsCompletionModalOpen(true);
    }
  };

  function handleTimerComplete() {
    playSound("chime");
    const finalSession = getSessionElapsed();
    
    setIsActive(false);
    setLastResumeTime(null);
    setPhaseAccumulated(0); // Reset phase for next step
    setSessionAccumulated(finalSession);
    
    toast("Time's up!");
    
    if (timerMode === 'pomodoro') {
      if (phase === 'study') {
        const nextCount = pomodoroCount + 1;
        setPomodoroCount(nextCount);
        if (nextCount % pomodoroCycles === 0) {
          setPhase('longBreak');
        } else {
          setPhase('shortBreak');
        }
      } else {
        setPhase('study');
      }
    } else {
      // Countdown ended
      handleEndSession(finalSession);
    }
  }

  // Reliable background-safe interval solely for auto-completion (does not trigger renders)
  useEffect(() => {
    if (!isActive || timerMode === 'stopwatch') return;

    const interval = setInterval(() => {
      const elapsed = getPhaseElapsed();
      const total = getTotalTime();
      if (total > 0 && total - elapsed <= 0) {
        handleTimerComplete();
      }
    }, 500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timerMode, phase, sessionAccumulated, phaseAccumulated, lastResumeTime, defaultStudyTime, defaultBreakTime]);

  const togglePlayPause = () => {
    if (!isActive) {
      playSound("pop-up");
      if (sessionAccumulated === 0) {
        setInitialStartTime(new Date());
      }
      setLastResumeTime(Date.now());
      setIsActive(true);
    } else {
      playSound("pop-down");
      setSessionAccumulated(getSessionElapsed());
      setPhaseAccumulated(getPhaseElapsed());
      setLastResumeTime(null);
      setIsActive(false);
    }
  };

  const handleStartBreak = () => {
    playSound("pop-up");
    setIsActive(false);
    setSessionAccumulated(getSessionElapsed());
    setPhaseAccumulated(0);
    setLastResumeTime(null);
    setPhase("shortBreak");
  };

  useKeyboardShortcuts({
    onTogglePlayPause: togglePlayPause,
    onRestart: handleRestart,
    onStartBreak: handleStartBreak,
    onOpenNote: () => toast("Quick Note (Coming soon)")
  });

  // ── Pop Out handler ──
  const handlePopOut = async () => {
    if (isPipSupported) {
      if (isPipOpen) {
        closePip();
      } else {
        await openPip();
      }
    } else {
      if (!showFallbackFloat) {
        toast.info("Your browser doesn't support Picture-in-Picture windows. Showing an in-page floating timer instead.");
      }
      setShowFallbackFloat(!showFallbackFloat);
    }
  };

  const isFloatOpen = isPipOpen || showFallbackFloat;
  const timerAccumulated = timerMode === 'stopwatch' ? sessionAccumulated : phaseAccumulated;
  const currentTotalTime = getTotalTime();

  const shouldReduceMotion = useReducedMotion();

  // ── Staggered Entrance Variants ──
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.1 }
        : { staggerChildren: 0.09, delayChildren: 0.04 }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const timerSectionVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const dockSectionVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full w-full flex-1 flex flex-col justify-between items-center relative overflow-hidden pt-3 pb-8 sm:pt-6 sm:pb-12 md:pb-14 px-4 sm:px-8 select-none"
    >
      {/* ── Seamless Full-Viewport Ambient Environment (Teleported to document.body) ── */}
      <FixedPortal>
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none w-screen h-screen">
          {/* Full-bleed atmospheric ambient radial gradient (covers 100% of viewport with zero clipping boundaries) */}
          <motion.div 
            animate={{
              opacity: isActive ? (isImmersive ? 0.38 : 0.30) : 0.20,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "absolute inset-0 transition-colors duration-1000",
              phase === "study" && "bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,rgba(79,70,229,0.38)_0%,rgba(79,70,229,0.14)_45%,rgba(79,70,229,0)_75%)]",
              phase === "shortBreak" && "bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,rgba(16,185,129,0.38)_0%,rgba(16,185,129,0.14)_45%,rgba(16,185,129,0)_75%)]",
              phase === "longBreak" && "bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,rgba(56,189,248,0.38)_0%,rgba(56,189,248,0.14)_45%,rgba(56,189,248,0)_75%)]"
            )}
          />

          {/* Breathing focal core glow behind the timer */}
          <motion.div 
            animate={{
              scale: isActive && !shouldReduceMotion ? [0.95, 1.08, 0.95] : 1,
              opacity: isActive ? [0.24, 0.38, 0.24] : 0.16,
            }}
            transition={
              isActive && !shouldReduceMotion
                ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.8, ease: "easeOut" }
            }
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,800px)] h-[min(95vw,800px)] rounded-full transition-colors duration-1000",
              phase === "study" && "bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.5)_0%,rgba(79,70,229,0.18)_40%,transparent_70%)]",
              phase === "shortBreak" && "bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.5)_0%,rgba(16,185,129,0.18)_40%,transparent_70%)]",
              phase === "longBreak" && "bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.5)_0%,rgba(37,99,235,0.18)_40%,transparent_70%)]"
            )}
          />

          {/* Smooth full-screen dark vignette for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_95%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
        </div>
      </FixedPortal>

      {/* ── 1. Top Section: Calm Context & Mode Selector ── */}
      <motion.header 
        variants={headerVariants}
        className="w-full max-w-4xl flex items-center justify-between gap-3 z-10 shrink-0 pt-1 sm:pt-2"
      >
        {/* Left: Focus Badge / Pomodoro Cycles */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {timerMode === "pomodoro" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 backdrop-blur-md">
              <span className="text-[11px] font-medium text-muted-foreground">Cycle</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: pomodoroCycles }).map((_, i) => (
                  <span 
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i < (pomodoroCount % pomodoroCycles) 
                        ? "bg-accent shadow-xs scale-125" 
                        : "bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/70 font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-accent/80" />
              <span>Deep Focus Mode</span>
            </div>
          )}
        </div>

        {/* Center: Mode Segmented Pill */}
        <div className="flex items-center p-1 rounded-full bg-black/40 dark:bg-zinc-950/60 border border-white/8 backdrop-blur-xl shadow-xs">
          {TIMER_MODES.map((mode) => {
            const isSelected = timerMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                type="button"
                disabled={isActive}
                whileHover={!isActive && !shouldReduceMotion ? { scale: 1.03 } : undefined}
                whileTap={!isActive && !shouldReduceMotion ? { scale: 0.95 } : undefined}
                onClick={() => {
                  playSound("nav-drop");
                  setTimerMode(mode.id);
                }}
                className={cn(
                  "relative px-3.5 py-1 text-xs font-medium rounded-full transition-colors duration-200",
                  isSelected 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground",
                  isActive && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-mode-pill"
                    className="absolute inset-0 bg-white/10 dark:bg-white/12 rounded-full border border-white/10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{mode.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right: Immersive / Session Info */}
        <div className="flex items-center justify-end gap-2 min-w-[120px]">
          <AnimatePresence>
            {isImmersive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleImmersive}
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-full bg-white/5 border border-white/8 hover:bg-white/10 transition-colors shadow-xs"
              >
                Exit Focus (Esc)
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* ── 2. Center Section: The Primary Focal Countdown ── */}
      <motion.main 
        variants={timerSectionVariants}
        layout="position"
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="flex-1 min-h-0 w-full flex items-center justify-center relative z-10 py-4 md:py-8"
      >
        <ContextMenuTarget
          type="focus-session"
          id="active-focus-timer"
          title="Focus Session"
          data={{
            isActive,
            onToggleActive: togglePlayPause,
            onEndSession: () => handleEndSession(),
            onRestart: handleRestart,
          }}
        >
          <FocusTimer
            mode={timerMode}
            accumulatedTime={timerMode === 'stopwatch' ? sessionAccumulated : phaseAccumulated}
            lastResumeTime={lastResumeTime}
            totalTime={getTotalTime()}
            isActive={isActive}
            phase={timerMode === 'pomodoro' ? phase : undefined}
          />
        </ContextMenuTarget>
      </motion.main>

      {/* ── 3. Bottom Section: Unified Control Dock ── */}
      <motion.footer 
        variants={dockSectionVariants}
        layout="position"
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="w-full flex justify-center pb-2 sm:pb-4 z-20 shrink-0"
      >
        <FocusControls
          isActive={isActive}
          onTogglePlayPause={togglePlayPause}
          onEnd={handleEndSession}
          onRestart={handleRestart}
          onPopOut={handlePopOut}
          isPipOpen={isFloatOpen}
        />
      </motion.footer>

      {/* ── Modals & Portals ── */}
      <FocusCompletionModal
        isOpen={isCompletionModalOpen}
        onOpenChange={(open) => {
          setIsCompletionModalOpen(open);
          if (!open) handleRestart();
        }}
        durationSeconds={sessionAccumulated}
        xpEarned={calculateSessionXP(sessionAccumulated)}
      />

      {/* Picture-in-Picture Portal */}
      {isPipOpen && pipContainer &&
        createPortal(
          <PipTimerContent
            mode={timerMode}
            accumulatedTime={timerAccumulated}
            lastResumeTime={lastResumeTime}
            totalTime={currentTotalTime}
            isActive={isActive}
            phase={timerMode === 'pomodoro' ? phase : undefined}
            onTogglePlayPause={togglePlayPause}
            onEnd={handleEndSession}
            onRestart={handleRestart}
          />,
          pipContainer
        )
      }

      {/* Fallback Floating Timer */}
      <FallbackFloatingTimer
        mode={timerMode}
        accumulatedTime={timerAccumulated}
        lastResumeTime={lastResumeTime}
        totalTime={currentTotalTime}
        isActive={isActive}
        phase={timerMode === 'pomodoro' ? phase : undefined}
        onTogglePlayPause={togglePlayPause}
        onEnd={handleEndSession}
        onRestart={handleRestart}
        onClose={() => setShowFallbackFloat(false)}
        isVisible={showFallbackFloat}
      />
    </motion.div>
  );
}
