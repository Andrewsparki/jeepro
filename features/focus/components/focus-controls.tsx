"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw, Maximize, Minimize, Settings2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusStore } from "../store/focus-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FocusControlsProps {
  isActive: boolean;
  onTogglePlayPause: () => void;
  onEnd: () => void;
  onRestart: () => void;
}

export function FocusControls({ isActive, onTogglePlayPause, onEnd, onRestart }: FocusControlsProps) {
  const { isImmersive, toggleImmersive, defaultStudyTime, setDefaultStudyTime, timerMode, setTimerMode } = useFocusStore();

  const premiumTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] };

  return (
    <div className="flex flex-col items-center gap-6 mt-14 p-6 sm:px-10 rounded-[2.5rem] bg-black/20 backdrop-blur-3xl border-t border-white/5 shadow-2xl relative z-20">
      {/* Primary Controls */}
      <div className="flex items-center gap-6 sm:gap-8">
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ y: 0 }}
          transition={premiumTransition}
          onClick={onRestart}
          className="h-14 w-14 flex items-center justify-center rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground transition-colors shadow-lg"
          title="Restart (R)"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ y: 0 }}
          transition={premiumTransition}
          onClick={onTogglePlayPause}
          className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center transition-colors shadow-2xl relative group",
            isActive 
              ? "bg-white/10 text-foreground hover:bg-white/15 border border-white/10" 
              : "bg-accent text-accent-foreground border border-accent/50"
          )}
          title={isActive ? "Pause (Space)" : "Start (Space)"}
        >
          {/* Subtle glow behind the play button when not active */}
          {!isActive && (
            <div className="absolute inset-0 rounded-full bg-accent blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          )}
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isActive ? "pause" : "play"}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={premiumTransition}
              >
                {isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ y: 0 }}
          transition={premiumTransition}
          onClick={onEnd}
          className="h-14 w-14 flex items-center justify-center rounded-full border border-white/5 bg-white/5 hover:bg-destructive/20 hover:border-destructive/30 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] text-muted-foreground hover:text-destructive transition-colors shadow-lg group"
          title="End Session"
        >
          <Square className="w-4 h-4 fill-current opacity-70 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>

      {/* Secondary Controls (Immersive & Settings) */}
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} transition={premiumTransition}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleImmersive}
            className={cn(
              "rounded-full px-5 h-10 border transition-all shadow-sm",
              isImmersive 
                ? "bg-accent/15 text-accent hover:bg-accent/25 border-accent/30 hover:shadow-[0_8px_30px_rgba(var(--accent),0.15)]" 
                : "border-white/5 text-muted-foreground bg-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/10 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
            )}
            title="Toggle Immersive Mode (M)"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", transitionDuration: "250ms" }}
          >
            {isImmersive ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
            {isImmersive ? "Exit Immersive" : "Immersive Mode"}
          </Button>
        </motion.div>

        <Popover>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} transition={premiumTransition}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-5 h-10 border border-white/5 text-muted-foreground bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-foreground shadow-sm hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", transitionDuration: "250ms" }}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 rounded-2xl border-white/10 bg-black/50 backdrop-blur-3xl shadow-2xl overflow-hidden" align="center" side="bottom" sideOffset={16}>
            <div className="p-6 space-y-6">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground tracking-tight">
                <Settings className="w-4 h-4 text-muted-foreground" />
                Timer Settings
              </h4>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Timer Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['countdown', 'stopwatch', 'pomodoro'] as const).map((m) => (
                      <Button
                        key={m}
                        variant="outline"
                        size="sm"
                        onClick={() => setTimerMode(m)}
                        className={cn(
                          "capitalize text-xs h-9 transition-colors",
                          timerMode === m 
                            ? "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30 hover:text-accent" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/10",
                          isActive && "opacity-50 pointer-events-none"
                        )}
                        disabled={isActive}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                {timerMode !== 'stopwatch' && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Duration (minutes)</Label>
                    <Input
                      type="number"
                      disabled={isActive}
                      value={Math.floor(defaultStudyTime / 60)}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value);
                        if (!isNaN(mins) && mins > 0) {
                          setDefaultStudyTime(mins * 60);
                        }
                      }}
                      className={cn(
                        "bg-black/40 border-white/10 h-10 text-sm focus-visible:ring-accent/50 rounded-lg",
                        isActive && "opacity-50 pointer-events-none"
                      )}
                    />
                  </div>
                )}
                
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-destructive flex items-center justify-center font-medium mt-2"
                    >
                      Pause timer to change settings
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
