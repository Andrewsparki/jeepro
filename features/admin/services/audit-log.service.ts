"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined data
  admin_email?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Records an admin action in the audit log.
 */
export async function logAuditEvent(
  adminUserId: string,
  action: string,
  targetType?: string | null,
  targetId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    admin_user_id: adminUserId,
    action,
    target_type: targetType || null,
    target_id: targetId || null,
    metadata: metadata || {},
  });

  if (error) {
    // Log but don't throw — audit logging should not break admin operations
    console.error("Error writing audit log:", error);
  }
}

export async function getAuditLogs(
  page: number = 1,
  pageSize: number = 25
): Promise<PaginatedAuditLogs> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  const { data, count, error } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return { logs: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const logs = data || [];

  // Enrich with admin emails
  const adminIds = [...new Set(logs.map((l) => l.admin_user_id).filter(Boolean))];
  let emailMap: Record<string, string> = {};

  if (adminIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", adminIds);

    if (profiles) {
      emailMap = Object.fromEntries(profiles.map((p) => [p.id, p.email]));
    }
  }

  const enriched: AuditLogEntry[] = logs.map((l) => ({
    ...l,
    admin_email: emailMap[l.admin_user_id] || undefined,
  }));

  const total = count || 0;

  return {
    logs: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
