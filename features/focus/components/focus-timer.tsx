"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TimerMode } from "../store/focus-store";
import { useSettings } from "@/providers/settings-provider";

interface FocusTimerProps {
  mode: TimerMode;
  accumulatedTime: number; // Current time in seconds (absolute decoupled)
  lastResumeTime: number | null; // Start epoch if running
  totalTime: number; // Total duration in seconds (for countdown/pomodoro)
  isActive: boolean;
  phase?: "study" | "shortBreak" | "longBreak";
}

// Rolling digit component for premium vertical sliding transition (iOS/Linear style)
const RollingDigit = React.memo(function RollingDigit({ 
  char, 
  isActive 
}: { 
  char: string; 
  isActive?: boolean;
}) {
  if (char === ":") {
    return (
      <motion.span 
        animate={{ 
          opacity: isActive ? [0.35, 0.95, 0.35] : 0.6,
          scale: isActive ? [0.96, 1.04, 0.96] : 1,
        }}
        transition={{ 
          duration: 2, 
          repeat: isActive ? Infinity : 0, 
          ease: "easeInOut" 
        }}
        className="inline-block px-[0.02em] font-medium select-none text-foreground/80"
      >
        :
      </motion.span>
    );
  }

  return (
    <span className="relative inline-flex items-center justify-center overflow-hidden w-[0.58em] h-[1.1em] select-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "85%", opacity: 0, filter: "blur(2px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-85%", opacity: 0, filter: "blur(2px)" }}
          transition={{
            type: "spring",
            stiffness: 720,
            damping: 42,
            mass: 0.45,
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
  const { playSound } = useSettings();
  
  // High-performance motion value for exact elapsed time (in seconds)
  const elapsedMotion = useMotionValue(accumulatedTime);

  // Sync motion value on absolute changes (like pauses or resets)
  useEffect(() => {
    elapsedMotion.set(accumulatedTime);
  }, [accumulatedTime, elapsedMotion]);

  // Uncapped native refresh rate loop (supports 60Hz, 120Hz, 144Hz, 240Hz+) via framer-motion (automatically pauses when tab is hidden!)
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
  const getFormattedTimeString = React.useCallback((totalSeconds: number) => {
    const rounded = mode === 'stopwatch' ? Math.floor(totalSeconds) : Math.ceil(totalSeconds);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [mode]);

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
  }, [displayTimeValue, mode, totalTime, getFormattedTimeString]);

  // Tick sound effect logic
  const lastTickSecondRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      lastTickSecondRef.current = null;
      return;
    }

    const unsubscribe = displayTimeValue.on("change", (latest) => {
      const currentSecond = Math.floor(latest);
      if (lastTickSecondRef.current !== currentSecond && lastTickSecondRef.current !== null) {
        playSound("tick");
      }
      lastTickSecondRef.current = currentSecond;
    });

    return () => unsubscribe();
  }, [isActive, displayTimeValue, playSound]);

  // Format Stopwatch milliseconds (00-99)
  const msStringMotion = useTransform(displayTimeValue, (totalSeconds) => {
    if (mode !== 'stopwatch') return '';
    const ms = Math.floor((totalSeconds % 1) * 100);
    return `.${ms.toString().padStart(2, '0')}`;
  });

  // Canonical ring progress: remainingTime / totalTime (from 1.0 down to 0.0)
  const progressMotion = useTransform(elapsedMotion, (elapsed) => {
    if (mode === 'stopwatch' || totalTime <= 0) return 1;
    const remaining = totalTime - elapsed;
    const p = remaining / totalTime;
    return Math.max(0, Math.min(1, p));
  });

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  
  // Transform remaining progress (1.0 to 0.0) into stroke dash offset for the SVG ring
  // Progress 1.0 (100% remaining) -> strokeDashoffset = 0 (full ring)
  // Progress 0.0 (0% remaining / 00:00) -> strokeDashoffset = circumference (depleted ring)
  const strokeDashoffsetMotion = useTransform(progressMotion, (p) => (1 - p) * circumference);

  // Hide stroke opacity completely when progress hits 0 (00:00) to prevent strokeLinecap="round" from leaving a cap dot
  const ringOpacityMotion = useTransform(progressMotion, (p) => (p <= 0 ? 0 : 1));

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

  const shouldReduceMotion = useReducedMotion();
  const hasHours = formattedTime.length > 5;

  return (
    <motion.div 
      animate={{
        scale: isActive && !shouldReduceMotion ? [1, 1.008, 1] : 1,
      }}
      transition={{
        duration: 4.5,
        repeat: isActive && !shouldReduceMotion ? Infinity : 0,
        ease: "easeInOut",
      }}
      className={cn(
        "relative flex items-center justify-center aspect-square rounded-full transition-all duration-700 shrink-0 mx-auto",
        "w-[min(76vw,340px)] sm:w-[min(60vw,390px)] md:w-[min(52vh,420px)] lg:w-[min(55vh,450px)]"
      )}
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
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="shortBreak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="longBreak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        
        {/* Track Layer */}
        {mode !== 'stopwatch' && (
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke={ringColorTheme.trackHex}
            strokeWidth="12"
          />
        )}

        {/* Ambient Ring Halo (Alive continuous breath when running) */}
        {mode !== 'stopwatch' && isActive && !shouldReduceMotion && (
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke={`url(#${ringColorTheme.gradientId})`}
            strokeWidth="20"
            strokeLinecap="round"
            className="pointer-events-none"
            animate={{
              opacity: [0.08, 0.22, 0.08],
              scale: [0.996, 1.012, 0.996],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformOrigin: "160px 160px",
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffsetMotion,
              filter: "blur(4px)",
            }}
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
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#progress-shadow)"
            className={cn(
              "transition-[opacity,filter] duration-500",
              isActive ? ringColorTheme.glowClass : "opacity-90"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffsetMotion,
              opacity: ringOpacityMotion,
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
              strokeWidth="3.5"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4">
        <div 
          className={cn(
            "relative flex items-center justify-center font-medium tabular-nums leading-none tracking-tighter transition-all duration-500",
            isActive 
              ? "drop-shadow-[0_0_24px_rgba(79,70,229,0.35)] text-white" 
              : "drop-shadow-md text-foreground/95",
            hasHours
              ? "text-[2.65rem] xs:text-[3.2rem] sm:text-[3.9rem] md:text-[4.4rem]"
              : "text-[4.2rem] xs:text-[4.8rem] sm:text-[5.5rem] md:text-[6.2rem]"
          )}
          style={{ 
            fontFamily: "var(--font-sans), system-ui, sans-serif",
            letterSpacing: "-0.04em"
          }}
        >
          {formattedTime.split("").reverse().map((char, index) => (
            <RollingDigit key={index} char={char} isActive={isActive} />
          )).reverse()}

          {mode === 'stopwatch' && (
            <motion.span className="text-[0.45em] text-muted-foreground/60 font-normal tabular-nums ml-1 select-none self-end pb-[0.1em]">
              {msStringMotion}
            </motion.span>
          )}
        </div>
        
        {/* Subtle Status Pill */}
        <div className="absolute top-[68%] left-0 right-0 flex justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {(isPaused || isStopwatchPaused) ? (
              <motion.div
                key="paused"
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full backdrop-blur-md shadow-xs"
              >
                Paused
              </motion.div>
            ) : mode === 'stopwatch' ? (
              <motion.div
                key="stopwatch-label"
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 bg-white/5 border border-white/5 px-3 py-0.5 rounded-full"
              >
                Stopwatch
              </motion.div>
            ) : phase ? (
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full backdrop-blur-md shadow-xs",
                  phase === "study" && "text-accent bg-accent/10 border border-accent/20",
                  phase === "shortBreak" && "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
                  phase === "longBreak" && "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                )}
              >
                {phase === "study" ? "Deep Focus" : phase === "shortBreak" ? "Short Break" : "Long Break"}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});
