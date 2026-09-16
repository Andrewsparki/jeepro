import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { getUsers } from "@/features/admin/services/admin-users.service";

export async function GET(request: NextRequest) {
  await verifyAdmin();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20", 10), 100);
  const search = searchParams.get("search") || undefined;

  const result = await getUsers(page, pageSize, search);

  return NextResponse.json(result);
}
