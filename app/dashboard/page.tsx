import { getAuthUser } from "@/lib/supabase/server";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { DashboardDataProvider } from "@/features/dashboard/context/dashboard-data-context";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

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

  return (
    <DashboardDataProvider initialMetrics={initialMetrics}>
      <DashboardContent />
    </DashboardDataProvider>
  );
}
