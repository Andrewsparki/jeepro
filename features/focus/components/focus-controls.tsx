"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  Settings2, 
  PictureInPicture2, 
  X,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusStore } from "../store/focus-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/providers/settings-provider";
import { AmbientAudio } from "./ambient-audio";

interface FocusControlsProps {
  isActive: boolean;
  onTogglePlayPause: () => void;
  onEnd: () => void;
  onRestart: () => void;
  onPopOut: () => void;
  isPipOpen: boolean;
}

const STUDY_PRESETS = [15, 25, 45, 60, 90];
const BREAK_PRESETS = [5, 10, 15];

export function FocusControls({ 
  isActive, 
  onTogglePlayPause, 
  onEnd, 
  onRestart, 
  onPopOut, 
  isPipOpen 
}: FocusControlsProps) {
  const { 
    isImmersive, 
    toggleImmersive, 
    defaultStudyTime, 
    setDefaultStudyTime,
    defaultBreakTime,
    setDefaultBreakTime,
    pomodoroCycles,
    setPomodoroCycles,
    timerMode, 
    setTimerMode 
  } = useFocusStore();
  const { playSound } = useSettings();
  const shouldReduceMotion = useReducedMotion();

  const studyMinutes = Math.floor(defaultStudyTime / 60);
  const breakMinutes = Math.floor(defaultBreakTime / 60);

  const springTransition = { type: "spring" as const, stiffness: 500, damping: 28 };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 z-20 shrink-0">
      {/* ── Main Unified Control Dock ── */}
      <div 
        className={cn(
          "w-full max-w-fit mx-auto rounded-full p-2 sm:p-2.5",
          "bg-black/40 dark:bg-zinc-950/70 backdrop-blur-2xl border border-white/10 dark:border-white/8",
          "shadow-[0_16px_40px_rgba(0,0,0,0.4)]",
          "flex items-center justify-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap"
        )}
      >
        {/* ── Left Wing: Atmosphere (Ambient Audio) ── */}
        <AmbientAudio 
          className="h-10 px-3.5 sm:px-4 text-xs font-medium rounded-full bg-white/5 border-white/8 hover:bg-white/10"
          side="top"
          align="start"
        />

        {/* ── Left Divider ── */}
        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* ── Center Core: Hero Playback Trio ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Reset Button with Tactile Rotation Spring */}
          <motion.button
            whileHover={!shouldReduceMotion ? { scale: 1.08, rotate: -15 } : undefined}
            whileTap={!shouldReduceMotion ? { scale: 0.9, rotate: -180 } : undefined}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            onClick={() => {
              playSound("pop-down");
              onRestart();
            }}
            className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full border border-white/8 bg-white/5 hover:bg-white/10 hover:text-foreground text-muted-foreground transition-colors shadow-xs"
            title="Restart Session (R)"
            aria-label="Restart Timer"
          >
            <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </motion.button>

          {/* Hero Play / Pause Button with Premium Tactile Motion */}
          <motion.button
            whileHover={!shouldReduceMotion ? { scale: 1.07 } : undefined}
            whileTap={!shouldReduceMotion ? { scale: 0.91 } : undefined}
            transition={springTransition}
            onClick={onTogglePlayPause}
            className={cn(
              "h-13 w-13 sm:h-15 sm:w-15 rounded-full flex items-center justify-center transition-all duration-300 relative group shrink-0",
              isActive 
                ? "bg-white/12 text-foreground hover:bg-white/18 border border-white/15 shadow-md" 
                : "bg-accent text-accent-foreground border border-accent/40 shadow-[0_0_25px_rgba(var(--accent-rgb,79,70,229),0.35)]"
            )}
            title={isActive ? "Pause (Space)" : "Start (Space)"}
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
            aria-pressed={isActive}
          >
            {!isActive && !shouldReduceMotion && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-accent/40 blur-xl pointer-events-none" 
              />
            )}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isActive ? "pause" : "play"}
                  initial={{ opacity: 0, scale: 0.7, rotate: isActive ? -30 : 30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: isActive ? 30 : -30 }}
                  transition={{ type: "spring", stiffness: 600, damping: 28 }}
                >
                  {isActive ? (
                    <Pause className="w-6 h-6 sm:w-6.5 sm:h-6.5 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-6.5 sm:h-6.5 fill-current translate-x-0.5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.button>

          {/* End Session Button */}
          <motion.button
            whileHover={!shouldReduceMotion ? { scale: 1.08 } : undefined}
            whileTap={!shouldReduceMotion ? { scale: 0.9 } : undefined}
            transition={springTransition}
            onClick={() => {
              playSound("danger");
              onEnd();
            }}
            className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full border border-white/8 bg-white/5 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 text-muted-foreground transition-colors shadow-xs group"
            title="End Session & Save"
            aria-label="End Session"
          >
            <Square className="w-4 h-4 fill-current opacity-70 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* ── Right Divider ── */}
        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* ── Right Wing: Settings & View Tools ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Timer Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playSound("pop-up")}
                  className={cn(
                    "rounded-full px-3 sm:px-3.5 h-10 border text-xs font-medium transition-all shadow-xs gap-1.5",
                    "border-white/8 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                  title="Timer Settings"
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden md:inline font-mono tracking-tight">
                    {timerMode === "stopwatch" ? "Timer" : `${studyMinutes}m`}
                  </span>
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 rounded-2xl border border-white/10 bg-black/75 dark:bg-zinc-950/90 backdrop-blur-3xl shadow-2xl overflow-hidden z-50" 
              align="center" 
              side="top" 
              sideOffset={14}
            >
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground tracking-tight">
                    <Clock className="w-4 h-4 text-accent" />
                    Timer Configuration
                  </h4>
                  {isActive && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Locked
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                      Timer Mode
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
                      {(['countdown', 'stopwatch', 'pomodoro'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          disabled={isActive}
                          onClick={() => {
                            playSound("click");
                            setTimerMode(m);
                          }}
                          className={cn(
                            "capitalize text-xs font-medium py-1.5 rounded-lg transition-all",
                            timerMode === m 
                              ? "bg-accent text-accent-foreground shadow-xs font-semibold" 
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                            isActive && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Presets & Input */}
                  {timerMode !== 'stopwatch' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Focus Duration
                        </Label>
                        <span className="text-xs font-mono font-medium text-foreground">{studyMinutes} min</span>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5">
                        {STUDY_PRESETS.map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            disabled={isActive}
                            onClick={() => {
                              playSound("click");
                              setDefaultStudyTime(mins * 60);
                            }}
                            className={cn(
                              "flex-1 text-xs py-1 rounded-lg border font-mono transition-all",
                              studyMinutes === mins
                                ? "bg-accent/20 border-accent/40 text-accent font-semibold"
                                : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                              isActive && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="number"
                          disabled={isActive}
                          min={1}
                          max={360}
                          value={studyMinutes}
                          onChange={(e) => {
                            const mins = parseInt(e.target.value);
                            if (!isNaN(mins) && mins > 0) {
                              setDefaultStudyTime(mins * 60);
                            }
                          }}
                          className={cn(
                            "bg-white/5 border-white/10 h-8 text-xs font-mono text-center focus-visible:ring-accent/40 rounded-lg",
                            isActive && "opacity-50 cursor-not-allowed"
                          )}
                        />
                        <span className="text-xs text-muted-foreground shrink-0">custom minutes</span>
                      </div>
                    </div>
                  )}

                  {/* Pomodoro Extra Settings */}
                  {timerMode === 'pomodoro' && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Break Duration
                          </Label>
                          <span className="text-xs font-mono font-medium text-foreground">{breakMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {BREAK_PRESETS.map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              disabled={isActive}
                              onClick={() => {
                                playSound("click");
                                setDefaultBreakTime(mins * 60);
                              }}
                              className={cn(
                                "flex-1 text-xs py-1 rounded-lg border font-mono transition-all",
                                breakMinutes === mins
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-semibold"
                                  : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                                isActive && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Cycles Before Long Break
                        </Label>
                        <div className="flex items-center gap-1">
                          {[2, 3, 4, 5].map((c) => (
                            <button
                              key={c}
                              type="button"
                              disabled={isActive}
                              onClick={() => {
                                playSound("click");
                                setPomodoroCycles(c);
                              }}
                              className={cn(
                                "w-7 h-7 text-xs rounded-lg border font-mono transition-all",
                                pomodoroCycles === c
                                  ? "bg-accent/20 border-accent/40 text-accent font-semibold"
                                  : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                                isActive && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <p className="text-[11px] text-amber-400/90 text-center font-medium pt-1">
                      Pause timer to adjust settings
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Picture-in-Picture Pop Out */}
          <motion.div whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playSound("swish");
                onPopOut();
              }}
              className={cn(
                "rounded-full h-10 px-3 sm:px-3.5 border transition-all text-xs font-medium shadow-xs gap-1.5",
                isPipOpen
                  ? "bg-accent/20 text-accent border-accent/40 shadow-xs"
                  : "border-white/8 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              title="Pop Out Picture-in-Picture (P)"
            >
              {isPipOpen ? <X className="w-4 h-4" /> : <PictureInPicture2 className="w-4 h-4" />}
              <span className="hidden lg:inline">{isPipOpen ? "Close Float" : "Pop Out"}</span>
            </Button>
          </motion.div>

          {/* Immersive Mode Toggle */}
          <motion.div whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playSound("swish");
                toggleImmersive();
              }}
              className={cn(
                "rounded-full h-10 px-3 sm:px-3.5 border transition-all text-xs font-medium shadow-xs gap-1.5",
                isImmersive 
                  ? "bg-accent/20 text-accent border-accent/40 shadow-xs" 
                  : "border-white/8 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              title={isImmersive ? "Exit Full Focus (Esc/M)" : "Full Focus Mode (M)"}
            >
              {isImmersive ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="hidden lg:inline">{isImmersive ? "Exit" : "Immersive"}</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Subtitle Quick Shortcut Hints (Fades during active focus) ── */}
      <motion.div 
        animate={{ opacity: isActive ? 0.25 : 0.65 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium tracking-wider select-none"
      >
        <motion.span whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} className="flex items-center gap-1 transition-transform cursor-pointer">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">Space</kbd>
          {isActive ? "Pause" : "Start"}
        </motion.span>
        <span>•</span>
        <motion.span whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} className="flex items-center gap-1 transition-transform cursor-pointer">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">R</kbd>
          Reset
        </motion.span>
        <span className="hidden sm:inline">•</span>
        <motion.span whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined} className="hidden sm:flex items-center gap-1 transition-transform cursor-pointer">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">M</kbd>
          Focus
        </motion.span>
      </motion.div>
    </div>
  );
}
