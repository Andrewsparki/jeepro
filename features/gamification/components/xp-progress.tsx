"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XPDetails } from "../services/gamification";
import { Trophy, Sparkle, Star } from "lucide-react";
import confetti from "canvas-confetti";

import { AnimatedNumber } from "@/components/ui/animated-number";

interface XPProgressProps {
  xpDetails: XPDetails;
}

function SparklesEffect({ trigger }: { trigger: number }) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    
    const newSparkles = Array.from({ length: Math.floor(Math.random() * 3) + 3 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60, 
      y: (Math.random() - 0.5) * 40 - 20, 
      r: Math.random() * 180
    }));
    
    // Wrap in setTimeout to avoid cascading render lint error during commit phase
    setTimeout(() => {
      setSparkles(prev => [...prev, ...newSparkles]);
    }, 0);
    
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  }, [trigger]);

  return (
    <AnimatePresence>
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.2, 0], 
            x: sparkle.x, 
            y: sparkle.y, 
            rotate: sparkle.r 
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute pointer-events-none text-yellow-400 z-50"
        >
          <Sparkle className="w-4 h-4 fill-yellow-400" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export function XPProgress({ xpDetails }: XPProgressProps) {
  const prevXPRef = useRef(xpDetails.currentXP);
  const prevLevelRef = useRef(xpDetails.currentLevel);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (xpDetails.currentXP > prevXPRef.current) {
      setSparkleTrigger(prev => prev + 1);
    }
    
    if (xpDetails.currentLevel > prevLevelRef.current) {
      // Level Up!
      setShowLevelUp(true);
      
      const end = Date.now() + 3000;
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
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      setTimeout(() => setShowLevelUp(false), 4000);
    }

    prevXPRef.current = xpDetails.currentXP;
    prevLevelRef.current = xpDetails.currentLevel;
  }, [xpDetails.currentXP, xpDetails.currentLevel]);

  return (
    <>
      <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-xl border border-accent/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Level</p>
              <h3 className="text-2xl font-bold">Level <AnimatedNumber value={xpDetails.currentLevel} /></h3>
            </div>
          </div>
          <div className="text-right relative">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total XP</p>
            <p className="text-2xl font-bold text-accent relative inline-flex items-center justify-end">
              <AnimatedNumber value={xpDetails.currentXP} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <SparklesEffect trigger={sparkleTrigger} />
              </div>
            </p>
          </div>
        </div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span><AnimatedNumber value={xpDetails.progressPercentage} />% to Level {xpDetails.currentLevel + 1}</span>
            <span><AnimatedNumber value={xpDetails.nextLevelXP} /> XP needed</span>
          </div>
          
          <style>{`
            @keyframes xp-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
          <div className="h-3 w-full bg-surface border border-white/10 rounded-full overflow-hidden p-0.5 transition-all duration-150 ease-out hover:shadow-[0_0_12px_rgba(37,99,235,0.3)] cursor-default">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpDetails.progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-accent rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.4)]"
            >
              <div 
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                style={{ animation: 'xp-shimmer 2s linear infinite' }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden bg-background/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
              className="bg-background/80 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-pink-500/20 blur-xl" />
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20 rotate-12 relative z-10">
                <Star className="w-12 h-12 text-white fill-white" />
              </div>
              <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-2 relative z-10">
                Level Up!
              </h2>
              <p className="text-xl text-muted-foreground font-medium relative z-10">
                You reached Level <span className="text-accent font-bold">{xpDetails.currentLevel}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
