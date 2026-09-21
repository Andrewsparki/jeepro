"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";

const AUTH_BOOT_PATHS = [
  "/dashboard",
  "/chat",
  "/friends",
  "/groups",
  "/leaderboard",
  "/achievements",
  "/admin",
  "/suspended",
] as const;

const MIN_BOOT_DURATION_MS = 3000;
const SAFE_BOOT_FALLBACK_MS = 15000;

function isAuthenticatedBootRoute(pathname: string) {
  return AUTH_BOOT_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

type BootSequenceContextType = {
  criticalReady: boolean;
  markCriticalReady: () => void;
};

const BootSequenceContext = createContext<BootSequenceContextType | undefined>(undefined);

export function AppBootSequenceProvider({ children }: { children: ReactNode }) {
  const [criticalReady, setCriticalReady] = useState(false);

  const value = useMemo<BootSequenceContextType>(
    () => ({
      criticalReady,
      markCriticalReady: () => setCriticalReady(true),
    }),
    [criticalReady]
  );

  return <BootSequenceContext.Provider value={value}>{children}</BootSequenceContext.Provider>;
}

export function useBootSequence() {
  const context = useContext(BootSequenceContext);

  if (!context) {
    return {
      criticalReady: true,
      markCriticalReady: () => undefined,
    };
  }

  return context;
}

export function AppBootGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const { criticalReady } = useBootSequence();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticatedBootRoute(pathname) || bootComplete) return;

    const minTimer = window.setTimeout(() => setMinimumElapsed(true), MIN_BOOT_DURATION_MS);
    const fallbackTimer = window.setTimeout(() => setBootComplete(true), SAFE_BOOT_FALLBACK_MS);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [bootComplete, pathname]);

  useEffect(() => {
    if (!isAuthenticatedBootRoute(pathname) || bootComplete || typeof window === "undefined") {
      return;
    }

    const appReady = !isLoading && (pathname !== "/dashboard" || criticalReady);
    const readyToReveal = appReady && minimumElapsed;

    if (!readyToReveal) {
      return;
    }

    const finalizeTimer = window.setTimeout(() => setBootComplete(true), 0);
    return () => window.clearTimeout(finalizeTimer);
  }, [bootComplete, criticalReady, isLoading, minimumElapsed, pathname]);

  const isBootEligible = isAuthenticatedBootRoute(pathname) && !bootComplete;
  const shouldShowBoot =
    isBootEligible && (!minimumElapsed || isLoading || (pathname === "/dashboard" && !criticalReady));

  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowBoot ? <CinematicPreloader key="boot-screen" /> : null}
      </AnimatePresence>
      {children}
    </>
  );
}

export function CinematicPreloader() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key="boot-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#040814] text-white"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_28%)]" />

      <motion.div
        className="absolute inset-0"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : {
              scale: [1, 1.06, 1],
              opacity: [0.35, 0.8, 0.35],
            }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 9, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
        style={{
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.14), rgba(124,58,237,0.12), rgba(10,15,30,0.18))",
          filter: "blur(42px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          className="relative"
          animate={
            shouldReduceMotion
              ? { scale: 1 }
              : { rotate: [0, 10, -10, 0], y: [0, -8, 0] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 5.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
          }
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/30 bg-slate-950/70 shadow-[0_0_30px_rgba(34,211,238,0.18)] backdrop-blur-xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-blue-500/15 to-violet-500/20" />
            <svg viewBox="0 0 24 24" className="relative h-9 w-9 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </motion.div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-cyan-200/80">
            <span>JEE</span>
            <span className="text-cyan-400">PRO</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.06em] text-white sm:text-3xl">
            Initialising your workspace
          </h1>
        </div>

        <div className="w-[220px] max-w-[70vw]">
          <div className="h-1.5 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400"
              initial={{ x: "-120%" }}
              animate={
                shouldReduceMotion
                  ? { x: "0%", width: "100%" }
                  : { x: ["-120%", "30%", "100%"], width: ["28%", "60%", "100%"] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.2 }
                  : { duration: 2.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
              }
            />
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.32em] text-slate-300/80">
          Secure session • loading system
        </p>
      </div>
    </motion.div>
  );
}
