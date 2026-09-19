"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Square, RotateCcw, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimerMode } from "../store/focus-store";

interface FallbackFloatingTimerProps {
  mode: TimerMode;
  accumulatedTime: number;
  lastResumeTime: number | null;
  totalTime: number;
  isActive: boolean;
  phase?: "study" | "shortBreak" | "longBreak";
  onTogglePlayPause: () => void;
  onEnd: () => void;
  onRestart: () => void;
  onClose: () => void;
  isVisible: boolean;
}

/**
 * Fallback in-page floating mini-timer for browsers without Document PiP support.
 * Fixed-position, draggable overlay in the bottom-right corner.
 */
export function FallbackFloatingTimer({
  mode,
  accumulatedTime,
  lastResumeTime,
  totalTime,
  isActive,
  phase,
  onTogglePlayPause,
  onEnd,
  onRestart,
  onClose,
  isVisible,
}: FallbackFloatingTimerProps) {
  const timeDisplayRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const formatTime = useCallback(
    (totalSeconds: number) => {
      const rounded =
        mode === "stopwatch"
          ? Math.floor(totalSeconds)
          : Math.ceil(totalSeconds);
      const clamped = Math.max(0, rounded);
      const hrs = Math.floor(clamped / 3600);
      const mins = Math.floor((clamped % 3600) / 60);
      const secs = clamped % 60;

      if (hrs > 0) {
        return `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    },
    [mode]
  );

  // rAF loop for live time
  useEffect(() => {
    if (!isVisible) return;

    let lastStr = "";
    const tick = () => {
      let elapsed = accumulatedTime;
      if (isActive && lastResumeTime) {
        elapsed += (Date.now() - lastResumeTime) / 1000;
      }
      const display =
        mode === "stopwatch" ? elapsed : Math.max(0, totalTime - elapsed);
      const str = formatTime(display);

      if (str !== lastStr && timeDisplayRef.current) {
        timeDisplayRef.current.textContent = str;
        lastStr = str;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [accumulatedTime, lastResumeTime, isActive, mode, totalTime, formatTime, isVisible]);

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Accent color per phase
  const accent =
    phase === "shortBreak"
      ? "#10b981"
      : phase === "longBreak"
      ? "#3b82f6"
      : "#818cf8";

  const phaseLabel =
    phase === "study"
      ? "FOCUS"
      : phase === "shortBreak"
      ? "SHORT BREAK"
      : phase === "longBreak"
      ? "LONG BREAK"
      : mode === "stopwatch"
      ? "ELAPSED"
      : "REMAINING";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={dragRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="fixed z-[9999]"
          style={{
            bottom: 24,
            right: 24,
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div
            className={cn(
              "rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-2xl",
              "bg-[#0a0a0f]/95"
            )}
            style={{
              boxShadow: `0 0 40px ${accent}15, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Drag handle + close */}
            <div
              onMouseDown={handleMouseDown}
              className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-3.5 h-3.5 text-white/20" />
                <span
                  className="text-[9px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: accent }}
                >
                  {phaseLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-2 h-[2px] rounded-full bg-current"
                  />
                </button>
                <button
                  onClick={onClose}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {/* Timer display */}
                  <div className="flex flex-col items-center px-5 pt-3 pb-2">
                    <span
                      ref={timeDisplayRef}
                      className="text-4xl font-medium tabular-nums leading-none tracking-tighter text-[#f4f4f5]"
                      style={{
                        fontFamily:
                          "var(--font-sans), system-ui, sans-serif",
                        letterSpacing: "-0.04em",
                        textShadow: `0 0 30px ${accent}33`,
                      }}
                    >
                      00:00
                    </span>

                    {/* Paused badge */}
                    {!isActive && accumulatedTime > 0 && (
                      <span className="mt-1.5 text-[9px] font-medium tracking-[0.1em] uppercase text-white/30 px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.03]">
                        PAUSED
                      </span>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-2 px-4 pb-3 pt-1">
                    <button
                      onClick={onRestart}
                      title="Restart"
                      className="w-8 h-8 rounded-full border border-white/[0.06] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70 flex items-center justify-center transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onTogglePlayPause}
                      title={isActive ? "Pause" : "Resume"}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isActive
                          ? "border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.1]"
                          : "border text-[#0a0a0f] hover:opacity-85"
                      )}
                      style={
                        !isActive
                          ? {
                              background: accent,
                              borderColor: `${accent}66`,
                              boxShadow: `0 0 16px ${accent}44`,
                            }
                          : undefined
                      }
                    >
                      {isActive ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                      )}
                    </button>

                    <button
                      onClick={onEnd}
                      title="End Session"
                      className="w-8 h-8 rounded-full border border-white/[0.06] bg-white/[0.04] text-white/40 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 flex items-center justify-center transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current opacity-70" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
