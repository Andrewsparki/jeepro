import { createClient } from "@/lib/supabase/server";
import { AchievementItem } from "../types/achievement.types";

/**
 * Server-side loader for Achievements initial SSR hydration.
 * Strictly decoupled from client bundles to prevent next/headers bundling issues.
 */
export async function getUserAchievementsServer(
  userId: string
): Promise<AchievementItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_user_achievements", {
      p_user_id: userId,
    });

    if (error || !data) {
      return [];
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
      progress_percentage: Math.min(
        100,
        Math.round(Number(item.progress_percentage || 0))
      ),
    }));
  } catch (err) {
    console.error("[getUserAchievementsServer] Error:", err);
    return [];
  }
}
