"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, RotateCcw, Trophy, AlertCircle } from "lucide-react";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

type GameState = "idle" | "waiting" | "ready" | "early" | "result";

export function ReflexChallengeActivity() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Guarantee cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  const handleStart = () => {
    cleanupTimer();
    dispatchInteractionSound("ui.press");
    setGameState("waiting");
    setReactionTime(null);

    // Random delay between 1.8s and 4.2s
    const randomDelay = Math.floor(Math.random() * 2400) + 1800;

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState("ready");
      dispatchInteractionSound("feedback.notification");
    }, randomDelay);
  };

  const handleTap = () => {
    if (gameState === "idle") {
      handleStart();
      return;
    }

    if (gameState === "waiting") {
      // Too early!
      cleanupTimer();
      dispatchInteractionSound("feedback.warning");
      setGameState("early");
      return;
    }

    if (gameState === "ready") {
      // Valid reflex tap
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      dispatchInteractionSound("feedback.success");
      setReactionTime(elapsed);
      setGameState("result");
      setBestTime((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
      return;
    }

    if (gameState === "early" || gameState === "result") {
      handleStart();
    }
  };

  const handleResetScores = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchInteractionSound("ui.press");
    cleanupTimer();
    setGameState("idle");
    setReactionTime(null);
    setBestTime(null);
  };

  const getRankBadge = (ms: number) => {
    if (ms < 200) return { label: "Godspeed Reflexes (Top 1%)", color: "text-[#5DC98B]" };
    if (ms < 250) return { label: "JEE Topper Speed (Top 5%)", color: "text-[#78A9FF]" };
    if (ms < 320) return { label: "Sharpened Focus (Solid)", color: "text-[#F1BE62]" };
    return { label: "Needs Caffeine / Sleep", color: "text-[#A4ADBB]" };
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4 select-none">
      {/* Header bar with stats */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2B3342]/70">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#78A9FF]" />
          <span className="text-xs font-semibold text-[#F5F7FB]">
            Neural Reaction Speed
          </span>
        </div>

        <div className="flex items-center gap-3">
          {bestTime !== null && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#5DC98B]">
              <Trophy className="w-3.5 h-3.5" />
              <span>Best: {bestTime}ms</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetScores}
            className="text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors cursor-pointer"
            title="Reset high score"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Tap Arena */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleTap();
          }
        }}
        className={cn(
          "w-full h-44 sm:h-48 rounded-xl border flex flex-col items-center justify-center p-6 text-center transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF]",
          gameState === "idle" &&
            "bg-[#121722] border-[#2B3342] hover:border-[#78A9FF]/40 hover:bg-[#141A26]",
          gameState === "waiting" &&
            "bg-[#1A1814] border-[#F1BE62]/40 text-[#F1BE62]",
          gameState === "ready" &&
            "bg-[#0E2419] border-[#5DC98B] shadow-[0_0_30px_rgba(93,201,139,0.25)] text-[#5DC98B]",
          gameState === "early" &&
            "bg-[#241315] border-[#F17C7C]/50 text-[#F17C7C]",
          gameState === "result" &&
            "bg-[#121927] border-[#78A9FF]/50 text-[#F5F7FB]"
        )}
      >
        {gameState === "idle" && (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#171D28] border border-[#2B3342] flex items-center justify-center mx-auto text-[#78A9FF]">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#F5F7FB]">
              Tap to Start Challenge
            </p>
            <p className="text-xs text-[#A4ADBB]">
              Wait for green, then tap immediately. Spacebar supported.
            </p>
          </div>
        )}

        {gameState === "waiting" && (
          <div className="space-y-1.5 animate-pulse">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#F1BE62]">
              Holding signal...
            </span>
            <p className="text-base sm:text-lg font-extrabold text-[#F5F7FB]">
              Wait for Green!
            </p>
          </div>
        )}

        {gameState === "ready" && (
          <div className="space-y-1 animate-bounce">
            <span className="text-xs uppercase tracking-widest font-mono font-black text-[#5DC98B]">
              Signal Active
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#5DC98B]">
              CLICK NOW!
            </p>
          </div>
        )}

        {gameState === "early" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F17C7C]">
              <AlertCircle className="w-4 h-4" />
              <span>Too early!</span>
            </div>
            <p className="text-sm font-semibold text-[#F5F7FB]">
              You clicked before the green signal.
            </p>
            <p className="text-xs text-[#A4ADBB]">Tap anywhere to retry.</p>
          </div>
        )}

        {gameState === "result" && reactionTime !== null && (
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-mono text-[#78A9FF]">
              Recorded Velocity
            </span>
            <p className="text-3xl sm:text-4xl font-mono font-black text-[#F5F7FB]">
              {reactionTime} <span className="text-base font-normal text-[#A4ADBB]">ms</span>
            </p>
            <p className={cn("text-xs font-semibold pt-1", getRankBadge(reactionTime).color)}>
              {getRankBadge(reactionTime).label}
            </p>
            <p className="text-[11px] text-[#A4ADBB] pt-1">
              Tap anywhere to test again.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#A4ADBB] px-1">
        <span>Typical human average: ~250ms</span>
        <span>Instant response: Space / Click</span>
      </div>
    </div>
  );
}
