import { createClient } from "@/lib/supabase/client";
import { AchievementItem } from "../types/achievement.types";
import { toast } from "sonner";
import { calculateStreakFromSessions } from "@/lib/date-utils";

export class AchievementsService {
  private static cache: {
    userId: string;
    items: AchievementItem[];
    timestamp: number;
  } | null = null;

  private static CACHE_TTL_MS = 30000; // 30 seconds TTL

  static invalidateCache(userId?: string) {
    if (!userId || AchievementsService.cache?.userId === userId) {
      AchievementsService.cache = null;
    }
  }

  /**
   * Fetches all achievements with user unlock status and real-time progress.
   * Utilizes client-side TTL caching and server-side RPC get_user_achievements with
   * an authoritative live-calculation fallback.
   */
  static async getUserAchievements(userId?: string, options?: { forceRefresh?: boolean }): Promise<AchievementItem[]> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return [];

      // Serve from memory cache if fresh and not force-refreshing
      if (
        !options?.forceRefresh &&
        AchievementsService.cache &&
        AchievementsService.cache.userId === resolvedUserId &&
        Date.now() - AchievementsService.cache.timestamp < AchievementsService.CACHE_TTL_MS
      ) {
        return AchievementsService.cache.items;
      }

      const { data, error } = await supabase.rpc("get_user_achievements", {
        p_user_id: resolvedUserId,
      });

      if (error) {
        console.warn("[AchievementsService] get_user_achievements RPC error, using authoritative live fallback:", error.message);
        return await this.fallbackGetUserAchievements(resolvedUserId);
      }

