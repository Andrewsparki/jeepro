"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { FocusTimer } from "@/features/focus/components/focus-timer";
import { FocusControls } from "@/features/focus/components/focus-controls";
import { AmbientAudio } from "@/features/focus/components/ambient-audio";
import { useKeyboardShortcuts } from "@/features/focus/hooks/use-keyboard-shortcuts";
import { FocusCompletionModal } from "@/features/focus/components/focus-completion-modal";
import { useStudySession } from "@/features/study/context/study-session-context";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FocusPage() {
  const { 
    timerMode, 
    defaultStudyTime, 
    defaultBreakTime, 
    pomodoroCycles,
    isImmersive 
  } = useFocusStore();

  const { startSession, endSession } = useStudySession();

  // Local state for timer (tracked as precise floats in seconds)
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(timerMode === 'stopwatch' ? 0 : defaultStudyTime);
  const [phase, setPhase] = useState<"study" | "shortBreak" | "longBreak">("study");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // Track actual studied time for XP (stopwatch counts up, countdown counts total elapsed)
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Sync initial time if mode changes while not started
  useEffect(() => {
    if (!isActive && sessionElapsedSeconds === 0) {
      if (timerMode === 'stopwatch') setTimeLeft(0);
      else setTimeLeft(defaultStudyTime);
    }
  }, [timerMode, defaultStudyTime, isActive, sessionElapsedSeconds]);

  // High-resolution animation frame loop for perfect timer sync
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000; // in seconds
      lastTime = currentTime;

      setSessionElapsedSeconds(s => s + delta);
      
      setTimeLeft(t => {
        if (timerMode === 'stopwatch') {
          return t + delta;
        } else {
          const next = t - delta;
          if (next <= 0) return 0;
          return next;
        }
      });

      if (isActive) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (isActive) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, timerMode]);

  // Handle completion exactly once
  useEffect(() => {
    if (isActive && timerMode !== 'stopwatch' && timeLeft <= 0) {
      handleTimerComplete();
    }
  }, [isActive, timerMode, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    toast("Time's up!");
    
    if (timerMode === 'pomodoro') {
      if (phase === 'study') {
        const nextCount = pomodoroCount + 1;
        setPomodoroCount(nextCount);
        if (nextCount % pomodoroCycles === 0) {
          setPhase('longBreak');
          setTimeLeft(defaultBreakTime * 4); // Long break = 4x short break
        } else {
          setPhase('shortBreak');
          setTimeLeft(defaultBreakTime);
        }
      } else {
        setPhase('study');
        setTimeLeft(defaultStudyTime);
      }
    } else {
      // Countdown ended
      handleEndSession();
    }
  };

  const togglePlayPause = () => {
    if (!isActive && sessionElapsedSeconds === 0) {
      // Just starting a fresh session
      startSession(undefined, undefined, undefined, undefined);
    }
    setIsActive(!isActive);
  };

  const handleRestart = () => {
    setIsActive(false);
    setSessionElapsedSeconds(0);
    setPhase("study");
    if (timerMode === 'stopwatch') setTimeLeft(0);
    else setTimeLeft(defaultStudyTime);
  };

  const handleStartBreak = () => {
    setIsActive(false);
    setPhase("shortBreak");
    setTimeLeft(defaultBreakTime);
  };

  const handleEndSession = () => {
    setIsActive(false);
    if (sessionElapsedSeconds < 10) {
      // Silently discard spam/accidental starts
      handleRestart();
    } else if (sessionElapsedSeconds < 60) {
      toast("Session too short to record.");
      handleRestart();
    } else {
      endSession(100);
      setIsCompletionModalOpen(true);
    }
  };

  useKeyboardShortcuts({
    onTogglePlayPause: togglePlayPause,
    onRestart: handleRestart,
    onStartBreak: handleStartBreak,
    onOpenNote: () => toast("Quick Note (Coming soon)")
  });

  const getTotalTime = () => {
    if (timerMode === 'stopwatch') return 0;
    if (phase === 'study') return defaultStudyTime;
    if (phase === 'shortBreak') return defaultBreakTime;
    return defaultBreakTime * 4;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative px-4 sm:px-8 overflow-hidden">
      {/* Premium Ambient Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(var(--accent-rgb,79,70,229),0.03)_0%,transparent_70%)] pointer-events-none z-0 mix-blend-screen" />
      
      <AnimatePresence>
        <motion.div
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
            time={timeLeft}
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
        durationSeconds={sessionElapsedSeconds}
        xpEarned={Math.floor(sessionElapsedSeconds / 60) * 10} // Dummy calc, real calc is handled by backend
      />
    </div>
  );
}
