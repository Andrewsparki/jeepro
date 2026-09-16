import { Metadata } from "next";
import { AchievementsView } from "@/features/achievements/components/achievements-view";

export const metadata: Metadata = {
  title: "Achievements | JEE Pro",
  description: "Unlock milestones, track your mastery, and earn prestige XP on JEE Pro.",
};

export default function AchievementsPage() {
  return <AchievementsView />;
}
