import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { getAuditLogs, clearAuditLogs } from "@/features/admin/services/audit-log.service";

export async function GET(request: NextRequest) {
  await verifyAdmin();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25", 10), 100);
  const search = searchParams.get("search") || undefined;

  const result = await getAuditLogs(page, pageSize, search);

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { user } = await verifyAdmin();
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;

  const result = await clearAuditLogs(user.id, search);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to clear audit logs" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
