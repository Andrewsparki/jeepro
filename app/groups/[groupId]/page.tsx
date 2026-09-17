import { Metadata } from "next";
import { GroupDetailView } from "@/features/groups/components/group-detail-view";

export const metadata: Metadata = {
  title: "Study Group | JEE Pro",
  description: "Collaborative study group workspace, chat, and member roster.",
};

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groupId } = await params;

  return <GroupDetailView groupId={groupId} />;
}
