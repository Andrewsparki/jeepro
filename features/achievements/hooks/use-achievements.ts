"use client";

import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { AchievementsService } from "../services/achievements.service";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  AchievementItem,
  AchievementCategory,
  AchievementStats,
} from "../types/achievement.types";

export interface UseAchievementsOptions {
  initialAchievements?: AchievementItem[];
}

export function useAchievements(options?: UseAchievementsOptions) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const [achievements, setAchievements] = useState<AchievementItem[]>(
    options?.initialAchievements || []
  );
  const [isFetching, setIsFetching] = useState(
    !options?.initialAchievements || options.initialAchievements.length === 0
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Derive loading state: if initial data exists, show immediately without skeleton
  const isLoading = Boolean(userId)
    ? isFetching && achievements.length === 0
    : isAuthLoading;

  const loadAchievements = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    if (isRefresh) {
      setIsRefreshing(true);
    }
    try {
      // get_user_achievements RPC automatically evaluates achievements inside Postgres atomically
      const items = await AchievementsService.getUserAchievements(userId, { forceRefresh: isRefresh });
      setAchievements(items);
      setError(null);
    } catch (err: unknown) {
      console.error("[useAchievements] Error loading achievements:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load achievements."
      );
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthLoading || !userId) return;

    let ignore = false;
    async function init() {
      try {
        const items = await AchievementsService.getUserAchievements(userId!);
        if (!ignore) {
          setAchievements(items);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("[useAchievements] Error loading achievements:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load achievements."
          );
        }
      } finally {
        if (!ignore) {
          setIsFetching(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [userId, isAuthLoading]);

  // Listen for realtime unlock events, progress updates, and session completions
  useEffect(() => {
    const handleUpdate = () => {
      if (userId) {
        AchievementsService.invalidateCache(userId);
      }
      loadAchievements(true);
    };

    window.addEventListener("jee-pro:achievement-unlocked", handleUpdate);
    window.addEventListener("jee-pro:achievement-progress-updated", handleUpdate);
    window.addEventListener("jee-pro:study-session-completed", handleUpdate);

    return () => {
      window.removeEventListener("jee-pro:achievement-unlocked", handleUpdate);
      window.removeEventListener("jee-pro:achievement-progress-updated", handleUpdate);
      window.removeEventListener("jee-pro:study-session-completed", handleUpdate);
    };
  }, [loadAchievements, userId]);

  // Filtered achievements by Category and Search (O(N) single-pass)
  const filteredAchievements = useMemo(() => {
    const trimmed = deferredSearchQuery.trim().toLowerCase();
    return achievements.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!trimmed) return true;
      return (
        item.title.toLowerCase().includes(trimmed) ||
        item.description.toLowerCase().includes(trimmed)
      );
    });
  }, [achievements, selectedCategory, deferredSearchQuery]);

  // Summary statistics (O(N) cached single-pass)
  const stats: AchievementStats = useMemo(() => {
    const total = achievements.length;
    let unlockedCount = 0;
    let totalXpEarned = 0;

    for (let i = 0; i < total; i++) {
      const a = achievements[i];
      if (a.unlocked) {
        unlockedCount++;
        totalXpEarned += a.xp_reward;
      }
    }

    const overallPercentage =
      total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    return {
      total,
      unlockedCount,
      totalXpEarned,
      overallPercentage,
    };
  }, [achievements]);

  return {
    achievements,
    filteredAchievements,
    stats,
    isLoading,
    isRefreshing,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refresh: () => loadAchievements(true),
  };
}
