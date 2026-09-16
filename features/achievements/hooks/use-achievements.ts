"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AchievementsService } from "../services/achievements.service";
import {
  AchievementItem,
  AchievementCategory,
  AchievementStats,
} from "../types/achievement.types";

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAchievements = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    try {
      await AchievementsService.evaluateAchievements();
      const items = await AchievementsService.getUserAchievements();
      setAchievements(items);
      setError(null);
    } catch (err: unknown) {
      console.error("[useAchievements] Error loading achievements:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load achievements."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        await AchievementsService.evaluateAchievements();
        const items = await AchievementsService.getUserAchievements();
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
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Listen for realtime unlock events (e.g. from background session/topic completion)
  useEffect(() => {
    const handleUnlocked = () => {
      loadAchievements(true);
    };

    window.addEventListener("jee-pro:achievement-unlocked", handleUnlocked);
    return () => {
      window.removeEventListener("jee-pro:achievement-unlocked", handleUnlocked);
    };
  }, [loadAchievements]);

  // Filtered achievements by Category and Search
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [achievements, selectedCategory, searchQuery]);

  // Summary statistics
  const stats: AchievementStats = useMemo(() => {
    const total = achievements.length;
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const totalXpEarned = achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.xp_reward, 0);
    const overallPercentage =
      total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    return {
      total,
      unlockedCount,
      totalXpEarned,
      overallPercentage,
    };
  }, [achievements]);

  const refresh = useCallback(async () => {
    await loadAchievements(true);
  }, [loadAchievements]);

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
    refresh,
  };
}
