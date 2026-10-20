"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface AiCinematicIntroProps {
  onComplete: () => void;
  onClose?: () => void;
  isFullscreen?: boolean;
}

/**
 * JEE Pro AI Assistant — Luxury Motion Design Brand Ident
 * Art Direction: Restrained, architectural, editorial luxury title sequence.
 * Motion Engineering: After Effects-style keyframed kinematics, custom cubic beziers,
 * overlapping causal phases, stroke-dash path drawing, staggered typography, and shutter transition.
 * 
 * Timeline (1.75s Total Duration):
 * - Scene 1 (0.00s - 0.48s): The Cut — Fast horizontal streak cuts across, awakening the horizon.
 * - Scene 2 (0.30s - 0.85s): The Mark — Sparkle contour draws in as streak passes; fill unmasks and settles.
 * - Scene 3 (0.65s - 1.25s): Typography — Staggered character baseline rise for "JEE PRO" + quiet "AI ASSISTANT" follow-through.
 * - Scene 4 (1.28s - 1.75s): The Entrance — Coordinated ident exit + top & bottom shutters split to reveal interface.
 */
export function AiCinematicIntro({ onComplete, onClose }: AiCinematicIntroProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1750);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Character breakdown for "JEE PRO" with fine-grained After Effects-style stagger
  const word1 = [
    { char: "J", delay: "0.65s" },
    { char: "E", delay: "0.68s" },
    { char: "E", delay: "0.71s" },
  ];
  const word2 = [
    { char: "P", delay: "0.77s" },
    { char: "R", delay: "0.80s" },
    { char: "O", delay: "0.83s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-40 overflow-hidden rounded-[inherit] select-none pointer-events-none"
    >
      {/* -------------------------------------------------------------
          SCENE 4: ARCHITECTURAL SHUTTER PANELS
          Cover the modal completely from frame 0 (translateY 0%),
          then split at 1.28s along the cut axis.
          ------------------------------------------------------------- */}

      {/* Top Shutter */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#070709] pointer-events-auto overflow-hidden z-20"
        style={{
          animation: "ai-shutter-up 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          willChange: "transform",
        }}
      >
        {/* Hairline light edge at bottom of top shutter */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
          style={{
            animation: "ai-shutter-hairline 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          }}
        />
      </div>

      {/* Bottom Shutter */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#070709] pointer-events-auto overflow-hidden z-20"
        style={{
          animation: "ai-shutter-down 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          willChange: "transform",
        }}
      >
        {/* Hairline light edge at top of bottom shutter */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
          style={{
            animation: "ai-shutter-hairline 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          }}
        />
      </div>

      {/* Top-Right Dismiss Control (always responsive during intro) */}
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer pointer-events-auto"
          title="Close assistant"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* -------------------------------------------------------------
          IDENT COMPOSITION (SCENES 1, 2, 3)
          Positioned at z-30 between background and user dismiss button.
          Dissolves and ascends slightly at 1.28s as shutters begin parting.
          ------------------------------------------------------------- */}
      <div
        className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
        style={{
          animation: "ai-luxury-ident-exit 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          willChange: "opacity, transform",
        }}
      >
        {/* Soft atmospheric depth highlight (restrained luxury glow) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.12) 0%, transparent 65%)",
          }}
        />

        {/* -------------------------------------------------------------
            SCENE 1: THE CUT (Dynamic Leading Beam & Horizon Line)
            ------------------------------------------------------------- */}

        {/* 1. Fast Leading Light Beam Streak sweeping across horizon */}
        <div
          className="absolute top-1/2 left-0 w-64 h-[2px] pointer-events-none z-10"
          style={{
            animation: "ai-luxury-streak-sweep 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.85) 85%, #ffffff 100%)",
            boxShadow: "0 0 12px rgba(255, 255, 255, 0.8)",
          }}
        />

        {/* 2. Horizon Line — Wakes in streak's wake and steadies along cut axis */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[1px] pointer-events-none z-10"
          style={{
            animation: "ai-luxury-horizon 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 15%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.15) 85%, transparent 100%)",
          }}
        />

        {/* -------------------------------------------------------------
            SCENE 2: THE MARK (Emblem Stroke Draw & Physical Fill Settle)
            ------------------------------------------------------------- */}
        <div className="relative mb-5 flex items-center justify-center z-20 w-16 h-16 sm:w-20 sm:h-20">
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 80 80"
            fill="none"
          >
            {/* Layer A: Razor Stroke Outline Drawing in streak's wake */}
            <path
              d="M 40 4 C 40 22 22 40 4 40 C 22 40 40 58 40 76 C 40 58 58 40 76 40 C 58 40 40 22 40 4 Z"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="240"
              strokeDashoffset="240"
              style={{
                animation: "ai-luxury-stroke-draw 1.75s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                willChange: "stroke-dashoffset, opacity",
              }}
            />

            {/* Layer B: Solid Emblem Fill with dimensional push & micro-settle */}
            <path
              d="M 40 4 C 40 22 22 40 4 40 C 22 40 40 58 40 76 C 40 58 58 40 76 40 C 58 40 40 22 40 4 Z"
              fill="#ffffff"
              className="drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]"
              style={{
                animation: "ai-luxury-mark-fill 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                transformOrigin: "40px 40px",
                willChange: "clip-path, transform, opacity",
              }}
            />

            {/* Secondary Refined Micro Diamond — Staggered Orbital Snap */}
            <circle
              cx="64"
              cy="18"
              r="2.5"
              fill="#ffffff"
              style={{
                animation: "ai-luxury-satellite-snap 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                transformOrigin: "64px 18px",
                willChange: "transform, opacity",
              }}
            />
          </svg>
        </div>

        {/* -------------------------------------------------------------
            SCENE 3: EDITORIAL TYPOGRAPHY
            ------------------------------------------------------------- */}
        <div className="flex flex-col items-center z-20">
          {/* "JEE PRO" — Directional Baseline Reveal with Staggered Characters & Tracking Settle */}
          <div className="overflow-hidden py-1">
            <h1
              className="font-sans text-xl sm:text-2xl font-bold text-white uppercase select-none flex items-center"
              style={{
                animation: "ai-luxury-jee-tracking 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                willChange: "letter-spacing",
              }}
            >
              {/* Word 1: "JEE" */}
              <span className="inline-flex">
                {word1.map((item, idx) => (
                  <span
                    key={`char-1-${idx}`}
                    className="inline-block"
                    style={{
                      animation: "ai-luxury-char-rise 0.32s cubic-bezier(0.25, 1, 0.5, 1) both",
                      animationDelay: item.delay,
                      willChange: "transform, opacity",
                    }}
                  >
                    {item.char}
                  </span>
                ))}
              </span>

              {/* Architectural Inter-word Spacer */}
              <span className="inline-block w-[0.32em]" />

              {/* Word 2: "PRO" */}
              <span className="inline-flex">
                {word2.map((item, idx) => (
                  <span
                    key={`char-2-${idx}`}
                    className="inline-block"
                    style={{
                      animation: "ai-luxury-char-rise 0.32s cubic-bezier(0.25, 1, 0.5, 1) both",
                      animationDelay: item.delay,
                      willChange: "transform, opacity",
                    }}
                  >
                    {item.char}
                  </span>
                ))}
              </span>
            </h1>
          </div>

          {/* "AI ASSISTANT" — Directional Baseline Subtitle with Delayed Follow-Through */}
          <div className="overflow-hidden mt-1">
            <span
              className="block font-mono text-[10px] sm:text-[11px] font-medium text-white/60 uppercase select-none"
              style={{
                animation: "ai-luxury-assistant-follow 1.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                willChange: "transform, opacity, letter-spacing",
              }}
            >
              AI ASSISTANT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
