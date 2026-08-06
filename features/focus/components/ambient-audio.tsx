"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusStore, AmbientSound } from "../store/focus-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Check, CloudRain, Library, Trees, Waves, AudioWaveform } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const SOUNDS: { id: AmbientSound; label: string; icon: any }[] = [
  { id: 'none', label: 'None', icon: Music },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'forest', label: 'Forest', icon: Trees },
  { id: 'ocean', label: 'Ocean Waves', icon: Waves },
  { id: 'brown', label: 'Brown Noise', icon: AudioWaveform },
  { id: 'white', label: 'White Noise', icon: AudioWaveform },
];

export const AmbientAudio = React.memo(function AmbientAudio() {
  const { ambientSound, setAmbientSound, soundVolume, setSoundVolume } = useFocusStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const currentSound = SOUNDS.find(s => s.id === ambientSound) || SOUNDS[0];
  const displayVolume = isMuted ? 0 : Math.round(soundVolume * 100);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "rounded-full px-5 h-11 border border-white/5 bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300",
            ambientSound !== 'none' 
              ? "text-accent hover:bg-white/10 hover:border-white/10" 
              : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
          )}
        >
          {ambientSound !== 'none' && !isMuted ? (
            <Volume2 className="w-4 h-4 mr-2" />
          ) : (
            <Music className="w-4 h-4 mr-2 opacity-70" />
          )}
          <span className="font-medium tracking-wide">
            {ambientSound !== 'none' ? currentSound.label : 'Ambient Sound'}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden" 
        align="end"
        sideOffset={20}
      >
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="font-semibold text-base text-foreground tracking-tight">Soundscapes</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent/90 border border-accent/20">
                  Coming Soon
                </span>
                <p className="text-xs text-muted-foreground">Playback in next update</p>
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
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted || displayVolume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
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

        <div className="h-px bg-white/5 w-full" />

        <div className="p-2 space-y-0.5 max-h-[240px] overflow-y-auto custom-scrollbar">
          {SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isActive = ambientSound === sound.id;
            
            return (
              <button
                key={sound.id}
                onClick={() => setAmbientSound(sound.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 group relative overflow-hidden",
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
                    className="relative z-10"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
});
