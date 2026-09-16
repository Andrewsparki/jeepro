import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import {
  getSystemSettings,
  updateMaintenanceMode,
} from "@/features/admin/services/admin-system.service";
import { logAuditEvent } from "@/features/admin/services/audit-log.service";

export async function GET() {
  await verifyAdmin();

  const settings = await getSystemSettings();

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const { user } = await verifyAdmin();

  let body: {
    maintenance_enabled?: boolean;
    maintenance_message?: string;
    expected_return_time?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Handle maintenance mode update
  if (body.maintenance_enabled !== undefined) {
    const result = await updateMaintenanceMode(
      user.id,
      body.maintenance_enabled,
      body.maintenance_message,
      body.expected_return_time
    );

    if (!result.success) {
      console.error("[Admin System API] Failed to update maintenance mode:", result.error);
      return NextResponse.json(
        { error: "Unable to update maintenance mode. Please try again." },
        { status: 500 }
      );
    }

    // Audit log
    await logAuditEvent(
      user.id,
      body.maintenance_enabled ? "maintenance.enabled" : "maintenance.disabled",
      "system",
      "maintenance_mode",
      {
        message: body.maintenance_message,
        expected_return_time: body.expected_return_time,
      }
    );
  }

  // Return updated settings
  const settings = await getSystemSettings();
  return NextResponse.json(settings);
}
