"use server";

import { verifyAdmin } from "./admin-auth.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "./audit-log.service";

export interface AdminUserModerationSummary {
  userId: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    is_admin: boolean;
    is_muted: boolean;
    is_banned: boolean;
    mute_reason: string | null;
    ban_reason: string | null;
    created_at: string;
  };
  messagesCount: number;
  reportsCount: number;
  auditEvents: {
    id: string;
    action: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }[];
}

/**
 * Server-authorized action to soft-delete any user's message in Global Chat.
 */
export async function adminDeleteChatMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    // 1. Fetch message details to obtain sender_id for audit logging
    const { data: message, error: fetchError } = await supabase
      .from("chat_messages")
      .select("id, sender_id, content")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return { success: false, error: "Message not found or already removed." };
    }

    // 2. Soft delete message
    const { error: deleteError } = await supabase
      .from("chat_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (deleteError) {
      console.error("Error soft-deleting chat message:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // 3. Record audit log event
    await logAuditEvent(admin.user.id, "admin_delete_chat_message", "chat_message", messageId, {
      sender_id: message.sender_id,
      content_snippet: message.content?.substring(0, 100),
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete message.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized action to send a formal moderation warning notification to a user.
 */
export async function adminWarnChatUser(
  targetUserId: string,
  reason: string,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { success: false, error: "Warning reason is required." };
    }

    // 1. Insert warning notification for user
    const { error: notifError } = await supabase.from("notifications").insert({
      title: "Moderation Warning",
      message: `Administrator Warning: ${trimmedReason}`,
      type: "warning",
      target_type: "user",
      target_user_id: targetUserId,
      metadata: {
        reason: trimmedReason,
        details: details?.trim() || null,
        warned_by: admin.user.id,
      },
      created_by: admin.user.id,
    });

    if (notifError) {
      console.error("Error issuing moderation warning:", notifError);
      return { success: false, error: notifError.message };
    }

    // 2. Record audit log
    await logAuditEvent(admin.user.id, "admin_warn_user", "profile", targetUserId, {
      reason: trimmedReason,
      details: details?.trim() || null,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to warn user.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized action to mute or unmute a user from posting in Global Chat.
 */
export async function adminMuteChatUser(
  targetUserId: string,
  mute: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const trimmedReason = reason?.trim() || (mute ? "Muted by administrator." : null);

    const updatePayload: Record<string, unknown> = {
      is_muted: mute,
      mute_reason: mute ? trimmedReason : null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", targetUserId)
      .select("id, is_muted, mute_reason");

    if (updateError) {
      console.error("Error muting/unmuting user:", updateError);
      return { success: false, error: updateError.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error("Mute/unmute update affected 0 rows — likely blocked by RLS.");
      return { success: false, error: "Failed to update user profile. Check admin permissions." };
    }

    // Sync into user_moderation_scopes
    await supabase.from("user_moderation_scopes").upsert(
      {
        user_id: targetUserId,
        scope: "global_chat",
        status: mute ? "muted" : "active",
        reason: mute ? trimmedReason : null,
        created_by: admin.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,scope" }
    );

    // Notify target user if muted
    if (mute) {
      await supabase.from("notifications").insert({
        title: "Chat Privileges Suspended",
        message: `Your chat posting privileges have been suspended. Reason: ${reason || "Community Guidelines violation"}.`,
        type: "error",
        target_type: "user",
        target_user_id: targetUserId,
        created_by: admin.user.id,
      });
    }

    // Audit log
    await logAuditEvent(admin.user.id, mute ? "admin_mute_user" : "admin_unmute_user", "profile", targetUserId, {
      reason: trimmedReason,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update mute status.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized action to ban or unban a user.
 */
export async function adminBanChatUser(
  targetUserId: string,
  ban: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const trimmedReason = reason?.trim() || (ban ? "Banned by administrator." : null);

    const updatePayload: Record<string, unknown> = {
      is_banned: ban,
      ban_reason: ban ? trimmedReason : null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", targetUserId)
      .select("id, is_banned, ban_reason");

    if (updateError) {
      console.error("Error banning/unbanning user:", updateError);
      return { success: false, error: updateError.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error("Ban/unban update affected 0 rows — likely blocked by RLS.");
      return { success: false, error: "Failed to update user profile. Check admin permissions." };
    }

    // Sync into user_moderation_scopes
    await supabase.from("user_moderation_scopes").upsert(
      {
        user_id: targetUserId,
        scope: "global_chat",
        status: ban ? "banned" : "active",
        reason: ban ? trimmedReason : null,
        created_by: admin.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,scope" }
    );

    // Audit log
    await logAuditEvent(admin.user.id, ban ? "admin_ban_user" : "admin_unban_user", "profile", targetUserId, {
      reason: trimmedReason,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update ban status.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized action to toggle chat-wide status (pause / resume Global Chat).
 */
export async function adminToggleGlobalChat(
  enabled: boolean,
  disabledReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const payload = {
      enabled,
      disabled_reason: enabled ? null : disabledReason?.trim() || "Global Chat has been temporarily paused by administrators.",
      updated_at: new Date().toISOString(),
      updated_by: admin.user.id,
    };

    const { error: upsertError } = await supabase
      .from("system_settings")
      .upsert({ key: "global_chat", value: payload }, { onConflict: "key" });

    if (upsertError) {
      console.error("Error updating global chat system settings:", upsertError);
      return { success: false, error: upsertError.message };
    }

    // Record audit log
    await logAuditEvent(
      admin.user.id,
      enabled ? "admin_enable_global_chat" : "admin_disable_global_chat",
      "system_setting",
      "global_chat",
      { disabled_reason: payload.disabled_reason }
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle chat status.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized action to clear/purge active Global Chat messages.
 */
export async function adminPurgeGlobalChatMessages(): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("chat_messages")
      .update({ deleted_at: new Date().toISOString() })
      .is("deleted_at", null);

    if (error) {
      console.error("Error purging global chat messages:", error);
      return { success: false, error: error.message };
    }

    // Record audit log
    await logAuditEvent(admin.user.id, "admin_purge_chat_messages", "chat_messages", "all");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to purge messages.";
    return { success: false, error: msg };
  }
}

/**
 * Server-authorized query for user moderation summary and history.
 */
export async function adminGetUserModerationSummary(
  targetUserId: string
): Promise<{ success: boolean; data?: AdminUserModerationSummary; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();

    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, is_admin, is_muted, is_banned, mute_reason, ban_reason, created_at")
      .eq("id", targetUserId)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "User profile not found." };
    }

    // 2. Fetch counts and history in parallel
    const [messagesCountResult, reportsCountResult, auditLogsResult] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", targetUserId)
        .is("deleted_at", null),
      supabase
        .from("chat_reports")
        .select("id", { count: "exact", head: true })
        .eq("reported_message.sender_id", targetUserId),
      supabase
        .from("audit_logs")
        .select("id, action, created_at, metadata")
        .eq("target_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      success: true,
      data: {
        userId: targetUserId,
        profile: {
          ...profile,
          is_muted: profile.is_muted ?? false,
          is_banned: profile.is_banned ?? false,
          mute_reason: profile.mute_reason ?? null,
          ban_reason: profile.ban_reason ?? null,
        },
        messagesCount: messagesCountResult.count || 0,
        reportsCount: reportsCountResult.count || 0,
        auditEvents: (auditLogsResult.data || []) as AdminUserModerationSummary["auditEvents"],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch moderation summary.";
    return { success: false, error: msg };
  }
}
