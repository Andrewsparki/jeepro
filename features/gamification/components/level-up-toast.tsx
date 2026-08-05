"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronUp } from "lucide-react";
import confetti from "canvas-confetti";

interface LevelUpToastProps {
  currentLevel: number;
}

export function LevelUpToast({ currentLevel }: LevelUpToastProps) {
  const prevLevelRef = useRef(currentLevel);
  const [showToast, setShowToast] = useState(false);
  const [levelToDisplay, setLevelToDisplay] = useState(currentLevel);

  useEffect(() => {
    // Only trigger if level increased and it's not the initial mount level 1
    if (currentLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      setLevelToDisplay(currentLevel);
      setShowToast(true);
      
      // Minor confetti for level up
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#3B82F6", "#8B5CF6", "#F59E0B"]
      });

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000); // 5 seconds display

      return () => clearTimeout(timer);
    }
    
    prevLevelRef.current = currentLevel;
  }, [currentLevel]);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="relative group">
            {/* Glowing backdrop */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
            <div className="relative flex items-center gap-4 bg-background px-6 py-4 rounded-full border border-border/50 shadow-2xl overflow-hidden">
              {/* Shimmer sweep */}
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
              
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center relative">
                <Trophy className="w-6 h-6 text-accent" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute"
                >
                  <ChevronUp className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(37,99,235,1)]" />
                </motion.div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level Up!</span>
                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  You reached Level {levelToDisplay}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
