"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TimerMode } from "../store/focus-store";

interface FocusTimerProps {
  mode: TimerMode;
  time: number; // Current time in seconds
  totalTime: number; // Total duration in seconds (for countdown/pomodoro)
  isActive: boolean;
  phase?: "study" | "shortBreak" | "longBreak";
}

export const FocusTimer = React.memo(function FocusTimer({ mode, time, totalTime, isActive, phase }: FocusTimerProps) {
  // Calculate progress for the ring (0 to 1)
  let progress = 1;
  if (mode !== "stopwatch" && totalTime > 0) {
    progress = time / totalTime;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
  }

  // Format time (MM:SS or HH:MM:SS) using Math.ceil for countdown, Math.floor for stopwatch
  const formatTime = (totalSeconds: number) => {
    const rounded = mode === 'stopwatch' ? Math.floor(totalSeconds) : Math.ceil(totalSeconds);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeString = formatTime(time);
  const isPaused = !isActive && time > 0 && time !== totalTime && mode !== 'stopwatch';
  const isStopwatchPaused = !isActive && time > 0 && mode === 'stopwatch';

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Determine ring color based on phase
  let ringColorTheme = {
    hex: "#4f46e5",
    trackHex: "rgba(79, 70, 229, 0.15)", // Very dark accent for track
    gradientId: "study-gradient",
    glowClass: "drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]"
  };
  
  if (phase === "shortBreak") {
    ringColorTheme = {
      hex: "#10b981",
      trackHex: "rgba(16, 185, 129, 0.15)",
      gradientId: "shortBreak-gradient",
      glowClass: "drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
    };
  } else if (phase === "longBreak") {
    ringColorTheme = {
      hex: "#3b82f6",
      trackHex: "rgba(59, 130, 246, 0.15)",
      gradientId: "longBreak-gradient",
      glowClass: "drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
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
        
        {/* Progress Arc Layer */}
        {mode !== 'stopwatch' && (
          <circle
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
              strokeDashoffset: strokeDashoffset,
            }}
          />
        )}
      </svg>

      {/* Timer Text */}
      <div className="relative flex flex-col items-center justify-center z-10 text-center">
        <div 
          className="text-[5.5rem] sm:text-[6.5rem] font-medium text-foreground flex items-center justify-center tabular-nums h-[120px] drop-shadow-md"
          style={{ 
            fontFamily: "'SF Pro Display', 'Inter Display', 'Geist', -apple-system, sans-serif",
            letterSpacing: "-0.04em"
          }}
        >
          <AnimatePresence mode="popLayout">
            {timeString.split("").map((char, index) => (
              <motion.span
                key={`${index}-${char}`}
                initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                className={cn(
                  "inline-block",
                  char === ":" ? "opacity-40 -translate-y-[0.15em] mx-[2px] transform-gpu font-light" : ""
                )}
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="absolute -bottom-12 flex flex-col items-center justify-center min-h-[24px]">
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
