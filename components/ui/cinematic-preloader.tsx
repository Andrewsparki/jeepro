"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const PRELOAD_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/login",
  "/signup",
  "/dashboard",
  "/dashboard/study",
  "/dashboard/study/physics",
  "/dashboard/study/chemistry",
  "/dashboard/study/mathematics",
  "/dashboard/syllabus",
  "/dashboard/tests",
  "/dashboard/analytics",
  "/dashboard/focus",
  "/dashboard/planner",
  "/dashboard/settings",
  "/dashboard/history",
];

const TELEMETRY_STEPS = [
  "INITIALIZING QUANTUM CORE & SHADERS...",
  "PRE-FETCHING ALL 17 ROUTES & RUNTIMES...",
  "DECODING 90-CHAPTER SYLLABUS & FORMULAS...",
  "PRE-WARMING 120 FPS GPU COMPOSITOR VRAM...",
  "SYSTEM READY • LAUNCHING OPERATING SYSTEM.",
];

export function CinematicPreloader() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Check if already played in this browser tab session
    const hasPlayed = sessionStorage.getItem("jee-pro-preloader-seen");
    if (hasPlayed) {
      setIsVisible(false);
      return;
    }

    let isMounted = true;
    const startTime = performance.now();
    const DURATION = 2400; // 2.4 seconds rich boot sequence

    // 1. Pre-fetch All Next.js Routes into Browser Cache
    const prefetchRoutes = () => {
      PRELOAD_ROUTES.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {
          // Ignore prefetch errors in dev mode
        }
      });
    };

    // 2. Pre-warm Web Fonts & GPU Shaders
    const prewarmSystem = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
        }

        // Force browser to compile key CSS backdrop-filters into GPU VRAM
        const offscreenCanvas = document.createElement("div");
        offscreenCanvas.style.cssText = "position:absolute;width:1px;height:1px;opacity:0.01;pointer-events:none;backdrop-filter:blur(30px);transform:translateZ(0);";
        document.body.appendChild(offscreenCanvas);
        requestAnimationFrame(() => {
          offscreenCanvas.remove();
        });
      } catch {
        // Fallback gracefully
      }
    };

    prefetchRoutes();
    prewarmSystem();

    let animationFrameId: number;

    const animateProgress = (currentTime: number) => {
      if (!isMounted) return;
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / DURATION) * 100));

      setProgress(rawProgress);

      if (rawProgress < 20) setStepIndex(0);
      else if (rawProgress < 45) setStepIndex(1);
      else if (rawProgress < 70) setStepIndex(2);
      else if (rawProgress < 92) setStepIndex(3);
      else setStepIndex(4);

      if (elapsed < DURATION) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        setTimeout(() => {
          if (isMounted) {
            setIsVisible(false);
            sessionStorage.setItem("jee-pro-preloader-seen", "true");
          }
        }, 250);
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        setIsVisible(false);
        sessionStorage.setItem("jee-pro-preloader-seen", "true");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem("jee-pro-preloader-seen", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            opacity: 0.95,
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } 
          }}
          onClick={handleSkip}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#02040A] text-white select-none cursor-pointer overflow-hidden p-8 sm:p-14 transform-gpu"
        >
          {/* Background Ambient Radial Halos */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,165,233,0.25)_0%,rgba(168,85,247,0.15)_45%,transparent_70%)] blur-[110px] pointer-events-none" />

          {/* Micro Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Top Brand Tagline & Skip Indicator */}
          <div className="w-full flex items-center justify-between max-w-5xl z-10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono tracking-[0.3em] text-cyan-300 uppercase font-semibold">
                STUDY OPERATING SYSTEM
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-400 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CLICK OR [ESC] TO SKIP</span>
            </div>
          </div>

          {/* Center Monogram, Equalizer & Telemetry */}
          <div className="flex flex-col items-center justify-center text-center z-10 my-auto">
            {/* Geometric Glowing Monogram */}
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8 flex items-center justify-center"
            >
              {/* Outer Glowing Ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-cyan-500/40 to-purple-600/40 blur-2xl animate-pulse" />
              
              {/* Monogram Box */}
              <div className="relative w-full h-full rounded-3xl bg-black/70 border border-white/25 backdrop-blur-3xl flex items-center justify-center shadow-[0_0_45px_rgba(14,165,233,0.45),inset_0_1px_2px_rgba(255,255,255,0.35)]">
                <span className="font-black text-3xl sm:text-4xl tracking-tighter text-white">
                  J<span className="text-cyan-400">P</span>
                </span>
              </div>
            </motion.div>

            {/* Brand Title */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-3">
              JEE <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]">PRO</span>
            </h1>

            {/* Dynamic Telemetry Log */}
            <p className="text-xs sm:text-sm font-mono tracking-widest text-slate-300 uppercase h-6 min-w-[320px] transition-all duration-200">
              {TELEMETRY_STEPS[stepIndex]}
            </p>

            {/* Micro Equalizer Frequency Bars */}
            <div className="flex items-center gap-1 mt-4">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 60].map((h, i) => (
                <div 
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-400 to-indigo-400 rounded-full animate-pulse"
                  style={{
                    height: `${(h * (progress / 100)) + 6}px`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: "0.8s"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Progress Bar & Counter */}
          <div className="w-full max-w-lg z-10 flex flex-col items-center gap-3">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-[11px] tracking-wider text-slate-400">FULL SYSTEM PRE-WARMING • 120 FPS</span>
              <span className="font-extrabold text-cyan-400 text-sm">{progress}%</span>
            </div>

            {/* Glowing Linear Progress Meter */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.9)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
