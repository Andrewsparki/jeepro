import { createClient } from "@/lib/supabase/client";
import { AchievementItem } from "../types/achievement.types";

export class AchievementsService {
  /**
   * Fetches all achievements with user unlock status and real-time progress.
   */
  static async getUserAchievements(userId?: string): Promise<AchievementItem[]> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return [];

      const { data, error } = await supabase.rpc("get_user_achievements", {
        p_user_id: resolvedUserId,
      });

      if (error) {
        // Fallback: If RPC does not exist yet in dev environment, query tables directly
        console.warn("[AchievementsService] get_user_achievements RPC error, using table query fallback:", error.message);
        return await this.fallbackGetUserAchievements(resolvedUserId);
      }

      return (data || []).map((item: Record<string, unknown>) => ({
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
    } catch (err) {
      console.error("[AchievementsService] getUserAchievements exception:", err);
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

      // Broadcast custom event for newly unlocked achievements
      if (typeof window !== "undefined" && newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((achievement: AchievementItem) => {
          window.dispatchEvent(
            new CustomEvent("jee-pro:achievement-unlocked", { detail: achievement })
          );
        });
      }

      return newlyUnlocked;
    } catch (err) {
      console.error("[AchievementsService] evaluateAchievements exception:", err);
      return [];
    }
  }

  /**
   * Fallback direct query if RPC is not available in local mock/test environment.
   */
  private static async fallbackGetUserAchievements(userId: string): Promise<AchievementItem[]> {
    try {
      const supabase = createClient();

      const [achRes, userAchRes] = await Promise.all([
        supabase.from("achievements").select("*").order("category").order("requirement_value"),
        supabase.from("user_achievements").select("*").eq("user_id", userId),
      ]);

      if (achRes.error || !achRes.data) {
        return [];
      }

      const unlockedMap = new Map<string, string>();
      (userAchRes.data || []).forEach((ua: { achievement_id: string; unlocked_at: string }) => {
        unlockedMap.set(ua.achievement_id, ua.unlocked_at);
      });

      return achRes.data.map((a: Record<string, unknown>) => {
        const id = a.id as string;
        const unlocked = unlockedMap.has(id);
        const unlockedAt = unlockedMap.get(id) || null;
        const requirementValue = Number(a.requirement_value || 1);

        return {
          id,
          key: a.key as string,
          title: a.title as string,
          description: a.description as string,
          icon: a.icon as string,
          category: a.category as AchievementItem["category"],
          tier: (a.tier as AchievementItem["tier"]) || "bronze",
          requirement_type: a.requirement_type as AchievementItem["requirement_type"],
          requirement_value: requirementValue,
          xp_reward: Number(a.xp_reward || 50),
          unlocked,
          unlocked_at: unlockedAt,
          current_progress: unlocked ? requirementValue : 0,
          progress_percentage: unlocked ? 100 : 0,
        };
      });
    } catch {
      return [];
    }
  }
}
