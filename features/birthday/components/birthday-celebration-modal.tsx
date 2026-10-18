"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  BirthdayRewardConfig,
  BirthdayService,
  UserBirthdayRecapData,
} from "../services/birthday.service";
import { getISTYear } from "@/lib/date-utils";
import { BirthdayRecapStory } from "./birthday-recap-story";

interface BirthdayCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (xpEarned: number) => void;
  config?: BirthdayRewardConfig;
  initialRecapData?: UserBirthdayRecapData | null;
}

export function BirthdayCelebrationModal({
  isOpen,
  onClose,
  onClaimSuccess,
  initialRecapData,
}: BirthdayCelebrationModalProps) {
  const { user } = useAuth();
  const currentYear = getISTYear();

  const [recapData, setRecapData] = useState<UserBirthdayRecapData | null>(initialRecapData || null);
  const [isLoading, setIsLoading] = useState(!initialRecapData);

  useEffect(() => {
    if (!isOpen) return;

    if (!recapData && user?.id) {
      BirthdayService.getUserYearRecap(user.id)
        .then((data) => {
          setRecapData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("[BirthdayCelebrationModal] Error loading recap:", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, user?.id, recapData]);

  if (!isOpen) return null;

  return (
    <FixedPortal>
      <AnimatePresence mode="wait">
        <motion.div
          key="cinematic-birthday-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden bg-[#05070d] text-white p-2 sm:p-6"
        >
          {/* Cinematic Atmospheric Lighting */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Ambient Radial Lights */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-b from-amber-500/20 via-pink-600/15 to-transparent blur-[140px]"
            />
            <motion.div
              animate={{
                scale: [1.1, 0.95, 1.1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-purple-600/25 via-cyan-500/10 to-transparent blur-[130px]"
            />

            {/* Subtle Grid Backdrop Layer */}
            <div
              className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Floating Ambient Dust Orbs */}
            <FloatingOrbs />
          </div>

          {/* Loading or Active Story View */}
          {isLoading || !recapData ? (
            <div className="relative z-20 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-xs uppercase font-mono tracking-[0.25em] text-amber-200/80">
                SYNTHESIZING YOUR {currentYear} JOURNEY...
              </p>
            </div>
          ) : (
            <BirthdayRecapStory
              recap={recapData}
              onClose={onClose}
              onClaimSuccess={onClaimSuccess}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </FixedPortal>
  );
}

// Predefined deterministic floating dust orbs for backdrop
const BACKDROP_PARTICLES = [
  { id: 0, x: "12%", y: "18%", size: 3, duration: 9, delay: 0.2, opacity: 0.25 },
  { id: 1, x: "82%", y: "24%", size: 4, duration: 11, delay: 1.1, opacity: 0.35 },
  { id: 2, x: "28%", y: "76%", size: 2.5, duration: 8, delay: 0.5, opacity: 0.2 },
  { id: 3, x: "74%", y: "82%", size: 5, duration: 12, delay: 1.8, opacity: 0.4 },
  { id: 4, x: "45%", y: "15%", size: 3.5, duration: 10, delay: 0.9, opacity: 0.3 },
  { id: 5, x: "90%", y: "55%", size: 2, duration: 7, delay: 2.2, opacity: 0.18 },
  { id: 6, x: "8%", y: "60%", size: 4.5, duration: 13, delay: 1.4, opacity: 0.32 },
  { id: 7, x: "62%", y: "38%", size: 3, duration: 9.5, delay: 0.7, opacity: 0.28 },
  { id: 8, x: "36%", y: "90%", size: 2.8, duration: 8.5, delay: 1.9, opacity: 0.22 },
  { id: 9, x: "50%", y: "65%", size: 4, duration: 10.5, delay: 0.4, opacity: 0.38 },
  { id: 10, x: "20%", y: "42%", size: 3.2, duration: 9, delay: 2.5, opacity: 0.26 },
  { id: 11, x: "85%", y: "12%", size: 2.4, duration: 7.5, delay: 0.8, opacity: 0.19 },
  { id: 12, x: "68%", y: "68%", size: 4.8, duration: 11.5, delay: 1.6, opacity: 0.34 },
  { id: 13, x: "15%", y: "85%", size: 3.6, duration: 10, delay: 2.1, opacity: 0.29 },
  { id: 14, x: "94%", y: "78%", size: 2.2, duration: 8.2, delay: 0.3, opacity: 0.21 },
  { id: 15, x: "30%", y: "28%", size: 4.2, duration: 12.2, delay: 1.5, opacity: 0.36 },
];

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {BACKDROP_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: p.opacity, y: 0 }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-amber-300/40 blur-[1px]"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}

