"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { TimerMode } from "../store/focus-store";

interface PipTimerContentProps {
  mode: TimerMode;
  accumulatedTime: number;
  lastResumeTime: number | null;
  totalTime: number;
  isActive: boolean;
  phase?: "study" | "shortBreak" | "longBreak";
  onTogglePlayPause: () => void;
  onEnd: () => void;
  onRestart: () => void;
}

/**
 * Compact timer UI rendered inside the Document PiP window (or fallback overlay).
 *
 * Uses a raw requestAnimationFrame loop (no Framer Motion) to keep the bundle
 * minimal inside the PiP context. All styles are inline so they work without
 * external CSS in the detached PiP document.
 */
export function PipTimerContent({
  mode,
  accumulatedTime,
  lastResumeTime,
  totalTime,
  isActive,
  phase,
  onTogglePlayPause,
  onEnd,
  onRestart,
}: PipTimerContentProps) {
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

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

  // requestAnimationFrame loop — computes elapsed from the same source of truth
  useEffect(() => {
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
  }, [accumulatedTime, lastResumeTime, isActive, mode, totalTime, formatTime]);

  // Phase label
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

  // Accent color per phase
  const accent =
    phase === "shortBreak"
      ? "#10b981"
      : phase === "longBreak"
      ? "#3b82f6"
      : "#818cf8";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "16px 20px",
        gap: "12px",
      }}
    >
      {/* Phase label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase" as const,
          color: accent,
          opacity: 0.9,
        }}
      >
        {phaseLabel}
      </div>

      {/* Time display */}
      <div
        ref={timeDisplayRef}
        style={{
          fontSize: "52px",
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#f4f4f5",
          textShadow: `0 0 40px ${accent}33`,
        }}
      >
        00:00
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "4px",
        }}
      >
        {/* Restart */}
        <button
          onClick={onRestart}
          title="Restart"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            color: "#a1a1aa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#e4e4e7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#a1a1aa";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlayPause}
          title={isActive ? "Pause" : "Resume"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: isActive
              ? "1px solid rgba(255,255,255,0.1)"
              : `1px solid ${accent}66`,
            background: isActive ? "rgba(255,255,255,0.08)" : accent,
            color: isActive ? "#e4e4e7" : "#0a0a0f",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            boxShadow: isActive ? "none" : `0 0 20px ${accent}44`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {isActive ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button
          onClick={onEnd}
          title="End Session"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            color: "#a1a1aa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#a1a1aa";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>

      {/* Paused indicator */}
      {!isActive && accumulatedTime > 0 && (
        <div
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#71717a",
            padding: "2px 10px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          PAUSED
        </div>
      )}
    </div>
  );
}