      const items: AchievementItem[] = (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        key: item.key as string,
        title: item.title as string,
        description: item.description as string,
        icon: item.icon as string,
        category: item.category as AchievementItem["category"],
        tier: (item.tier as AchievementItem["tier"]) || "bronze",
        requirement_type: item.requirement_type as AchievementItem["requirement_type"],
        requirement_value: Number(item.requirement_value || 0),
        xp_reward: Number(item.xp_reward || 0),
        unlocked: Boolean(item.unlocked),
        unlocked_at: (item.unlocked_at as string) || null,
        current_progress: Number(item.current_progress || 0),
        progress_percentage: Number(item.progress_percentage || 0),
      }));

      // Store in memory cache
      AchievementsService.cache = {
        userId: resolvedUserId,
        items,
        timestamp: Date.now(),
      };

      return items;
    } catch (err) {
      console.error("[AchievementsService] getUserAchievements exception:", err);
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (resolvedUserId) {
        return await this.fallbackGetUserAchievements(resolvedUserId);
      }
      return [];
    }
  }


  /**
   * Evaluates user activity against all locked achievements and unlocks newly completed ones.
   * This is atomic, idempotent, and executed via the PostgreSQL SECURITY DEFINER function.
   */
  static async evaluateAchievements(userId?: string): Promise<AchievementItem[]> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return [];

      const { data, error } = await supabase.rpc("evaluate_user_achievements", {
        p_user_id: resolvedUserId,
      });

      if (error) {
        console.warn("[AchievementsService] evaluate_user_achievements RPC error:", error.message);
        return [];
      }

      const newlyUnlocked: AchievementItem[] = (data || []).map((item: Record<string, unknown>) => ({
        id: (item.achievement_id || item.id) as string,
        key: (item.achievement_key || item.key) as string,
        title: item.title as string,
        description: item.description as string,
        icon: item.icon as string,
        category: item.category as AchievementItem["category"],
        tier: (item.tier as AchievementItem["tier"]) || "bronze",
        requirement_type: (item.requirement_type as AchievementItem["requirement_type"]) || "session_count",
        requirement_value: Number(item.requirement_value || 0),
        xp_reward: Number(item.xp_reward || 0),
        unlocked: true,
        unlocked_at: (item.unlocked_at as string) || new Date().toISOString(),
        current_progress: Number(item.requirement_value || 0),
        progress_percentage: 100,
      }));

      // Always invalidate cached achievements for this user since metrics or unlocks changed
      AchievementsService.invalidateCache(resolvedUserId);

      // Broadcast custom event and show toast for newly unlocked achievements
      if (typeof window !== "undefined") {
        if (newlyUnlocked.length > 0) {
          newlyUnlocked.forEach((achievement: AchievementItem) => {
            toast.success(`🏅 Achievement Unlocked: ${achievement.title}!`, {
              description: `${achievement.description} (+${achievement.xp_reward} XP)`,
            });
            window.dispatchEvent(
              new CustomEvent("jee-pro:achievement-unlocked", { detail: achievement })
            );
          });
        }
        // Always dispatch progress update event so all mounted components refresh immediately
        window.dispatchEvent(
          new CustomEvent("jee-pro:achievement-progress-updated", {
            detail: { userId: resolvedUserId, newlyUnlocked },
          })
        );
      }

      return newlyUnlocked;
    } catch (err) {
      console.error("[AchievementsService] evaluateAchievements exception:", err);
      return [];
    }
  }

  /**
   * Authoritative fallback calculation using real user data from Supabase tables:
   * study_sessions, user_topic_progress, topics, streak, and XP.
   * Guarantees the UI never silently shows 0% when the user has real progress.
   */
  private static async fallbackGetUserAchievements(userId: string): Promise<AchievementItem[]> {
    try {
      const supabase = createClient();

      // Query definitions, user unlocks, and live user metrics in parallel
      const [achRes, userAchRes, sessRes, progRes, topicsRes, streakRes, xpRes] = await Promise.all([
        supabase.from("achievements").select("*").order("category").order("requirement_value"),
        supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", userId),
        supabase.from("study_sessions").select("duration_seconds, started_at").eq("user_id", userId),
        supabase.from("user_topic_progress").select("topic_id").eq("user_id", userId).eq("status", "Mastered"),
        supabase.from("topics").select("id, chapter_id"),
        supabase.rpc("calculate_user_streak", { p_user_id: userId }),
        supabase.rpc("calculate_user_total_xp", { p_user_id: userId }),
      ]);

      if (achRes.error || !achRes.data || achRes.data.length === 0) {
        console.warn("[AchievementsService] Could not fetch achievements definitions:", achRes.error?.message);
        return [];
      }

      // Map persistent unlocks
      const unlockedMap = new Map<string, string>();
      (userAchRes.data || []).forEach((ua: { achievement_id: string; unlocked_at: string }) => {
        unlockedMap.set(ua.achievement_id, ua.unlocked_at);
      });

      // 1. Session Metrics
      const sessions = (sessRes.data || []) as Array<{ duration_seconds: number | null; started_at: string }>;
      const sessionCount = sessions.length;
      const totalDurationSeconds = sessions.reduce((sum: number, s: { duration_seconds: number | null }) => sum + (s.duration_seconds || 0), 0);
      const studyHours = Math.floor(totalDurationSeconds / 3600);

      // 2. Streak Metric (fallback date-based if RPC is null)
      let streakDays = Number(streakRes.data || 0);
      if (!streakDays && sessions.length > 0) {
        streakDays = calculateStreakFromSessions(sessions);
      }

      // 3. Topics Mastered Metric
      const masteredTopicsList = (progRes.data || []) as Array<{ topic_id: string }>;
      const masteredTopicIds = new Set(masteredTopicsList.map((p) => p.topic_id));
      const topicsMastered = masteredTopicIds.size;

      // 4. Chapters Mastered Metric
      const chapterTopicsMap = new Map<string, string[]>();
      ((topicsRes.data || []) as Array<{ id: string; chapter_id: string | null }>).forEach((t) => {
        if (!t.chapter_id) return;
        const list = chapterTopicsMap.get(t.chapter_id) || [];
        list.push(t.id);
        chapterTopicsMap.set(t.chapter_id, list);
      });

      let chaptersMastered = 0;
      chapterTopicsMap.forEach((topicIds) => {
        if (topicIds.length > 0 && topicIds.every((id) => masteredTopicIds.has(id))) {
          chaptersMastered++;
        }
      });

      // 5. Total XP Metric
      let totalXp = Number(xpRes.data || 0);
      if (!totalXp) {
        const sessionXp = sessions.reduce((sum: number, s: { duration_seconds: number | null }) => sum + Math.floor((s.duration_seconds || 0) / 60) * 2, 0);
        const topicXp = topicsMastered * 50;
        const chapterXp = chaptersMastered * 200;
        const achievementXp = (userAchRes.data || []).reduce((sum: number, ua: { achievement_id: string }) => {
          const ach = (achRes.data as Array<{ id: string; xp_reward?: number }>).find((a) => a.id === ua.achievement_id);
          return sum + Number(ach?.xp_reward || 0);
        }, 0);
        totalXp = sessionXp + topicXp + chapterXp + achievementXp;
      }

      // Map definitions with calculated real progress
      return achRes.data.map((a: Record<string, unknown>) => {
        const id = a.id as string;
        const requirementType = a.requirement_type as AchievementItem["requirement_type"];
        const requirementValue = Number(a.requirement_value || 1);

        let metricValue = 0;
        switch (requirementType) {
          case "session_count":
            metricValue = sessionCount;
            break;
          case "study_hours":
            metricValue = studyHours;
            break;
          case "streak_days":
            metricValue = streakDays;
            break;
          case "topics_mastered":
            metricValue = topicsMastered;
            break;
          case "chapters_mastered":
            metricValue = chaptersMastered;
            break;
          case "total_xp":
            metricValue = totalXp;
            break;
          default:
            metricValue = 0;
        }

        const isPersistentUnlock = unlockedMap.has(id);
        const isEligible = metricValue >= requirementValue;
        const unlocked = isPersistentUnlock || isEligible;
        const unlockedAt = unlockedMap.get(id) || (isEligible ? new Date().toISOString() : null);

        const currentProgress = unlocked
          ? requirementValue
          : Math.min(metricValue, requirementValue);

        const progressPercentage = unlocked
          ? 100
          : Math.min(
              100,
              Math.round((metricValue / (requirementValue || 1)) * 1000) / 10
            );

        return {
          id,
          key: a.key as string,
          title: a.title as string,
          description: a.description as string,
          icon: a.icon as string,
          category: a.category as AchievementItem["category"],
          tier: (a.tier as AchievementItem["tier"]) || "bronze",
          requirement_type: requirementType,
          requirement_value: requirementValue,
          xp_reward: Number(a.xp_reward || 50),
          unlocked,
          unlocked_at: unlockedAt,
          current_progress: currentProgress,
          progress_percentage: progressPercentage,
        };
      });
    } catch (err) {
      console.error("[AchievementsService] fallbackGetUserAchievements error:", err);
      return [];
    }
  }
}
