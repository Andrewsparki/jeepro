import { NextResponse, type NextRequest } from "next/server";
import { verifySuperAdmin } from "@/features/admin/services/admin-auth.service";
import {
  getUsersWithRoles,
  updateUserRole,
} from "@/features/admin/services/role-management.service";
import type { UserRole } from "@/features/admin/types/roles.types";

export async function GET(request: NextRequest) {
  await verifySuperAdmin();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20", 10), 100);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;

  const result = await getUsersWithRoles(page, pageSize, search, role);
  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  await verifySuperAdmin();

  try {
    const body = await request.json();
    const { userId, newRole, reason } = body as {
      userId: string;
      newRole: UserRole;
      reason?: string;
    };

    if (!userId || !newRole) {
      return NextResponse.json({ error: "userId and newRole are required." }, { status: 400 });
    }

    const result = await updateUserRole(userId, newRole, reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update role.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
