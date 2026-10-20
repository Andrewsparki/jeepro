import { createClient as createServerClient, getAuthUser } from "@/lib/supabase/server";
import { getDashboardMetrics } from "@/features/study/services/progress";
import { DashboardPageBridge } from "@/features/dashboard/components/dashboard-page-bridge";

export default async function DashboardPage() {
  const user = await getAuthUser();
  let initialMetrics = null;

  if (user) {
    try {
      const supabase = await createServerClient();
      initialMetrics = await getDashboardMetrics(user.id, { client: supabase });
    } catch (err) {
      console.error("Failed to load initial server metrics:", err);
    }
  }

  return <DashboardPageBridge initialMetrics={initialMetrics} />;
}
