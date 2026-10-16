import { Metadata } from "next";
import { getAuthUser } from "@/lib/supabase/server";
import { getUserAchievementsServer } from "@/features/achievements/services/achievements.server";
import { AchievementsView } from "@/features/achievements/components/achievements-view";
import { AchievementItem } from "@/features/achievements/types/achievement.types";

export const metadata: Metadata = {
  title: "Achievements | JEE Pro",
  description: "Unlock milestones, track your mastery, and earn prestige XP on JEE Pro.",
};

export default async function DashboardAchievementsPage() {
  const user = await getAuthUser();
  let initialAchievements: AchievementItem[] | undefined = undefined;

  if (user) {
    try {
      initialAchievements = await getUserAchievementsServer(user.id);
    } catch (err) {
      console.error("Failed to prefetch initial achievements on server:", err);
    }
  }

  return <AchievementsView initialAchievements={initialAchievements} />;
}
