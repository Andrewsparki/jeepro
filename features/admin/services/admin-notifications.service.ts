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
  pageSize: number = 20
): Promise<PaginatedNotifications> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  const { data, count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
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
