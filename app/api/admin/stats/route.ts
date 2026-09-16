import { NextResponse } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { getDashboardStats, getRecentUsers } from "@/features/admin/services/admin-dashboard.service";

export async function GET() {
  await verifyAdmin();

  const [stats, recentUsers] = await Promise.all([
    getDashboardStats(),
    getRecentUsers(5),
  ]);

  return NextResponse.json({ stats, recentUsers });
}
