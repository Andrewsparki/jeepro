"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { FocusTimer } from "@/features/focus/components/focus-timer";
import { FocusControls } from "@/features/focus/components/focus-controls";
import { AmbientAudio } from "@/features/focus/components/ambient-audio";
import { useKeyboardShortcuts } from "@/features/focus/hooks/use-keyboard-shortcuts";
import { FocusCompletionModal } from "@/features/focus/components/focus-completion-modal";
import { useStudySession } from "@/features/study/context/study-session-context";
import { SessionService } from "@/features/study-engine/services/session.service";
import { calculateSessionXP } from "@/features/progress/config/xp-config";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useSettings } from "@/providers/settings-provider";

export default function FocusPage() {
  const { 
    timerMode, 
    defaultStudyTime, 
    defaultBreakTime, 
    pomodoroCycles,
    isImmersive 
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
    }, 500); // Check twice a second

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative px-4 sm:px-8 overflow-hidden">
      {/* Premium Ambient Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(var(--accent-rgb,79,70,229),0.03)_0%,transparent_70%)] pointer-events-none z-0 mix-blend-screen" />
      
      <AnimatePresence>
        <motion.div
          layout
          key="focus-page"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-12 sm:py-0 relative z-10"
        >
          {/* Top Breadcrumbs / Context (Hidden in Immersive unless hovered/active) */}
          <motion.div 
            animate={{ opacity: isImmersive && isActive ? 0 : 1 }}
            className="flex items-center gap-2 mb-8 sm:mb-12 text-sm text-muted-foreground/70 tracking-wide font-medium"
          >
            <span className="hover:text-foreground transition-colors cursor-pointer">Focus Mode</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-foreground">{timerMode.charAt(0).toUpperCase() + timerMode.slice(1)}</span>
          </motion.div>

          <FocusTimer
            mode={timerMode}
            accumulatedTime={timerMode === 'stopwatch' ? sessionAccumulated : phaseAccumulated}
            lastResumeTime={lastResumeTime}
            totalTime={getTotalTime()}
            isActive={isActive}
            phase={timerMode === 'pomodoro' ? phase : undefined}
          />

          <FocusControls
            isActive={isActive}
            onTogglePlayPause={togglePlayPause}
            onEnd={handleEndSession}
            onRestart={handleRestart}
          />
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        <AmbientAudio />
      </div>

      <FocusCompletionModal
        isOpen={isCompletionModalOpen}
        onOpenChange={(open) => {
          setIsCompletionModalOpen(open);
          if (!open) handleRestart();
        }}
        durationSeconds={sessionAccumulated}
        xpEarned={calculateSessionXP(sessionAccumulated)}
      />
    </div>
  );
}
