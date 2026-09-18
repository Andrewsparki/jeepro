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
  pageSize: number = 25,
  search?: string
): Promise<PaginatedAuditLogs> {
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
    .from("audit_logs")
    .select("*", { count: "exact" });

  if (trimmedSearch) {
    const filters = [
      `action.ilike.%${trimmedSearch}%`,
      `target_type.ilike.%${trimmedSearch}%`,
      `target_id.ilike.%${trimmedSearch}%`,
      `admin_user_id.ilike.%${trimmedSearch}%`,
    ];

    if (matchingUserIds.length > 0) {
      filters.push(`admin_user_id.in.(${matchingUserIds.join(",")})`);
      filters.push(`target_id.in.(${matchingUserIds.join(",")})`);
    }

    query = query.or(filters.join(","));
  }

  const { data, count, error } = await query
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

/**
 * Clears/purges audit log entries and records an audit log entry for the purge action.
 */
export async function clearAuditLogs(
  adminUserId: string,
  search?: string
): Promise<{ success: boolean; clearedCount: number; error?: string }> {
  const supabase = await createAdminClient();
  const trimmedSearch = search?.trim();

  try {
    let idsToDelete: string[] = [];

    if (trimmedSearch) {
      // Find matching IDs to delete
      let matchingUserIds: string[] = [];
      const { data: matchedProfiles } = await supabase
        .from("profiles")
        .select("id")
        .or(`email.ilike.%${trimmedSearch}%,full_name.ilike.%${trimmedSearch}%`);

      if (matchedProfiles && matchedProfiles.length > 0) {
        matchingUserIds = matchedProfiles.map((p) => p.id);
      }

      let query = supabase.from("audit_logs").select("id");
      const filters = [
        `action.ilike.%${trimmedSearch}%`,
        `target_type.ilike.%${trimmedSearch}%`,
        `target_id.ilike.%${trimmedSearch}%`,
        `admin_user_id.ilike.%${trimmedSearch}%`,
      ];

      if (matchingUserIds.length > 0) {
        filters.push(`admin_user_id.in.(${matchingUserIds.join(",")})`);
        filters.push(`target_id.in.(${matchingUserIds.join(",")})`);
      }

      const { data: searchMatches } = await query.or(filters.join(","));
      idsToDelete = (searchMatches || []).map((m) => m.id);

      if (idsToDelete.length === 0) {
        return { success: true, clearedCount: 0 };
      }

      const { error: deleteError } = await supabase
        .from("audit_logs")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        return { success: false, clearedCount: 0, error: deleteError.message };
      }
    } else {
      // Full purge
      const { count } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true });

      const { error: deleteError } = await supabase
        .from("audit_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        return { success: false, clearedCount: 0, error: deleteError.message };
      }

      idsToDelete = Array.from({ length: count || 0 });
    }

    // Record audit event for the clear operation
    await logAuditEvent(adminUserId, "audit_logs.cleared", "audit_logs", "all", {
      cleared_count: idsToDelete.length,
      filter: trimmedSearch || "ALL",
    });

    return { success: true, clearedCount: idsToDelete.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to clear audit logs";
    return { success: false, clearedCount: 0, error: msg };
  }
}
