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
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export function DashboardDataProvider({
  children,
  initialMetrics = null,
}: {
  children: ReactNode;
  initialMetrics?: CompleteDashboardMetrics | null;
}) {
  const { refreshKey } = useStudySession();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Seed from props or client-side memory cache to eliminate loading states during tab re-entry
  const [criticalMetrics, setCriticalMetrics] = useState<CriticalDashboardMetrics | null>(() => {
    if (initialMetrics) return initialMetrics;
    if (user?.id) {
      return getCachedCriticalMetrics(user.id) || getCachedDashboardMetrics(user.id);
    }
    return null;
  });

  const [secondaryMetrics, setSecondaryMetrics] = useState<SecondaryDashboardMetrics | null>(() => {
    if (initialMetrics) return initialMetrics;
    if (user?.id) {
      return getCachedDashboardMetrics(user.id);
    }
    return null;
  });

  const [isCriticalLoading, setIsCriticalLoading] = useState<boolean>(() => {
    if (initialMetrics) return false;
    if (user?.id && (getCachedCriticalMetrics(user.id) || getCachedDashboardMetrics(user.id))) return false;
    return true;
  });

  const [isSecondaryLoading, setIsSecondaryLoading] = useState<boolean>(() => {
    if (initialMetrics) return false;
    if (user?.id && getCachedDashboardMetrics(user.id)) return false;
    return true;
  });

  const fetchCriticalOnly = useCallback(async () => {
    if (isAuthLoading || !user?.id) return null;
    try {
      const crit = await getCriticalDashboardMetrics(user.id);
      setCriticalMetrics(crit);
      return crit;
    } catch (err) {
      console.error("Failed to load critical dashboard metrics:", err);
      return null;
    } finally {
      setIsCriticalLoading(false);
    }
  }, [user?.id, isAuthLoading]);

  const loadMetrics = useCallback(
    async (options?: { silent?: boolean }) => {
      if (isAuthLoading || !user?.id) return null;
      if (!options?.silent) {
        setIsCriticalLoading(true);
        setIsSecondaryLoading(true);
      }
      try {
        const crit = await getCriticalDashboardMetrics(user.id);
        setCriticalMetrics(crit);
        setIsCriticalLoading(false);

        try {
          const sec = await getSecondaryDashboardMetrics(
            user.id,
            crit.study_sessions,
            crit.progress,
            crit.syllabus,
            crit.currentStreak
          );
          setSecondaryMetrics(sec);
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
      }
    },
    [user?.id, isAuthLoading]
  );

  const refreshMetrics = useCallback(async () => {
    if (user?.id) {
      invalidateDashboardMetricsCache(user.id);
    }
    await loadMetrics({ silent: false });
  }, [loadMetrics, user?.id]);

  // Synchronize when initialMetrics change or user logs in
  useEffect(() => {
    if (initialMetrics) {
      setCriticalMetrics(initialMetrics);
      setSecondaryMetrics(initialMetrics);
      setIsCriticalLoading(false);
      setIsSecondaryLoading(false);
    } else if (user?.id && !criticalMetrics) {
      const cached = getCachedDashboardMetrics(user.id);
      if (cached) {
        setCriticalMetrics(cached);
        setSecondaryMetrics(cached);
        setIsCriticalLoading(false);
        setIsSecondaryLoading(false);
      }
    }
  }, [initialMetrics, user?.id, criticalMetrics]);

  // Listen for real-time study session and achievement completion events to refresh seamlessly
  useEffect(() => {
    if (!user?.id) return;

    const handleDataChange = () => {
      loadMetrics({ silent: true });
    };

    window.addEventListener("jee-pro:study-session-completed", handleDataChange);
    window.addEventListener("jee-pro:achievement-unlocked", handleDataChange);
    window.addEventListener("jee-pro:achievement-progress-updated", handleDataChange);

    return () => {
      window.removeEventListener("jee-pro:study-session-completed", handleDataChange);
      window.removeEventListener("jee-pro:achievement-unlocked", handleDataChange);
      window.removeEventListener("jee-pro:achievement-progress-updated", handleDataChange);
    };
  }, [user?.id, loadMetrics]);

  // Handle client-side session ends triggered via refreshKey
  const lastRefreshKeyRef = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey > lastRefreshKeyRef.current && user?.id) {
      lastRefreshKeyRef.current = refreshKey;
      loadMetrics({ silent: true });
    }
  }, [refreshKey, user?.id, loadMetrics]);

  // Cold start initialization: if no cached or initial metrics, fetch; otherwise revalidate quietly
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (isAuthLoading || !user?.id || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (!criticalMetrics) {
      loadMetrics();
    } else {
      // Revalidate in background without blocking UI
      loadMetrics({ silent: true });
    }
  }, [isAuthLoading, user?.id, criticalMetrics, loadMetrics]);

  // If daily missions are missing, fetch/generate in background
  useEffect(() => {
    if (user?.id && !isAuthLoading && secondaryMetrics) {
      if (!secondaryMetrics.dailyMissions || secondaryMetrics.dailyMissions.length === 0) {
        let isMounted = true;
        import("@/features/daily-missions/services/missions.service")
          .then(({ getTodayMissions }) => getTodayMissions(undefined, user.id))
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
  }, [user?.id, isAuthLoading, secondaryMetrics]);

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
    }),
    [
      criticalMetrics,
      secondaryMetrics,
      compositeMetrics,
      isCriticalLoading,
      isSecondaryLoading,
      refreshMetrics,
      fetchCriticalOnly,
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
