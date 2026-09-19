"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useFocusStore, AmbientSound } from "../store/focus-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Check, CloudRain, Library, Trees, Waves, AudioWaveform } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

import { useSettings } from "@/providers/settings-provider";
import { useAmbientSound } from "../hooks/use-ambient-sound";

const SOUNDS: { id: AmbientSound; label: string; icon: React.ElementType }[] = [
  { id: 'none', label: 'None', icon: Music },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'forest', label: 'Forest', icon: Trees },
  { id: 'ocean', label: 'Ocean Waves', icon: Waves },
  { id: 'brown', label: 'Brown Noise', icon: AudioWaveform },
  { id: 'white', label: 'White Noise', icon: AudioWaveform },
];

interface AmbientAudioProps {
  className?: string;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const AmbientAudio = React.memo(function AmbientAudio({
  className,
  contentClassName,
  side = "top",
  align = "center",
}: AmbientAudioProps = {}) {
  const { ambientSound, setAmbientSound, soundVolume, setSoundVolume } = useFocusStore();
  const { playSound } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const { isAudioActive } = useAmbientSound(isMuted);

  const currentSound = SOUNDS.find(s => s.id === ambientSound) || SOUNDS[0];
  const displayVolume = isMuted ? 0 : Math.round(soundVolume * 100);
  const shouldReduceMotion = useReducedMotion();

  const activeItemRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (isOpen && activeItemRef.current) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      if (open) playSound("pop-up");
      setIsOpen(open);
    }}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={!shouldReduceMotion ? { scale: 1.025 } : undefined}
          whileTap={!shouldReduceMotion ? { scale: 0.96 } : undefined}
          className="inline-flex"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => playSound("pop-up")}
            className={cn(
              "rounded-full px-4 h-10 border transition-all duration-300 shadow-xs",
              isAudioActive && !isMuted 
                ? "text-accent bg-accent/15 border-accent/30 hover:bg-accent/25 shadow-[0_0_16px_rgba(var(--accent),0.15)]" 
                : "border-white/8 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
              className
            )}
          >
            {isAudioActive && !isMuted ? (
              <div className="flex items-center gap-0.5 h-3.5 mr-2" aria-hidden="true">
                {[0.55, 1, 0.45].map((initialH, i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 rounded-full bg-accent inline-block"
                    animate={!shouldReduceMotion ? {
                      height: ["30%", "100%", "30%"],
                    } : undefined}
                    transition={{
                      duration: 0.85 + i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.18,
                    }}
                    style={{ height: `${initialH * 100}%` }}
                  />
                ))}
              </div>
            ) : isAudioActive ? (
              <Volume2 className="w-4 h-4 mr-2" />
            ) : (
              <Music className="w-4 h-4 mr-2 opacity-70" />
            )}
            <span className="font-medium tracking-wide">
              {isAudioActive ? currentSound.label : 'Ambient Sound'}
            </span>
          </Button>
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent 
        align={align}
        side={side}
        sideOffset={14}
        collisionPadding={12}
        data-lenis-prevent
        className={cn(
          "w-80 p-0 rounded-2xl border border-white/10 bg-black/75 dark:bg-black/85 backdrop-blur-3xl shadow-2xl z-50",
          "flex flex-col overflow-hidden",
          contentClassName
        )}
        style={{
          maxHeight: "min(var(--radix-popover-content-available-height, calc(100dvh - 28px)), 460px)",
        }}
      >
        {/* Fixed Header & Volume Controls */}
        <div className="p-5 sm:p-6 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div>
              <h4 className="font-semibold text-base text-foreground tracking-tight">Soundscapes</h4>
              <div className="flex items-center gap-2 mt-1">
                {ambientSound !== 'none' && !isMuted ? (
                  <>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Playing
                    </span>
                    <p className="text-xs text-muted-foreground">{currentSound.label}</p>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground border border-white/10">
                      Off
                    </span>
                    <p className="text-xs text-muted-foreground">Focus & study audio</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-muted-foreground">Volume</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={displayVolume}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={cn(
                    "tabular-nums transition-colors",
                    isDraggingSlider ? "text-accent" : "text-foreground"
                  )}
                >
                  {displayVolume}%
                </motion.span>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={!shouldReduceMotion ? { scale: 1.1 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.88 } : undefined}
                onClick={() => {
                  playSound(isMuted ? "toggleOn" : "toggleOff");
                  setIsMuted(!isMuted);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted || displayVolume === 0 ? "Unmute audio" : "Mute audio"}
              >
                {isMuted || displayVolume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </motion.button>
              
              <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center"
                value={[isMuted ? 0 : soundVolume * 100]}
                onValueChange={(vals) => {
                  setSoundVolume(vals[0] / 100);
                  if (isMuted) setIsMuted(false);
                }}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                max={100}
                step={1}
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10">
                  <SliderPrimitive.Range className="absolute h-full bg-accent transition-all duration-75" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-accent bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:bg-accent hover:border-background active:scale-95 cursor-grab active:cursor-grabbing" />
              </SliderPrimitive.Root>
            </div>
          </div>
        </div>

        {/* Fixed Visual Divider */}
        <div className="h-px bg-white/5 w-full shrink-0" />

        {/* Internally Scrollable Sound Options List */}
        <div 
          data-lenis-prevent
          className="p-2 space-y-0.5 overflow-y-auto flex-1 min-h-0 overscroll-contain custom-scrollbar touch-pan-y select-none"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isActive = ambientSound === sound.id;
            
            return (
              <motion.button
                key={sound.id}
                ref={isActive ? activeItemRef : undefined}
                whileHover={!shouldReduceMotion ? { x: 2 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  playSound("click");
                  setAmbientSound(sound.id);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors duration-200 group relative overflow-hidden shrink-0",
                  isActive 
                    ? "bg-accent/15 text-accent font-medium" 
                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sound-bg" 
                    className="absolute inset-0 bg-accent/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="flex items-center gap-3 relative z-10">
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="tracking-wide">{sound.label}</span>
                </div>
                
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative z-10"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
});
