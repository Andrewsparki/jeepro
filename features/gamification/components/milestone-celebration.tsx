"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface MilestoneCelebrationProps {
  streakDays: number;
}

export function MilestoneCelebration({ streakDays }: MilestoneCelebrationProps) {
  const prevStreakRef = useRef(streakDays);

  useEffect(() => {
    // Check if streak just increased to a milestone
    if (streakDays > prevStreakRef.current) {
      const isMilestone = streakDays === 7 || streakDays === 30 || streakDays === 100;
      
      if (isMilestone) {
        triggerMilestoneConfetti(streakDays);
      }
    }
    
    prevStreakRef.current = streakDays;
  }, [streakDays]);

  return null; // Purely a behavior component, no UI
}

function triggerMilestoneConfetti(streak: number) {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 20, spread: 360, ticks: 60, zIndex: 100 };

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 20 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults, 
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: streak >= 30 ? ['#F59E0B', '#FCD34D'] : undefined
    });
    confetti({
      ...defaults, 
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: streak >= 30 ? ['#F59E0B', '#FCD34D'] : undefined
    });
  }, 250);
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
