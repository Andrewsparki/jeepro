"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LeaderboardScope,
  LeaderboardPeriod,
  LeaderboardEntry,
  CurrentUserRank,
} from "../types/leaderboard.types";
import { LeaderboardService } from "../services/leaderboard.service";
import { createClient } from "@/lib/supabase/client";

export function useLeaderboard() {
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<CurrentUserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep track of active fetch to prevent stale race conditions
  const activeFetchIdRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    const fetchId = ++activeFetchIdRef.current;

    async function load() {
      try {
        const [leaderboardData, rankData] = await Promise.all([
          LeaderboardService.getLeaderboard(scope, period, 50, 0),
          LeaderboardService.getCurrentUserRank(scope, period),
        ]);

        if (!isCancelled && fetchId === activeFetchIdRef.current) {
          setEntries(leaderboardData);
          setUserRank(rankData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled && fetchId === activeFetchIdRef.current) {
          console.error("Failed to load leaderboard data:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load leaderboard. Please try again."
          );
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [scope, period]);

  const handleScopeChange = useCallback((newScope: LeaderboardScope) => {
    setScope((prev) => {
      if (prev !== newScope) {
        setIsLoading(true);
        return newScope;
      }
      return prev;
    });
  }, []);

  const handlePeriodChange = useCallback((newPeriod: LeaderboardPeriod) => {
    setPeriod((prev) => {
      if (prev !== newPeriod) {
        setIsLoading(true);
        return newPeriod;
      }
      return prev;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const fetchId = ++activeFetchIdRef.current;
    try {
      const [leaderboardData, rankData] = await Promise.all([
        LeaderboardService.getLeaderboard(scope, period, 50, 0),
        LeaderboardService.getCurrentUserRank(scope, period),
      ]);
      if (fetchId === activeFetchIdRef.current) {
        setEntries(leaderboardData);
        setUserRank(rankData);
        setError(null);
      }
    } catch (err: unknown) {
      if (fetchId === activeFetchIdRef.current) {
        console.error("Refresh error:", err);
        setError(err instanceof Error ? err.message : "Failed to refresh.");
      }
    } finally {
      if (fetchId === activeFetchIdRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [scope, period]);

  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Realtime subscription for friendships when in 'friends' scope
  useEffect(() => {
    if (scope !== "friends") return;

    const supabase = createClient();
    const channel = supabase
      .channel("leaderboard-friends-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => {
          void refreshRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scope]);

  return useMemo(
    () => ({
      scope,
      setScope: handleScopeChange,
      period,
      setPeriod: handlePeriodChange,
      entries,
      userRank,
      isLoading,
      isRefreshing,
      error,
      refresh,
    }),
    [
      scope,
      handleScopeChange,
      period,
      handlePeriodChange,
      entries,
      userRank,
      isLoading,
      isRefreshing,
      error,
      refresh,
    ]
  );
}
