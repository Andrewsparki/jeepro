import { NextResponse } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { getUserDetail } from "@/features/admin/services/admin-users.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await verifyAdmin();

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const user = await getUserDetail(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
