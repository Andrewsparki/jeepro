"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  trackEvent,
  trackEngagement,
  pseudonymiseUserId,
  resolveFeatureName,
} from "../services/telemetry.service";
import { useCookieConsent } from "@/features/privacy";
import { useAuth } from "@/features/auth/components/auth-provider";

/** Inactivity threshold in milliseconds (45s). If no user interaction occurs, pause engagement timer */
const INACTIVITY_THRESHOLD_MS = 45 * 1000;
/** Periodic flush interval for active engagement time (30s) */
const PERIODIC_FLUSH_INTERVAL_MS = 30 * 1000;

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { preferences } = useCookieConsent();
  const { user } = useAuth();

  // Non-reversible pseudonym for session disambiguation
  const userPseudonym = useMemo(
    () => (user?.id ? pseudonymiseUserId(user.id) : undefined),
    [user]
  );

  const lastPathRef = useRef<string | null>(null);

  // Active engagement measurement refs (initialized with 0 to maintain render purity)
  const currentPathRef = useRef<string | null>(null);
  const activeSecondsAccumulatorRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(0);
  const lastInteractionTimestampRef = useRef<number>(0);
  const isIdleRef = useRef<boolean>(false);
  const isDocumentVisibleRef = useRef<boolean>(true);

  // Helper to flush accumulated active seconds for the current route
  const flushActiveSeconds = useCallback(() => {
    const pathToFlush = currentPathRef.current;
    const accumulated = Math.round(activeSecondsAccumulatorRef.current);

    if (pathToFlush && accumulated > 0 && !pathToFlush.startsWith("/admin")) {
      const feature = resolveFeatureName(pathToFlush);
      void trackEngagement(pathToFlush, accumulated, feature, userPseudonym);
      activeSecondsAccumulatorRef.current = 0;
    }
  }, [userPseudonym]);

  // Handle page views on route change
  useEffect(() => {
    if (!preferences?.analytics) return;
    if (!pathname || pathname.startsWith("/admin")) return;

    if (pathname !== lastPathRef.current) {
      // Flush previous route's engagement time before switching
      if (lastPathRef.current) {
        flushActiveSeconds();
      }

      lastPathRef.current = pathname;
      currentPathRef.current = pathname;
      activeSecondsAccumulatorRef.current = 0;
      lastActiveTimestampRef.current = Date.now();
      lastInteractionTimestampRef.current = Date.now();
      isIdleRef.current = false;

      // Track standard page view event
      void trackEvent("page_view", pathname, {
        feature: resolveFeatureName(pathname),
        userPseudonym,
      });
    }
  }, [pathname, preferences?.analytics, userPseudonym, flushActiveSeconds]);

  // Active time accumulation ticker and idle detection
  useEffect(() => {
    if (!preferences?.analytics) return;
    if (!pathname || pathname.startsWith("/admin")) return;

    currentPathRef.current = pathname;
    const initialNow = Date.now();
    if (lastActiveTimestampRef.current === 0) lastActiveTimestampRef.current = initialNow;
    if (lastInteractionTimestampRef.current === 0) lastInteractionTimestampRef.current = initialNow;
    isDocumentVisibleRef.current = typeof document !== "undefined" && document.visibilityState === "visible";

    // Track user activity to determine active vs idle state (throttled to max once per 2 seconds)
    const handleUserInteraction = () => {
      const now = Date.now();
      if (!isIdleRef.current && now - lastInteractionTimestampRef.current < 2000) {
        return;
      }
      lastInteractionTimestampRef.current = now;

      if (isIdleRef.current) {
        // User woke up from idle state
        isIdleRef.current = false;
        lastActiveTimestampRef.current = now;
      }
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    // Handle visibility changes (tab switching / minimizing)
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      const now = Date.now();

      if (!isVisible) {
        // When tab is hidden: compute any elapsed active seconds, flush, and pause
        if (!isIdleRef.current) {
          const deltaSec = (now - lastActiveTimestampRef.current) / 1000;
          if (deltaSec > 0 && deltaSec < 60) {
            activeSecondsAccumulatorRef.current += deltaSec;
          }
        }
        flushActiveSeconds();
        isDocumentVisibleRef.current = false;
      } else {
        // Tab restored: resume active tracking from now
        isDocumentVisibleRef.current = true;
        lastActiveTimestampRef.current = now;
        lastInteractionTimestampRef.current = now;
        isIdleRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Main 1-second interval ticker for active engagement accumulation
    const ticker = setInterval(() => {
      const now = Date.now();

      // Check if user exceeded inactivity threshold
      if (now - lastInteractionTimestampRef.current > INACTIVITY_THRESHOLD_MS) {
        isIdleRef.current = true;
      }

      // Only accumulate active time if document is visible and user is not idle
      if (isDocumentVisibleRef.current && !isIdleRef.current) {
        const deltaSec = (now - lastActiveTimestampRef.current) / 1000;
        if (deltaSec > 0 && deltaSec < 5) {
          activeSecondsAccumulatorRef.current += deltaSec;
        }
        lastActiveTimestampRef.current = now;

        // Periodic flush if accumulated seconds reach periodic flush threshold
        if (activeSecondsAccumulatorRef.current >= PERIODIC_FLUSH_INTERVAL_MS / 1000) {
          flushActiveSeconds();
        }
      } else {
        // Paused: reset marker so time spent idle/hidden is not counted when resuming
        lastActiveTimestampRef.current = now;
      }
    }, 1000);

    // Flush on page unload / navigation away
    const handlePageHide = () => {
      flushActiveSeconds();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      clearInterval(ticker);
      flushActiveSeconds();
    };
  }, [pathname, preferences?.analytics, flushActiveSeconds]);

  return null;
}
