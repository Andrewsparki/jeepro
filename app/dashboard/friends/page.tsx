import { redirect } from "next/navigation";

export default function DashboardFriendsRedirect() {
  redirect("/friends");
}
