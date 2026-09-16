import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { getAuditLogs } from "@/features/admin/services/audit-log.service";

export async function GET(request: NextRequest) {
  await verifyAdmin();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25", 10), 100);

  const result = await getAuditLogs(page, pageSize);

  return NextResponse.json(result);
}
