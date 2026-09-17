import { Metadata } from "next";
import { GroupsView } from "@/features/groups/components/groups-view";

export const metadata: Metadata = {
  title: "Study Groups | JEE Pro",
  description: "Join or create study circles, solve JEE problems together, and collaborate.",
};

export default function DashboardGroupsPage() {
  return <GroupsView />;
}
