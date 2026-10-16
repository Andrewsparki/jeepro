"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import {
  getCriticalDashboardMetrics,
  getSecondaryDashboardMetrics,
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

  const [criticalMetrics, setCriticalMetrics] = useState<CriticalDashboardMetrics | null>(initialMetrics);
  const [secondaryMetrics, setSecondaryMetrics] = useState<SecondaryDashboardMetrics | null>(initialMetrics);
  const [isCriticalLoading, setIsCriticalLoading] = useState<boolean>(!initialMetrics);
  const [isSecondaryLoading, setIsSecondaryLoading] = useState<boolean>(!initialMetrics);

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
    await loadMetrics({ silent: false });
  }, [loadMetrics]);

  // Handle client-side session ends: refresh critical metrics instantly and update stats silently in background
  useEffect(() => {
    if (refreshKey > 0 && user?.id) {
      loadMetrics({ silent: true });
    }
  }, [refreshKey, user?.id, loadMetrics]);

  // Cold start (if no initialMetrics SSR data): load critical metrics then secondary metrics progressively
  useEffect(() => {
    if (!initialMetrics && !isAuthLoading && user?.id) {
      loadMetrics();
    }
  }, [initialMetrics, isAuthLoading, user?.id, loadMetrics]);

  // If SSR provided metrics but daily missions were empty, fetch/generate in background
  useEffect(() => {
    if (initialMetrics && user?.id && !isAuthLoading) {
      if (!secondaryMetrics?.dailyMissions || secondaryMetrics.dailyMissions.length === 0) {
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
  }, [initialMetrics, user?.id, isAuthLoading, secondaryMetrics?.dailyMissions]);

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
