import { Metadata } from "next";
import { PrivateChatView } from "@/features/chat/components/private-chat-view";

export const metadata: Metadata = {
  title: "Direct Chat | JEE Pro",
  description: "Secure 1-to-1 peer discussion and study problem solving with your accepted friend.",
};

interface PrivateChatPageProps {
  params: Promise<{ userId: string }>;
}

export default async function PrivateChatPage({ params }: PrivateChatPageProps) {
  const { userId } = await params;

  return <PrivateChatView otherUserId={userId} />;
}
