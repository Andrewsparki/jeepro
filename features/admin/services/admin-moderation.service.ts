"use server";

import { verifyAdmin } from "./admin-auth.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "./audit-log.service";
import { createClient } from "@/lib/supabase/server";

export type ModerationScope = "global_chat" | "direct_messages" | "study_groups" | "platform_access";
export type ModerationStatus = "active" | "muted" | "restricted" | "banned" | "suspended";

export interface ScopedModerationDetail {
  scope: ModerationScope;
  status: ModerationStatus;
  reason: string | null;
  duration_mins: number | null;
  expires_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface UserScopedModerationSummary {
  userId: string;
  scopes: Record<ModerationScope, ScopedModerationDetail>;
  auditEvents: {
    id: string;
    action: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }[];
}

const DEFAULT_SCOPES: ModerationScope[] = [
  "global_chat",
  "direct_messages",
  "study_groups",
  "platform_access",
];

/**
 * Server-side helper to check if a user is restricted for a specific scope.
 */
export async function checkUserScopeModeration(
  userId: string,
  scope: ModerationScope
): Promise<{ isRestricted: boolean; status: ModerationStatus; reason: string | null; expiresAt: string | null }> {
  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("user_moderation_scopes")
      .select("status, reason, expires_at")
      .eq("user_id", userId)
      .eq("scope", scope)
      .maybeSingle();

    if (error || !row) {
      return { isRestricted: false, status: "active", reason: null, expiresAt: null };
    }

    if (row.status === "active") {
      return { isRestricted: false, status: "active", reason: null, expiresAt: null };
    }

    // Check expiration
    if (row.expires_at && new Date(row.expires_at) <= new Date()) {
      return { isRestricted: false, status: "active", reason: null, expiresAt: null };
    }

    return {
      isRestricted: true,
      status: row.status as ModerationStatus,
      reason: row.reason,
      expiresAt: row.expires_at,
    };
  } catch (err) {
    console.error("Error in checkUserScopeModeration:", err);
    return { isRestricted: false, status: "active", reason: null, expiresAt: null };
  }
}

/**
 * Fetch a user's scoped moderation summary across all feature scopes.
 */
export async function adminGetUserScopedModeration(
  targetUserId: string
): Promise<{ success: boolean; data?: UserScopedModerationSummary; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();

    // 1. Fetch moderation scope rows
    const { data: scopeRows, error: scopeError } = await supabase
      .from("user_moderation_scopes")
      .select("scope, status, reason, duration_mins, expires_at, updated_at, created_by")
      .eq("user_id", targetUserId);

    if (scopeError) {
      console.error("Error fetching user moderation scopes:", scopeError);
    }

    // Map fetched scopes or default to 'active'
    const scopeMap: Record<string, ScopedModerationDetail> = {};
    DEFAULT_SCOPES.forEach((s) => {
      scopeMap[s] = {
        scope: s,
        status: "active",
        reason: null,
        duration_mins: null,
        expires_at: null,
        updated_at: null,
        created_by: null,
      };
    });

    (scopeRows || []).forEach((row) => {
      if (scopeMap[row.scope as ModerationScope]) {
        // Check expiration
        const isExpired = row.expires_at && new Date(row.expires_at) < new Date();
        scopeMap[row.scope as ModerationScope] = {
          scope: row.scope as ModerationScope,
          status: isExpired ? "active" : (row.status as ModerationStatus),
          reason: isExpired ? null : row.reason,
          duration_mins: row.duration_mins,
          expires_at: row.expires_at,
          updated_at: row.updated_at,
          created_by: row.created_by,
        };
      }
    });

    // 2. Fetch audit events
    const { data: auditLogs } = await supabase
      .from("audit_logs")
      .select("id, action, created_at, metadata")
      .eq("target_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      success: true,
      data: {
        userId: targetUserId,
        scopes: scopeMap as Record<ModerationScope, ScopedModerationDetail>,
        auditEvents: (auditLogs || []) as UserScopedModerationSummary["auditEvents"],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch moderation status.";
    return { success: false, error: msg };
  }
}

/**
 * Apply or update a moderation action for a specific scope.
 */
export async function adminUpdateScopedModeration(
  targetUserId: string,
  scope: ModerationScope,
  status: ModerationStatus,
  reason?: string,
  durationMins?: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const trimmedReason = reason?.trim() || null;
    let expiresAt: string | null = null;

    if (durationMins && durationMins > 0) {
      expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();
    }

    const payload = {
      user_id: targetUserId,
      scope,
      status,
      reason: status === "active" ? null : trimmedReason || `Restriction applied by admin (${status})`,
      duration_mins: status === "active" ? null : durationMins || null,
      expires_at: status === "active" ? null : expiresAt,
      created_by: admin.user.id,
      updated_at: new Date().toISOString(),
    };

    // 1. Upsert into user_moderation_scopes
    const { error: upsertError } = await supabase
      .from("user_moderation_scopes")
      .upsert(payload, { onConflict: "user_id,scope" });

    if (upsertError) {
      console.error("Error updating user_moderation_scopes:", upsertError);
      return { success: false, error: upsertError.message };
    }

    // 2. Handle Scope-Specific Side Effects & Profile Syncs
    if (scope === "global_chat") {
      const isMuted = status === "muted";
      const isBanned = status === "banned";
      await supabase
        .from("profiles")
        .update({
          is_muted: isMuted,
          mute_reason: isMuted ? trimmedReason : null,
          is_banned: isBanned,
          ban_reason: isBanned ? trimmedReason : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);
    } else if (scope === "platform_access") {
      const isSuspended = status === "suspended";
      await supabase
        .from("profiles")
        .update({
          is_suspended: isSuspended,
          suspended_reason: isSuspended ? trimmedReason : null,
          suspended_until: isSuspended ? expiresAt : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);
    } else if (scope === "study_groups" && status === "banned") {
      // Eject user from all study groups when banned from Study Groups
      await supabase.from("group_members").delete().eq("user_id", targetUserId);
    }

    // 3. Log Audit Event
    await logAuditEvent(admin.user.id, `moderation.${scope}.${status}`, "user_moderation", targetUserId, {
      scope,
      status,
      reason: trimmedReason,
      duration_mins: durationMins || null,
      expires_at: expiresAt,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update moderation status.";
    return { success: false, error: msg };
  }
}
