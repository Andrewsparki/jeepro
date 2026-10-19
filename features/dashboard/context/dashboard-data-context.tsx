"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import {
  getCriticalDashboardMetrics,
  getSecondaryDashboardMetrics,
  getCachedDashboardMetrics,
  getCachedCriticalMetrics,
  invalidateDashboardMetricsCache,
  CriticalDashboardMetrics,
  SecondaryDashboardMetrics,
  CompleteDashboardMetrics,
} from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";
import { useAuth } from "@/features/auth/components/auth-provider";

export type { CriticalDashboardMetrics, SecondaryDashboardMetrics, CompleteDashboardMetrics };
export type DashboardMetrics = CompleteDashboardMetrics;

interface DashboardDataContextType {
  criticalMetrics: CriticalDashboardMetrics | null;
  secondaryMetrics: SecondaryDashboardMetrics | null;
  metrics: CompleteDashboardMetrics | null;
  isCriticalLoading: boolean;
  isSecondaryLoading: boolean;
  isLoading: boolean;
  refreshMetrics: () => Promise<void>;
  refreshCritical: () => Promise<CriticalDashboardMetrics | null | undefined>;
  seedMetrics: (metrics: CompleteDashboardMetrics) => void;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

const SESSION_CACHE_KEY_PREFIX = "jee_dashboard_metrics_cache_";

function readSessionCache(userId?: string): CompleteDashboardMetrics | null {
  if (typeof window === "undefined") return null;
  try {
    const key = userId ? `${SESSION_CACHE_KEY_PREFIX}${userId}` : null;
    if (key) {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const entry = JSON.parse(raw);
        if (Date.now() - (entry.timestamp || 0) < 5 * 60 * 1000) {
          return entry.data as CompleteDashboardMetrics;
        }
      }
    }
    // Fallback: search for any recent valid dashboard cache entry
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(SESSION_CACHE_KEY_PREFIX)) {
        const raw = sessionStorage.getItem(k);
        if (raw) {
          const entry = JSON.parse(raw);
          if (Date.now() - (entry.timestamp || 0) < 5 * 60 * 1000) {
            return entry.data as CompleteDashboardMetrics;
          }
        }
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

function writeSessionCache(userId: string, data: CompleteDashboardMetrics): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    sessionStorage.setItem(
      `${SESSION_CACHE_KEY_PREFIX}${userId}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function DashboardDataProvider({
  children,
  initialMetrics = null,
}: {
  children: ReactNode;
  initialMetrics?: CompleteDashboardMetrics | null;
}) {
  const { refreshKey } = useStudySession();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  // Initial state strictly mirrors server render: only initialMetrics (provided by SSR) is safe.
  // Never read client-only storages (sessionStorage or in-memory caches) during useState initialization,
  // because that produces differing markup between SSR HTML (skeleton) and client hydration (loaded UI).
  const [criticalMetrics, setCriticalMetrics] = useState<CriticalDashboardMetrics | null>(
    () => initialMetrics ?? null
  );

  const [secondaryMetrics, setSecondaryMetrics] = useState<SecondaryDashboardMetrics | null>(
    () => initialMetrics ?? null
  );

  const [isCriticalLoading, setIsCriticalLoading] = useState<boolean>(
    () => !initialMetrics
  );

  const [isSecondaryLoading, setIsSecondaryLoading] = useState<boolean>(
    () => !initialMetrics
  );

  // Adjust state during render if initialMetrics prop updates (React recommended prop-sync pattern)
  const [prevInitial, setPrevInitial] = useState(initialMetrics);
  if (initialMetrics && initialMetrics !== prevInitial) {
    setPrevInitial(initialMetrics);
    setCriticalMetrics(initialMetrics);
    setSecondaryMetrics(initialMetrics);
    setIsCriticalLoading(false);
    setIsSecondaryLoading(false);
  }

  // Post-hydration cache restoration: if server did not provide initialMetrics, restore from client cache
  useEffect(() => {
    if (!initialMetrics) {
      const sessionCached = readSessionCache(userId);
      if (sessionCached) {
        setCriticalMetrics((prev) => prev ?? sessionCached);
        setSecondaryMetrics((prev) => prev ?? sessionCached);
        setIsCriticalLoading(false);
        setIsSecondaryLoading(false);
        return;
      }
      if (userId) {
        const cached = getCachedDashboardMetrics(userId);
        if (cached) {
          setCriticalMetrics((prev) => prev ?? cached);
          setSecondaryMetrics((prev) => prev ?? cached);
          setIsCriticalLoading(false);
          setIsSecondaryLoading(false);
        }
      }
    }
  }, [initialMetrics, userId]);

  // Synchronous seeder for server-provided initialMetrics: eliminates loading states & skeleton flash
  const seedMetrics = useCallback(
    (metrics: CompleteDashboardMetrics) => {
      setCriticalMetrics(metrics);
      setSecondaryMetrics(metrics);
      setIsCriticalLoading(false);
      setIsSecondaryLoading(false);

      if (userId) {
        writeSessionCache(userId, metrics);
      }
    },
    [userId]
  );

  const fetchCriticalOnly = useCallback(async () => {
    if (isAuthLoading || !userId) return null;
    try {
      const crit = await getCriticalDashboardMetrics(userId);
      setCriticalMetrics(crit);
      return crit;
    } catch (err) {
      console.error("Failed to load critical dashboard metrics:", err);
      return null;
    } finally {
      setIsCriticalLoading(false);
    }
  }, [userId, isAuthLoading]);

  // Request deduplication mutex ref to prevent duplicate Supabase queries
  const inFlightPromiseRef = useRef<Promise<CriticalDashboardMetrics | null> | null>(null);

  const loadMetrics = useCallback(
    async (options?: { silent?: boolean }) => {
      if (isAuthLoading || !userId) return null;

      // Reuse in-flight request if already loading
      if (inFlightPromiseRef.current) {
        return inFlightPromiseRef.current;
      }

      // Only show skeleton if we have NO existing metrics rendered
      if (!options?.silent) {
        setCriticalMetrics((prev) => {
          if (!prev) setIsCriticalLoading(true);
          return prev;
        });
        setSecondaryMetrics((prev) => {
          if (!prev) setIsSecondaryLoading(true);
          return prev;
        });
      }

      const fetchPromise = (async () => {
        try {
          const crit = await getCriticalDashboardMetrics(userId);
          setCriticalMetrics(crit);
          setIsCriticalLoading(false);

          try {
            const sec = await getSecondaryDashboardMetrics(
              userId,
              crit.study_sessions,
              crit.progress,
              crit.syllabus,
              crit.currentStreak
            );
            setSecondaryMetrics(sec);

            // Update session cache with complete combined data
            const completeData: CompleteDashboardMetrics = {
              ...crit,
              ...sec,
            };
            writeSessionCache(userId, completeData);
          } catch (secErr) {
            console.error("Secondary metrics error:", secErr);
          } finally {
            setIsSecondaryLoading(false);
          }
          return crit;
        } catch (critErr) {
          console.error("Critical metrics error:", critErr);
          setIsCriticalLoading(false);
          setIsSecondaryLoading(false);
          return null;
        } finally {
          inFlightPromiseRef.current = null;
        }
      })();

      inFlightPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [userId, isAuthLoading]
  );

  const refreshMetrics = useCallback(async () => {
    if (userId) {
      invalidateDashboardMetricsCache(userId);
    }
    await loadMetrics({ silent: false });
  }, [loadMetrics, userId]);

  // Coalesce burst refresh events (session completion, XP award, mission progress, achievement unlock, refreshKey)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleCoalescedRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      if (userId) {
        invalidateDashboardMetricsCache(userId);
      }
      void loadMetrics({ silent: true });
    }, 250);
  }, [loadMetrics, userId]);

  // Listen for real-time study session and achievement completion events to refresh seamlessly in background
  useEffect(() => {
    if (!userId) return;

    const handleDataChange = () => {
      scheduleCoalescedRefresh();
    };

    window.addEventListener("jee-pro:study-session-completed", handleDataChange);
    window.addEventListener("jee-pro:achievement-unlocked", handleDataChange);
    window.addEventListener("jee-pro:achievement-progress-updated", handleDataChange);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      window.removeEventListener("jee-pro:study-session-completed", handleDataChange);
      window.removeEventListener("jee-pro:achievement-unlocked", handleDataChange);
      window.removeEventListener("jee-pro:achievement-progress-updated", handleDataChange);
    };
  }, [userId, scheduleCoalescedRefresh]);

  // Handle client-side session ends triggered via refreshKey
  const lastRefreshKeyRef = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey > lastRefreshKeyRef.current && userId) {
      lastRefreshKeyRef.current = refreshKey;
      scheduleCoalescedRefresh();
    }
  }, [refreshKey, userId, scheduleCoalescedRefresh]);

  // Cold start initialization: if metrics exist, revalidate quietly in background (stale-while-revalidate)
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (isAuthLoading || !userId || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const init = async () => {
      await loadMetrics(criticalMetrics ? { silent: true } : undefined);
    };
    void init();
  }, [isAuthLoading, userId, criticalMetrics, loadMetrics]);

  // If daily missions are missing, fetch/generate once in background
  const dailyMissionsCheckedRef = useRef(false);
  useEffect(() => {
    if (userId && !isAuthLoading && secondaryMetrics && !dailyMissionsCheckedRef.current) {
      if (!secondaryMetrics.dailyMissions || secondaryMetrics.dailyMissions.length === 0) {
        dailyMissionsCheckedRef.current = true;
        let isMounted = true;
        import("@/features/daily-missions/services/missions.service")
          .then(({ getTodayMissions }) => getTodayMissions(undefined, userId))
          .then((missions) => {
            if (isMounted && missions && missions.length > 0) {
              setSecondaryMetrics((prev) => (prev ? { ...prev, dailyMissions: missions } : null));
            }
          })
          .catch((err) => console.error("Client background mission fetch error:", err));

        return () => {
          isMounted = false;
        };
      }
    }
  }, [userId, isAuthLoading, secondaryMetrics]);

  const compositeMetrics: CompleteDashboardMetrics | null = useMemo(() => {
    if (!criticalMetrics) return null;
    return {
      ...criticalMetrics,
      xpDetails: secondaryMetrics?.xpDetails ?? {
        currentLevel: 1,
        currentXP: 0,
        totalXP: 0,
        nextLevelXP: 100,
        progressPercentage: 0,
      },
      achievements: secondaryMetrics?.achievements ?? [],
      todaysEvents: secondaryMetrics?.todaysEvents ?? [],
      dailyMissions: secondaryMetrics?.dailyMissions ?? [],
      xpEvents: secondaryMetrics?.xpEvents ?? [],
    };
  }, [criticalMetrics, secondaryMetrics]);

  const contextValue = useMemo(
    () => ({
      criticalMetrics,
      secondaryMetrics,
      metrics: compositeMetrics,
      isCriticalLoading,
      isSecondaryLoading,
      isLoading: isCriticalLoading,
      refreshMetrics,
      refreshCritical: fetchCriticalOnly,
      seedMetrics,
    }),
    [
      criticalMetrics,
      secondaryMetrics,
      compositeMetrics,
      isCriticalLoading,
      isSecondaryLoading,
      refreshMetrics,
      fetchCriticalOnly,
      seedMetrics,
    ]
  );

  return (
    <DashboardDataContext.Provider value={contextValue}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}

export function useOptionalDashboardData() {
  return useContext(DashboardDataContext) ?? null;
}
