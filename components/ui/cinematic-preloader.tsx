"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/components/auth-provider";

const AUTH_BOOT_PATHS = [
  "/dashboard",
  "/study",
  "/syllabus",
  "/focus",
  "/planner",
  "/history",
  "/chat",
  "/friends",
  "/groups",
  "/leaderboard",
  "/achievements",
  "/settings",
  "/admin",
  "/suspended",
] as const;

/**
 * When loading finishes almost instantly, keep the loader visible for 600ms
 * (within the requested 500-700ms window) so the entrance animation can be appreciated
 * before smoothly transitioning away.
 */
const MIN_DISPLAY_MS = 600;
const REDUCED_MOTION_MIN_MS = 300;
const STALL_TIMEOUT_MS = 6500;
const EXIT_DURATION_S = 0.38;

function isAuthenticatedBootRoute(pathname: string) {
  return AUTH_BOOT_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

type BootSequenceContextType = {
  criticalReady: boolean;
  markCriticalReady: () => void;
};

const BootSequenceContext = createContext<BootSequenceContextType | undefined>(undefined);

export function AppBootSequenceProvider({ children }: { children: ReactNode }) {
  const value = useMemo<BootSequenceContextType>(
    () => ({
      criticalReady: true,
      markCriticalReady: () => undefined,
    }),
    []
  );

  return (
    <BootSequenceContext.Provider value={value}>
      {children}
    </BootSequenceContext.Provider>
  );
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

function useOptionalAuth() {
  try {
    return useAuth();
  } catch {
    return { isLoading: false, user: null, profile: null };
  }
}

export function AppBootGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = isAuthenticatedBootRoute(pathname);
  const { isLoading: isAuthLoading } = useOptionalAuth();
  const shouldReduceMotion = useReducedMotion();

  const previousPathRef = useRef<string | null>(null);
  const hasBootedForCurrentSessionRef = useRef(false);
  const bootStartRef = useRef<number | null>(null);

  const [bootVisible, setBootVisible] = useState(() => isAuthRoute);
  const [isStalled, setIsStalled] = useState(false);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (!isAuthRoute) {
      bootStartRef.current = null;
      hasBootedForCurrentSessionRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBootVisible(false);
      setIsStalled(false);
      return;
    }

    const wasAuthRoute = previousPath !== null && isAuthenticatedBootRoute(previousPath);
    const enteredAuthenticatedApp = isAuthRoute && !wasAuthRoute;
    const isInitialLoad = previousPath === null && !hasBootedForCurrentSessionRef.current;

    if ((isInitialLoad || enteredAuthenticatedApp) && !hasBootedForCurrentSessionRef.current) {
      hasBootedForCurrentSessionRef.current = true;
      bootStartRef.current = performance.now();
      setBootVisible(true);
      setIsStalled(false);
    }
  }, [isAuthRoute, pathname]);

  // Truthful completion: dismiss as soon as operation settles, respecting the 500-700ms visibility window
  useEffect(() => {
    if (!bootVisible) return;

    // Set stall recovery timer
    const stallTimer = window.setTimeout(() => {
      setIsStalled(true);
    }, STALL_TIMEOUT_MS);

    if (!isAuthLoading) {
      const now = performance.now();
      const minDisplayTime = shouldReduceMotion ? REDUCED_MOTION_MIN_MS : MIN_DISPLAY_MS;
      const elapsed = bootStartRef.current ? now - bootStartRef.current : minDisplayTime;
      const remainingWait = Math.max(0, minDisplayTime - elapsed);

      const hideTimer = window.setTimeout(() => {
        setBootVisible(false);
        setIsStalled(false);
      }, remainingWait);

      return () => {
        window.clearTimeout(hideTimer);
        window.clearTimeout(stallTimer);
      };
    }

    return () => window.clearTimeout(stallTimer);
  }, [bootVisible, isAuthLoading, shouldReduceMotion]);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {isAuthRoute && bootVisible && (
          <motion.div
            key="cinematic-preloader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 1.015,
              filter: shouldReduceMotion ? "none" : "blur(4px)",
              transition: { duration: EXIT_DURATION_S, ease: [0.22, 1, 0.36, 1] },
            }}
            className="fixed inset-0 z-[9999] pointer-events-auto"
            aria-hidden={false}
          >
            <CinematicPreloader
              visible={bootVisible}
              isStalled={isStalled}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CinematicPreloader({
  visible,
  isStalled = false,
  onRetry,
}: {
  visible: boolean;
  isStalled?: boolean;
  onRetry?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0B0D12] text-[#F5F7FB] flex flex-col items-center justify-center select-none"
      role="status"
      aria-live="polite"
      aria-busy={visible}
    >
      {/* Subtle Specular Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#78A9FF]/30 to-transparent pointer-events-none" />

      {/* Radial Background Atmospheric Sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(120,169,255,0.06),transparent_65%)] pointer-events-none" />

      {/* Centerpiece Container with coordinated entrance */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 text-center max-w-sm w-full"
      >
        {/* Layered Knowledge Architecture Emblem */}
        <div className="relative">
          {/* Subtle Ambient Backlight Sheen with gentle breathing pulse */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0.4 } : { opacity: 0, scale: 0.85 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.4 }
                : {
                    opacity: [0.35, 0.7, 0.35],
                    scale: [0.95, 1.08, 0.95],
                  }
            }
            transition={{
              duration: 2.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute -inset-3 rounded-2xl bg-[#78A9FF]/20 blur-xl pointer-events-none"
          />

          {/* Obsidian Squircle Container */}
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121722] border border-[#2B3342] shadow-[0_12px_36px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-white overflow-visible"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {/* Layer 1: Top syllabus cap (Electric Blue apex) */}
              <motion.path
                d="M12 2L2 7l10 5 10-5-10-5z"
                stroke="#78A9FF"
                initial={shouldReduceMotion ? {} : { pathLength: 0, opacity: 0, y: -4 }}
                animate={
                  shouldReduceMotion
                    ? { pathLength: 1, opacity: 1, y: 0 }
                    : {
                        pathLength: 1,
                        opacity: 1,
                        y: [0, -3, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : {
                        pathLength: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.4 },
                        y: {
                          duration: 2.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: 0.75,
                        },
                      }
                }
              />

              {/* Layer 2: Middle problem-solving tier */}
              <motion.path
                d="M2 12l10 5 10-5"
                stroke="#E2E8F0"
                initial={shouldReduceMotion ? {} : { pathLength: 0, opacity: 0 }}
                animate={
                  shouldReduceMotion
                    ? { pathLength: 1, opacity: 0.9 }
                    : {
                        pathLength: 1,
                        opacity: [0.8, 1, 0.8],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : {
                        pathLength: { duration: 0.75, delay: 0.14, ease: [0.16, 1, 0.3, 1] },
                        opacity: {
                          duration: 2.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: 0.89,
                        },
                      }
                }
              />

              {/* Layer 3: Bottom revision foundation */}
              <motion.path
                d="M2 17l10 5 10-5"
                stroke="#94A3B8"
                initial={shouldReduceMotion ? {} : { pathLength: 0, opacity: 0, y: 4 }}
                animate={
                  shouldReduceMotion
                    ? { pathLength: 1, opacity: 0.75, y: 0 }
                    : {
                        pathLength: 1,
                        opacity: [0.7, 0.95, 0.7],
                        y: [0, 3, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : {
                        pathLength: { duration: 0.75, delay: 0.28, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.4, delay: 0.28 },
                        y: {
                          duration: 2.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: 1.03,
                        },
                      }
                }
              />
            </svg>
          </motion.div>
        </div>

        {/* Brand Name & Human-Readable Status */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2.5 font-mono text-xs font-bold tracking-[0.28em] text-[#A4ADBB] uppercase">
            <span>JEE</span>
            <span className="text-[#F5F7FB] font-extrabold">PRO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#78A9FF] shadow-[0_0_10px_#78A9FF] animate-pulse ml-0.5" />
          </div>

          <h1 className="text-sm font-medium text-[#F5F7FB]/95 tracking-tight">
            {isStalled ? "Connecting to workspace..." : "Preparing your workspace"}
          </h1>
        </motion.div>

        {/* Polished Hairline Progress Indicator */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.22, ease: "easeOut" }}
          className="w-48 max-w-[70vw] h-[3px] rounded-full bg-white/[0.08] overflow-hidden relative shadow-inner"
          role="progressbar"
          aria-label="Loading workspace"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-transparent via-[#78A9FF] to-white/90 shadow-[0_0_12px_rgba(120,169,255,0.8),0_0_4px_#78A9FF]"
            initial={shouldReduceMotion ? { width: "100%" } : { x: "-100%", width: "35%" }}
            animate={
              shouldReduceMotion
                ? { opacity: [0.4, 0.9, 0.4] }
                : {
                    x: ["-100%", "200%"],
                    width: ["30%", "45%", "30%"],
                  }
            }
            transition={
              shouldReduceMotion
                ? {
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }
                : {
                    duration: 1.4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: [0.4, 0, 0.2, 1],
                  }
            }
          />
        </motion.div>

        {/* Truthful Connection Feedback / Stall Recovery */}
        {isStalled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 flex flex-col items-center gap-2.5"
          >
            <p className="text-xs text-zinc-400">Connection is taking longer than expected.</p>
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-lg border border-white/[0.14] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Reload workspace
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}