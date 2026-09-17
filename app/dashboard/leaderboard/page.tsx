import { Metadata } from "next";
import { LeaderboardView } from "@/features/leaderboard/components/leaderboard-view";

export const metadata: Metadata = {
  title: "Leaderboard | JEE Pro",
  description: "Track your JEE preparation rank, XP milestones, and compare progress with peers.",
};

export default function DashboardLeaderboardPage() {
  return <LeaderboardView />;
}
