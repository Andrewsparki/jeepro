import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import {
  getNotifications,
  createNotification,
  type CreateNotificationInput,
} from "@/features/admin/services/admin-notifications.service";
import { logAuditEvent } from "@/features/admin/services/audit-log.service";

export async function GET(request: NextRequest) {
  await verifyAdmin();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20", 10), 100);

  const result = await getNotifications(page, pageSize);

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { user } = await verifyAdmin();

  let body: CreateNotificationInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate required fields
  if (!body.title?.trim() || !body.message?.trim()) {
    return NextResponse.json(
      { error: "Title and message are required" },
      { status: 400 }
    );
  }

  if (!["info", "warning", "success", "error"].includes(body.type)) {
    return NextResponse.json(
      { error: "Invalid notification type" },
      { status: 400 }
    );
  }

  if (!["all", "user"].includes(body.target_type)) {
    return NextResponse.json(
      { error: "Invalid target type" },
      { status: 400 }
    );
  }

  if (body.target_type === "user" && !body.target_user_id) {
    return NextResponse.json(
      { error: "Target user ID is required for user-targeted notifications" },
      { status: 400 }
    );
  }

  const result = await createNotification(user.id, body);

  if (result.error) {
    console.error("[Admin Notifications API] Failed to create notification:", result.error);
    const isDedupMessage = result.error.includes("within the last 5 minutes");
    const safeError = isDedupMessage
      ? result.error
      : "Unable to create notification. Please try again.";
    return NextResponse.json({ error: safeError }, { status: isDedupMessage ? 409 : 500 });
  }

  // Audit log
  await logAuditEvent(
    user.id,
    "notification.created",
    "notification",
    result.notification?.id,
    {
      title: body.title,
      target_type: body.target_type,
      type: body.type,
    }
  );

  return NextResponse.json(result.notification, { status: 201 });
}
