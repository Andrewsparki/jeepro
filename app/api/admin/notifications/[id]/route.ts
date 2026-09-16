import { NextResponse } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { deleteNotification } from "@/features/admin/services/admin-notifications.service";
import { logAuditEvent } from "@/features/admin/services/audit-log.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await verifyAdmin();

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
  }

  const result = await deleteNotification(id);

  if (!result.success) {
    console.error("[Admin Delete Notification API] Error:", result.error);
    return NextResponse.json(
      { error: "Unable to delete notification. Please try again." },
      { status: 500 }
    );
  }

  // Audit log
  await logAuditEvent(user.id, "notification.deleted", "notification", id);

  return NextResponse.json({ success: true });
}
