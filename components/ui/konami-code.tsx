"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function KonamiCode() {
  const [, setInputSequence] = useState<string[]>([]);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const partyModeRef = useRef(false);

  const triggerPartyMode = useCallback(() => {
    if (partyModeRef.current) return;
    
    setIsPartyMode(true);
    partyModeRef.current = true;

    // Fire confetti from edges
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();

    // Reset party mode after animation
    setTimeout(() => {
      setIsPartyMode(false);
      partyModeRef.current = false;
    }, duration + 1000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key;
      
      setInputSequence((prev) => {
        const newSequence = [...prev, key];
        if (newSequence.length > KONAMI_CODE.length) {
          newSequence.shift();
        }

        // Check if sequence matches
        if (newSequence.join(",") === KONAMI_CODE.join(",")) {
          triggerPartyMode();
          return [];
        }

        // Check if the current sequence is on the right track, otherwise reset
        const isMatch = newSequence.every((k, i) => k === KONAMI_CODE[i]);
        if (!isMatch) {
          return key === KONAMI_CODE[0] ? [key] : [];
        }

        return newSequence;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerPartyMode]);

  return (
    <AnimatePresence>
      {isPartyMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Subtle hue rotation overlay */}
          <motion.div 
            animate={{ 
              backgroundColor: ["rgba(59,130,246,0.1)", "rgba(139,92,246,0.1)", "rgba(236,72,153,0.1)", "rgba(59,130,246,0.1)"] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 mix-blend-screen"
          />
          
          {/* Floating celebratory text */}
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative bg-background/80 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Konami Code Unlocked
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">
              You found the hidden easter egg!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
