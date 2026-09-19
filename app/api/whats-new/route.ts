import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPublishedUpdates,
  markUpdateAsRead,
  markAllUpdatesAsRead,
} from "@/features/whats-new/services/whats-new.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updates = await getPublishedUpdates(user?.id);
    return NextResponse.json({ updates });
  } catch (error: any) {
    console.error("Error in GET /api/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch updates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.all && Array.isArray(body.updateIds)) {
      await markAllUpdatesAsRead(user.id, body.updateIds);
      return NextResponse.json({ success: true });
    }

    if (body.updateId) {
      await markUpdateAsRead(user.id, body.updateId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing updateId or updateIds" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Failed to mark as read" }, { status: 500 });
  }
}
