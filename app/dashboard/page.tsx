import { getAuthUser } from "@/lib/supabase/server";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { DashboardPageBridge } from "@/features/dashboard/components/dashboard-page-bridge";

export default async function DashboardPage() {
  const user = await getAuthUser();
  let initialMetrics = null;

  if (user) {
    try {
      initialMetrics = await getDashboardMetrics(user.id);
    } catch (err) {
      console.error("Failed to load initial server metrics:", err);
    }
  }

  return <DashboardPageBridge initialMetrics={initialMetrics} />;
}
