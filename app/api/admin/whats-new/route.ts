import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { logAuditEvent } from "@/features/admin/services/audit-log.service";
import {
  getAllUpdatesAdmin,
  createUpdateAdmin,
  updateUpdateAdmin,
  deleteUpdateAdmin,
} from "@/features/whats-new/services/whats-new.service";

export async function GET() {
  try {
    await verifyAdmin();
    const updates = await getAllUpdatesAdmin();
    return NextResponse.json({ updates });
  } catch (error: any) {
    console.error("Error in GET /api/admin/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAdmin();
    const body = await request.json();

    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const newUpdate = await createUpdateAdmin({
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category || "Feature",
      status: body.status || "Live",
      icon_name: body.icon_name || "Sparkles",
      image_url: body.image_url || null,
      link_url: body.link_url || null,
      link_label: body.link_label || null,
      is_published: body.is_published ?? true,
      is_archived: body.is_archived ?? false,
      published_at: body.published_at || new Date().toISOString(),
    });

    await logAuditEvent(user.id, "app_update.created", "app_updates", newUpdate.id, {
      title: newUpdate.title,
      category: newUpdate.category,
      status: newUpdate.status,
    });

    return NextResponse.json({ update: newUpdate }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Failed to create update" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await verifyAdmin();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Update ID is required" }, { status: 400 });
    }

    const updated = await updateUpdateAdmin({
      id: body.id,
      title: body.title,
      description: body.description,
      category: body.category,
      status: body.status,
      icon_name: body.icon_name,
      image_url: body.image_url,
      link_url: body.link_url,
      link_label: body.link_label,
      is_published: body.is_published,
      is_archived: body.is_archived,
      published_at: body.published_at,
    });

    await logAuditEvent(user.id, "app_update.updated", "app_updates", updated.id, {
      title: updated.title,
      is_published: updated.is_published,
      is_archived: updated.is_archived,
    });

    return NextResponse.json({ update: updated });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Failed to update update post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await verifyAdmin();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing update id" }, { status: 400 });
    }

    await deleteUpdateAdmin(id);

    await logAuditEvent(user.id, "app_update.deleted", "app_updates", id, {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/whats-new:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete update post" }, { status: 500 });
  }
}
