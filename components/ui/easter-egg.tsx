"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

async function getConfetti() {
  const mod = await import("canvas-confetti");
  return mod.default || mod;
}

// The sequences to listen for
const SECRETS = {
  air1: {
    sequence: ["a", "i", "r", "1"],
    action: async () => {
      await triggerGoldenConfetti();
      toast.success("AIR 1 is yours. Keep grinding! 🏆", {
        description: "You've unlocked the ultimate motivation.",
        duration: 8000,
      });
    },
  },
  iitb: {
    sequence: ["i", "i", "t", "b"],
    action: async () => {
      await triggerBlueConfetti();
      toast.success("IIT Bombay calling... 🎓", {
        description: "The dream campus awaits your arrival.",
        duration: 8000,
      });
    },
  },
  andrew: {
    sequence: ["a", "n", "d", "r", "e", "w"],
    action: async () => {
      const confetti = await getConfetti();
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
      document.body.style.transition =
        "transform 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      document.body.style.transform = "rotate(360deg)";
      setTimeout(() => {
        document.body.style.transition = "none";
        document.body.style.transform = "rotate(0deg)";
      }, 2000);
      toast("Do a barrel roll! 🛩️", { duration: 4000 });
    },
  },
  konami: {
    sequence: [
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
    ],
    action: async () => {
      await triggerCrazyConfetti();
      toast.success("Konami Code Activated! 🎮", {
        description: "Infinite focus unlocked.",
        duration: 8000,
      });
    },
  },
};

async function triggerGoldenConfetti() {
  const confetti = await getConfetti();
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FCD34D", "#F59E0B", "#D97706", "#ffffff"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FCD34D", "#F59E0B", "#D97706", "#ffffff"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

async function triggerBlueConfetti() {
  const confetti = await getConfetti();
  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.5 },
    colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"],
    startVelocity: 45,
  });
}

async function triggerCrazyConfetti() {
  const confetti = await getConfetti();
  const duration = 5000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 8,
      spread: 100,
      origin: { y: Math.random() * 0.5 },
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function EasterEgg() {
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      bufferRef.current.push(e.key);
      if (bufferRef.current.length > 15) {
        bufferRef.current.shift();
      }

      // Check against all secrets
      for (const [, secret] of Object.entries(SECRETS)) {
        const { sequence, action } = secret;

        // If the end of the buffer matches the sequence exactly
        if (bufferRef.current.length >= sequence.length) {
          const bufferSlice = bufferRef.current.slice(-sequence.length);

          // Compare elements (case-insensitive for letters)
          const isMatch = bufferSlice.every((k, index) => {
            if (sequence[index].length > 1) return k === sequence[index];
            return k.toLowerCase() === sequence[index].toLowerCase();
          });

          if (isMatch) {
            action();
            bufferRef.current = [];
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
