"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  target_type: "all" | "user";
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_email?: string;
  target_user_email?: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  target_type: "all" | "user";
  target_user_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getNotifications(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  typeFilter?: string,
  targetTypeFilter?: string
): Promise<PaginatedNotifications> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;
  const trimmedSearch = search?.trim();

  let matchingUserIds: string[] = [];
  if (trimmedSearch) {
    const { data: matchedProfiles } = await supabase
      .from("profiles")
      .select("id")
      .or(`email.ilike.%${trimmedSearch}%,full_name.ilike.%${trimmedSearch}%`);

    if (matchedProfiles && matchedProfiles.length > 0) {
      matchingUserIds = matchedProfiles.map((p) => p.id);
    }
  }

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" });

  if (typeFilter && typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  if (targetTypeFilter && targetTypeFilter !== "all_targets") {
    query = query.eq("target_type", targetTypeFilter);
  }

  if (trimmedSearch) {
    const filters = [
      `title.ilike.%${trimmedSearch}%`,
      `message.ilike.%${trimmedSearch}%`,
      `created_by.ilike.%${trimmedSearch}%`,
      `target_user_id.ilike.%${trimmedSearch}%`,
    ];

    if (matchingUserIds.length > 0) {
      filters.push(`created_by.in.(${matchingUserIds.join(",")})`);
      filters.push(`target_user_id.in.(${matchingUserIds.join(",")})`);
    }

    query = query.or(filters.join(","));
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], total: 0, page, pageSize, totalPages: 0 };
  }

  // Enrich with creator and target user emails
  const notifications = data || [];
  const creatorIds = [...new Set(notifications.map((n) => n.created_by).filter(Boolean))];
  const targetIds = [...new Set(notifications.map((n) => n.target_user_id).filter(Boolean))];
  const allIds = [...new Set([...creatorIds, ...targetIds])];

  let emailMap: Record<string, string> = {};
  if (allIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", allIds);

    if (profiles) {
      emailMap = Object.fromEntries(profiles.map((p) => [p.id, p.email]));
    }
  }

  const enriched: Notification[] = notifications.map((n) => ({
    ...n,
    creator_email: emailMap[n.created_by] || undefined,
    target_user_email: n.target_user_id ? emailMap[n.target_user_id] || undefined : undefined,
  }));

  const total = count || 0;

  return {
    notifications: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Clears/purges notifications (optionally filtered by search/type).
 */
export async function clearNotifications(
  search?: string,
  typeFilter?: string
): Promise<{ success: boolean; clearedCount: number; error: string | null }> {
  const supabase = await createAdminClient();
  const trimmedSearch = search?.trim();

  try {
    let idsToDelete: string[] = [];

    if (trimmedSearch || (typeFilter && typeFilter !== "all")) {
      let matchingUserIds: string[] = [];
      if (trimmedSearch) {
        const { data: matchedProfiles } = await supabase
          .from("profiles")
          .select("id")
          .or(`email.ilike.%${trimmedSearch}%,full_name.ilike.%${trimmedSearch}%`);

        if (matchedProfiles && matchedProfiles.length > 0) {
          matchingUserIds = matchedProfiles.map((p) => p.id);
        }
      }

      let query = supabase.from("notifications").select("id");

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (trimmedSearch) {
        const filters = [
          `title.ilike.%${trimmedSearch}%`,
          `message.ilike.%${trimmedSearch}%`,
          `created_by.ilike.%${trimmedSearch}%`,
          `target_user_id.ilike.%${trimmedSearch}%`,
        ];

        if (matchingUserIds.length > 0) {
          filters.push(`created_by.in.(${matchingUserIds.join(",")})`);
          filters.push(`target_user_id.in.(${matchingUserIds.join(",")})`);
        }

        query = query.or(filters.join(","));
      }

      const { data: searchMatches } = await query;
      idsToDelete = (searchMatches || []).map((m) => m.id);

      if (idsToDelete.length === 0) {
        return { success: true, clearedCount: 0, error: null };
      }

      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        return { success: false, clearedCount: 0, error: deleteError.message };
      }
    } else {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true });

      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        return { success: false, clearedCount: 0, error: deleteError.message };
      }

      idsToDelete = Array.from({ length: count || 0 });
    }

    return { success: true, clearedCount: idsToDelete.length, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to clear notifications";
    return { success: false, clearedCount: 0, error: msg };
  }
}

/**
 * Creates a notification with duplicate prevention.
 * Returns the created notification or an error message.
 */
export async function createNotification(
  adminUserId: string,
  input: CreateNotificationInput
): Promise<{ notification: Notification | null; error: string | null }> {
  const supabase = await createAdminClient();

  // Dedup check: same title + target within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  let dedupQuery = supabase
    .from("notifications")
    .select("id, title, created_at")
    .eq("title", input.title)
    .eq("target_type", input.target_type)
    .gte("created_at", fiveMinutesAgo);

  if (input.target_type === "user" && input.target_user_id) {
    dedupQuery = dedupQuery.eq("target_user_id", input.target_user_id);
  }

  const { data: existing } = await dedupQuery;

  if (existing && existing.length > 0) {
    return {
      notification: null,
      error: `A notification with the same title was sent to this audience within the last 5 minutes (at ${new Date(existing[0].created_at).toLocaleTimeString()}). Please wait or change the title.`,
    };
  }

  // Create the notification
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: input.title,
      message: input.message,
      type: input.type,
      target_type: input.target_type,
      target_user_id: input.target_type === "user" ? input.target_user_id : null,
      metadata: input.metadata || {},
      created_by: adminUserId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return { notification: null, error: error.message };
  }

  return { notification: data as Notification, error: null };
}

export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
