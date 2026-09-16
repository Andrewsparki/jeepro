import { redirect } from "next/navigation";

interface DashboardChatRedirectProps {
  params: Promise<{ userId: string }>;
}

export default async function DashboardChatRedirect({
  params,
}: DashboardChatRedirectProps) {
  const { userId } = await params;
  redirect(`/chat/${userId}`);
}
