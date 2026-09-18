"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "./audit-log.service";
import { SupportTicket } from "@/features/support/services/support.service";

export interface AdminSupportTicket extends SupportTicket {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PaginatedSupportTickets {
  tickets: AdminSupportTicket[];
  total: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get paginated list of support tickets for the Admin Centre.
 */
export async function getAdminSupportTickets(
  page: number = 1,
  pageSize: number = 20,
  statusFilter?: "open" | "in_progress" | "resolved" | "closed" | "all"
): Promise<PaginatedSupportTickets> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  // Counts for overview cards
  const [{ count: openCount }, { count: inProgressCount }, { count: resolvedCount }] = await Promise.all([
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["resolved", "closed"]),
  ]);

  let query = supabase
    .from("support_tickets")
    .select("*", { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching admin support tickets:", error);
    return {
      tickets: [],
      total: 0,
      openCount: openCount || 0,
      inProgressCount: inProgressCount || 0,
      resolvedCount: resolvedCount || 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const rawTickets = data || [];
  if (rawTickets.length === 0) {
    return {
      tickets: [],
      total: 0,
      openCount: openCount || 0,
      inProgressCount: inProgressCount || 0,
      resolvedCount: resolvedCount || 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  // Hydrate user profiles
  const userIds = [...new Set(rawTickets.map((t) => t.user_id).filter(Boolean))];
  let userMap: Record<string, { id: string; email: string; full_name: string | null; avatar_url: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", userIds);

    if (profiles) {
      userMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const enriched: AdminSupportTicket[] = rawTickets.map((t) => ({
    ...t,
    user: userMap[t.user_id] || undefined,
  }));

  const total = count || 0;

  return {
    tickets: enriched,
    total,
    openCount: openCount || 0,
    inProgressCount: inProgressCount || 0,
    resolvedCount: resolvedCount || 0,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Update support ticket status (e.g. open -> in_progress -> resolved).
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "resolved" | "closed",
  adminUserId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createAdminClient();

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "resolved" || status === "closed") {
    updatePayload.resolved_at = new Date().toISOString();
    updatePayload.resolved_by = adminUserId;
  }

  const { error } = await supabase
    .from("support_tickets")
    .update(updatePayload)
    .eq("id", ticketId);

  if (error) {
    console.error("Error updating support ticket status:", error);
    return { success: false, error: error.message };
  }

  // Record audit log event
  await logAuditEvent(adminUserId, "update_support_ticket_status", "support_ticket", ticketId, { status });

  return { success: true, error: null };
}
