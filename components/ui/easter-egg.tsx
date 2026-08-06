"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// The sequences to listen for
const SECRETS = {
  air1: {
    sequence: ["a", "i", "r", "1"],
    action: () => {
      triggerGoldenConfetti();
      toast.success("AIR 1 is yours. Keep grinding! 🏆", {
        description: "You've unlocked the ultimate motivation.",
        duration: 8000,
      });
    },
  },
  iitb: {
    sequence: ["i", "i", "t", "b"],
    action: () => {
      triggerBlueConfetti();
      toast.success("IIT Bombay calling... 🎓", {
        description: "The dream campus awaits your arrival.",
        duration: 8000,
      });
    },
  },
  andrew: {
    sequence: ["a", "n", "d", "r", "e", "w"],
    action: () => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"],
      });
      toast("Made with ❤️ by Andrew!", {
        description: "You found the creator's secret Easter egg!",
        icon: "✨",
        duration: 8000,
      });
    },
  },
  barrelroll: {
    sequence: ["d", "o", "a", "b", "a", "r", "r", "e", "l", "r", "o", "l", "l"],
    action: () => {
      document.body.style.transition = "transform 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      document.body.style.transform = "rotate(360deg)";
      setTimeout(() => {
        document.body.style.transition = "none";
        document.body.style.transform = "rotate(0deg)";
      }, 2000);
      toast("Do a barrel roll! 🛩️", { duration: 4000 });
    }
  },
  konami: {
    sequence: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"],
    action: () => {
      triggerCrazyConfetti();
      toast.success("Konami Code Activated! 🎮", {
        description: "Infinite focus unlocked.",
        duration: 8000,
      });
    }
  }
};

function triggerGoldenConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FCD34D", "#F59E0B", "#D97706", "#ffffff"]
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FCD34D", "#F59E0B", "#D97706", "#ffffff"]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

function triggerBlueConfetti() {
  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.5 },
    colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"],
    startVelocity: 45,
  });
}

function triggerCrazyConfetti() {
  const duration = 5000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 8,
      spread: 100,
      origin: { y: Math.random() * 0.5 },
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function EasterEgg() {
  const [keyBuffer, setKeyBuffer] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      setKeyBuffer((prev) => {
        const newBuffer = [...prev, e.key];
        // Keep buffer size manageable (max 15 chars for barrelroll)
        if (newBuffer.length > 15) {
          newBuffer.shift();
        }

        // Check against all secrets
        for (const [key, secret] of Object.entries(SECRETS)) {
          const { sequence, action } = secret;
          
          // If the end of the buffer matches the sequence exactly
          if (newBuffer.length >= sequence.length) {
            const bufferSlice = newBuffer.slice(-sequence.length);
            
            // Compare elements (case-insensitive for letters)
            const isMatch = bufferSlice.every((key, index) => {
              // Exact match for things like ArrowUp
              if (sequence[index].length > 1) return key === sequence[index];
              // Case insensitive match for letters
              return key.toLowerCase() === sequence[index].toLowerCase();
            });

            if (isMatch) {
              action();
              return []; // Clear buffer after successful match
            }
          }
        }

        return newBuffer;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null; // This component is invisible
}
