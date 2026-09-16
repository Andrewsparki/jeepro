import { NextResponse } from "next/server";
import { getPublicMaintenanceStatus } from "@/features/admin/services/admin-system.service";

/**
 * Public endpoint — no authentication required.
 * Returns only the public-facing maintenance status information.
 * Does not expose any admin data, user IDs, or system internals.
 */
export async function GET() {
  const status = await getPublicMaintenanceStatus();

  return NextResponse.json({
    enabled: status.enabled,
    message: status.message,
    expected_return_time: status.expected_return_time,
  });
}
