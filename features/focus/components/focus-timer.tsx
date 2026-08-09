"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { TimerMode } from "../store/focus-store";

interface FocusTimerProps {
  mode: TimerMode;
  accumulatedTime: number; // Current time in seconds (absolute decoupled)
  lastResumeTime: number | null; // Start epoch if running
  totalTime: number; // Total duration in seconds (for countdown/pomodoro)
  isActive: boolean;
  phase?: "study" | "shortBreak" | "longBreak";
}

// Rolling digit component for premium vertical sliding transition (iOS/Linear style)
const RollingDigit = React.memo(function RollingDigit({ char }: { char: string }) {
  if (char === ":") {
    return <span className="inline-block px-[0.02em] opacity-60 font-medium select-none">:</span>;
  }

  return (
    <span className="relative inline-flex items-center justify-center overflow-hidden w-[0.58em] h-[1.1em] select-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 800,
            damping: 45,
            mass: 0.5,
          }}
          className="absolute inset-0 flex items-center justify-center tabular-nums leading-none"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

export const FocusTimer = React.memo(function FocusTimer({ 
  mode, 
  accumulatedTime, 
  lastResumeTime, 
  totalTime, 
  isActive, 
  phase 
}: FocusTimerProps) {
  
  // High-performance motion value for exact elapsed time (in seconds)
  const elapsedMotion = useMotionValue(accumulatedTime);

  // Sync motion value on absolute changes (like pauses or resets)
  useEffect(() => {
    elapsedMotion.set(accumulatedTime);
  }, [accumulatedTime, elapsedMotion]);

  // Run the 60fps loop via framer-motion (automatically pauses when tab is hidden!)
  useAnimationFrame(() => {
    if (isActive && lastResumeTime) {
      const now = Date.now();
      const currentElapsed = accumulatedTime + (now - lastResumeTime) / 1000;
      elapsedMotion.set(currentElapsed);
    }
  });

  // Calculate actual time value for display
  const displayTimeValue = useTransform(elapsedMotion, (elapsed) => {
    if (mode === "stopwatch") {
      return elapsed;
    } else {
      const remaining = totalTime - elapsed;
      return remaining < 0 ? 0 : remaining;
    }
  });

  // Format helper for digits
  const getFormattedTimeString = (totalSeconds: number) => {
    const rounded = mode === 'stopwatch' ? Math.floor(totalSeconds) : Math.ceil(totalSeconds);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [formattedTime, setFormattedTime] = React.useState(() => 
    getFormattedTimeString(displayTimeValue.get())
  );

  useEffect(() => {
    setFormattedTime(getFormattedTimeString(displayTimeValue.get()));

    const unsubscribe = displayTimeValue.on("change", (latest) => {
      const newStr = getFormattedTimeString(latest);
      setFormattedTime((prev) => (prev !== newStr ? newStr : prev));
    });

    return () => unsubscribe();
  }, [displayTimeValue, mode, totalTime]);

  // Format Stopwatch milliseconds (00-99)
  const msStringMotion = useTransform(displayTimeValue, (totalSeconds) => {
    if (mode !== 'stopwatch') return '';
    const ms = Math.floor((totalSeconds % 1) * 100);
    return `.${ms.toString().padStart(2, '0')}`;
  });

  // Smooth ring progress (0 to 1)
  const progressMotion = useTransform(elapsedMotion, (elapsed) => {
    if (mode === 'stopwatch' || totalTime <= 0) return 1;
    const p = elapsed / totalTime;
    if (p < 0) return 0;
    if (p > 1) return 1;
    return p;
  });

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  
  // Transform progress into stroke dash offset for the SVG ring
  // A timer starts full (offset 0) and depletes clockwise (offset goes to circumference)
  const strokeDashoffsetMotion = useTransform(progressMotion, (p) => p * circumference);

  // Stopwatch Ring Rotations
  const slowRotationOffset = useTransform(elapsedMotion, (e) => -(e / 60) * (2 * Math.PI * (radius + 8)));
  const fastRotationOffset = useTransform(elapsedMotion, (e) => -(e / 2) * circumference);

  const isPaused = !isActive && accumulatedTime > 0 && mode !== 'stopwatch';
  const isStopwatchPaused = !isActive && accumulatedTime > 0 && mode === 'stopwatch';

  // Determine ring color based on phase
  let ringColorTheme = {
    hex: "#4f46e5",
    trackHex: "rgba(79, 70, 229, 0.15)", // Very dark accent for track
    gradientId: "study-gradient",
    glowClass: "drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]",
    ambientClass: "drop-shadow-[0_0_30px_rgba(79,70,229,0.2)]",
  };
  
  if (phase === "shortBreak") {
    ringColorTheme = {
      hex: "#10b981",
      trackHex: "rgba(16, 185, 129, 0.15)",
      gradientId: "shortBreak-gradient",
      glowClass: "drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      ambientClass: "drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    };
  } else if (phase === "longBreak") {
    ringColorTheme = {
      hex: "#3b82f6",
      trackHex: "rgba(59, 130, 246, 0.15)",
      gradientId: "longBreak-gradient",
      glowClass: "drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      ambientClass: "drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    };
  }

  return (
    <motion.div 
      className={cn("relative flex items-center justify-center w-full max-w-[350px] aspect-square rounded-full transition-shadow duration-1000")}
    >
      {/* SVG Ring Background */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="progress-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="black" floodOpacity="0.4" />
            <feOffset dx="0" dy="1"/>
            <feGaussianBlur stdDeviation="1" result="offset-blur"/>
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
            <feFlood floodColor="white" floodOpacity="0.3" result="color"/>
            <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
            <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
          </filter>
          <linearGradient id="study-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="shortBreak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="longBreak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        
        {/* Track Layer (Dark version of accent, not black) */}
        {mode !== 'stopwatch' && (
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke={ringColorTheme.trackHex}
            strokeWidth="14"
          />
        )}
        
        {/* Progress Arc Layer (Countdown/Pomodoro) */}
        {mode !== 'stopwatch' && (
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke={`url(#${ringColorTheme.gradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#progress-shadow)"
            className={cn(isActive && ringColorTheme.glowClass)}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffsetMotion,
            }}
          />
        )}

        {/* Premium Stopwatch Ring */}
        {mode === 'stopwatch' && (
          <g>
            {/* Outer Ambient Tick Marks */}
            <motion.circle
              cx="160"
              cy="160"
              r={radius + 8}
              fill="transparent"
              stroke={`url(#${ringColorTheme.gradientId})`}
              strokeWidth="4"
              strokeDasharray="2 12"
              className={cn("opacity-40", isActive && ringColorTheme.ambientClass)}
              style={{ 
                strokeDashoffset: slowRotationOffset 
              }}
            />
            {/* Inner fast rotating highlight */}
            <motion.circle
              cx="160"
              cy="160"
              r={radius}
              fill="transparent"
              stroke={`url(#${ringColorTheme.gradientId})`}
              strokeWidth="3"
              strokeDasharray={`80 ${circumference - 80}`}
              strokeLinecap="round"
              filter="url(#progress-shadow)"
              className={cn(isActive && ringColorTheme.glowClass)}
              style={{ 
                strokeDashoffset: fastRotationOffset
              }}
            />
          </g>
        )}
      </svg>

      {/* Timer Text with Premium Rolling Digits */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div 
          className="relative flex items-center justify-center drop-shadow-md text-[5.5rem] sm:text-[6.5rem] font-medium text-foreground tabular-nums leading-none tracking-tighter"
          style={{ 
            fontFamily: "'SF Pro Display', 'Inter Display', 'Geist', -apple-system, sans-serif",
            letterSpacing: "-0.04em"
          }}
        >
          {formattedTime.split("").reverse().map((char, index) => (
            <RollingDigit key={index} char={char} />
          )).reverse()}

          {mode === 'stopwatch' && (
            <motion.span className="absolute left-[100%] ml-2 bottom-[10px] text-4xl sm:text-5xl text-muted-foreground/50 font-light tabular-nums tracking-tighter">
              {msStringMotion}
            </motion.span>
          )}
        </div>
        
        <div className="absolute top-[65%] left-0 right-0 flex justify-center">
          <AnimatePresence mode="wait">
            {(isPaused || isStopwatchPaused) ? (
              <motion.div
                key="paused"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 px-3 py-1 rounded-full border border-white/5 bg-white/5"
              >
                Paused
              </motion.div>
            ) : mode === 'stopwatch' ? (
              <motion.div
                key="stopwatch-label"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/40"
                style={{ fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
              >
                ELAPSED TIME
              </motion.div>
            ) : phase ? (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80"
                style={{ fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
              >
                {phase === "study" ? "FOCUS" : phase === "shortBreak" ? "SHORT BREAK" : "LONG BREAK"}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});
