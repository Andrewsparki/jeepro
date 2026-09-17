import { Metadata } from "next";
import { GlobalChatView } from "@/features/chat/components/global-chat-view";

export const metadata: Metadata = {
  title: "Global Chat | JEE Pro",
  description: "Connect and discuss problem-solving with fellow JEE aspirants across India in real-time.",
};

export default function DashboardChatPage() {
  return <GlobalChatView />;
}
