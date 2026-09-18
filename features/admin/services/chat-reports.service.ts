"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "./audit-log.service";

export interface AdminChatReport {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  // Joined data
  reporter?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reported_message?: {
    id: string;
    content: string;
    created_at: string;
    deleted_at: string | null;
    sender_id: string;
    sender_email?: string;
    sender_name?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface PaginatedChatReports {
  reports: AdminChatReport[];
  total: number;
  pendingCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get paginated list of chat moderation reports for the Admin Centre.
 */
export async function getAdminChatReports(
  page: number = 1,
  pageSize: number = 20,
  statusFilter?: "pending" | "reviewed" | "dismissed" | "all"
): Promise<PaginatedChatReports> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  // Base query for counting pending reports
  const { count: pendingCount } = await supabase
    .from("chat_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  let query = supabase
    .from("chat_reports")
    .select("*", { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching admin chat reports:", error);
    return { reports: [], total: 0, pendingCount: pendingCount || 0, page, pageSize, totalPages: 0 };
  }

  const rawReports = data || [];
  if (rawReports.length === 0) {
    return { reports: [], total: 0, pendingCount: pendingCount || 0, page, pageSize, totalPages: 0 };
  }

  // Collect referenced IDs for profile & message hydration
  const reporterIds = [...new Set(rawReports.map((r) => r.reporter_id).filter(Boolean))];
  const reviewerIds = [...new Set(rawReports.map((r) => r.reviewed_by).filter(Boolean))];
  const messageIds = [...new Set(rawReports.map((r) => r.message_id).filter(Boolean))];

  // 1. Fetch reported messages
  let messageMap: Record<string, { id: string; content: string; created_at: string; deleted_at: string | null; sender_id: string }> = {};
  let messageSenderIds: string[] = [];

  if (messageIds.length > 0) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, content, created_at, deleted_at, sender_id")
      .in("id", messageIds);

    if (messages) {
      messageMap = Object.fromEntries(messages.map((m) => [m.id, m]));
      messageSenderIds = [...new Set(messages.map((m) => m.sender_id).filter(Boolean))];
    }
  }

  // 2. Fetch all related user profiles (reporters, reviewers, and message senders)
  const allUserIds = [...new Set([...reporterIds, ...reviewerIds, ...messageSenderIds])];
  let userMap: Record<string, { id: string; email: string; full_name: string | null; avatar_url: string | null }> = {};

  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", allUserIds);

    if (profiles) {
      userMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  // Enrich reports with full details
  const enriched: AdminChatReport[] = rawReports.map((r) => {
    const msg = messageMap[r.message_id];
    const msgSender = msg ? userMap[msg.sender_id] : undefined;

    return {
      ...r,
      reporter: userMap[r.reporter_id] || undefined,
      reviewer: r.reviewed_by ? userMap[r.reviewed_by] || undefined : undefined,
      reported_message: msg
        ? {
            ...msg,
            sender_email: msgSender?.email,
            sender_name: msgSender?.full_name || undefined,
          }
        : undefined,
    };
  });

  const total = count || 0;

  return {
    reports: enriched,
    total,
    pendingCount: pendingCount || 0,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Update report status (pending -> reviewed or dismissed).
 */
export async function updateReportStatus(
  reportId: string,
  status: "pending" | "reviewed" | "dismissed",
  adminUserId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("chat_reports")
    .update({
      status,
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    console.error("Error updating chat report status:", error);
    return { success: false, error: error.message };
  }

  // Record audit log event
  await logAuditEvent(adminUserId, "update_chat_report_status", "chat_report", reportId, { status });

  return { success: true, error: null };
}

/**
 * Moderates a reported message: soft-deletes the message and marks the report reviewed.
 */
export async function deleteReportedMessage(
  messageId: string,
  reportId: string,
  adminUserId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createAdminClient();

  // 1. Soft delete the chat message
  const { error: deleteError } = await supabase
    .from("chat_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);

  if (deleteError) {
    console.error("Error moderating chat message:", deleteError);
    return { success: false, error: deleteError.message };
  }

  // 2. Mark report as reviewed
  await updateReportStatus(reportId, "reviewed", adminUserId);

  // 3. Record audit log event
  await logAuditEvent(adminUserId, "moderate_chat_message", "chat_message", messageId, { reportId });

  return { success: true, error: null };
}
