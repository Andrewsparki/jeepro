import { Metadata } from "next";
import { FriendsView } from "@/features/friends/components/friends-view";

export const metadata: Metadata = {
  title: "Friends & Community | JEE Pro",
  description: "Connect with fellow JEE aspirants, build study partnerships, and collaborate.",
};

export default function FriendsPage() {
  return <FriendsView />;
}
