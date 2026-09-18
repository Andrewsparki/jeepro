import { createClient } from "@/lib/supabase/client";
import { ChatMessage, ChatReportInput, ChatSystemStatus, ChatSender } from "../types/chat.types";

export class GlobalChatService {
  /**
   * Fetch recent messages chronologically (limit default 40).
   * Supports cursor pagination via beforeCreatedAt.
   */
  static async getMessages(limit = 40, beforeCreatedAt?: string): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const supabase = createClient();

    let query = supabase
      .from("chat_messages")
      .select(`
        id,
        sender_id,
        content,
        created_at,
        updated_at,
        deleted_at,
        sender:profiles!chat_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      query = query.lt("created_at", beforeCreatedAt);
    }

    const { data, error } = await query;

    if (error) {
      // If the explicit foreign key relation fails due to schema cache, fall back to basic select + profiles hydration
      console.warn("Foreign key join fallback:", error.message);
      return this.getMessagesFallback(limit, beforeCreatedAt);
    }

    const rows = (data || []) as unknown as Array<ChatMessage & { sender: ChatSender | null }>;
    const hasMore = rows.length > limit;
    const paginated = hasMore ? rows.slice(0, limit) : rows;

    // Return in chronological order (oldest -> newest) for intuitive chat stream
    return {
      messages: paginated.reverse(),
      hasMore,
    };
  }

  /**
   * Resilient fallback query that fetches messages and hydrates sender profiles separately if relational joins fail
   */
  private static async getMessagesFallback(limit: number, beforeCreatedAt?: string): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const supabase = createClient();

    let query = supabase
      .from("chat_messages")
      .select("id, sender_id, content, created_at, updated_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      query = query.lt("created_at", beforeCreatedAt);
    }

    const { data: rawMessages, error: msgError } = await query;
    if (msgError) throw msgError;

    const rows = (rawMessages || []) as ChatMessage[];
    const hasMore = rows.length > limit;
    const paginated = hasMore ? rows.slice(0, limit) : rows;

    // Hydrate profiles
    const senderIds = Array.from(new Set(paginated.map((m) => m.sender_id)));
    let senderMap = new Map<string, ChatSender>();

    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      if (profiles) {
        senderMap = new Map((profiles as ChatSender[]).map((p: ChatSender) => [p.id, p]));
      }
    }

    const hydrated = paginated.map((m) => ({
      ...m,
      sender: senderMap.get(m.sender_id) || null,
    }));

    return {
      messages: hydrated.reverse(),
      hasMore,
    };
  }

  /**
   * Post a new message to Global Chat.
   * Sender identity is strictly derived from the authenticated session.
   */
  static async sendMessage(content: string): Promise<ChatMessage> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Message content cannot be empty.");
    }
    if (trimmed.length > 1000) {
      throw new Error("Message exceeds the maximum length of 1,000 characters.");
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("You must be signed in to post in Global Chat.");
    }

    // Fetch sender profile to check mute/ban status server-side
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, is_muted, is_banned, mute_reason, ban_reason")
      .eq("id", user.id)
      .single();

    if (profileFetchError) {
      throw new Error("Failed to verify user profile.");
    }

    if (profile?.is_banned) {
      throw new Error(
        `Your account has been restricted from Global Chat. Reason: ${
          profile.ban_reason || "Community guidelines violation"
        }`
      );
    }

    if (profile?.is_muted) {
      throw new Error(
        `You are currently muted from posting in Global Chat. Reason: ${
          profile.mute_reason || "Community guidelines violation"
        }`
      );
    }

    // Insert message into chat_messages
    const { data: inserted, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: user.id,
        content: trimmed,
      })
      .select("id, sender_id, content, created_at, updated_at, deleted_at")
      .single();

    if (insertError) {
      // RLS policy violation when user is muted or banned
      if (insertError.code === '42501' || insertError.message?.includes('row-level security')) {
        throw new Error(
          'You are currently restricted from posting in Global Chat. ' +
          'Please contact support if you believe this is an error.'
        );
      }
      throw insertError;
    }

    return {
      ...(inserted as ChatMessage),
      sender: (profile as ChatSender) || {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    };
  }

  /**
   * Soft-delete a user's own message (or admin removal).
   */
  static async deleteOwnMessage(messageId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required.");

    const { error } = await supabase
      .from("chat_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) throw error;
  }

  /**
   * File a moderation report for inappropriate content.
   */
  static async reportMessage(input: ChatReportInput): Promise<void> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required to submit reports.");

    const { data: inserted, error } = await supabase
      .from("chat_reports")
      .insert({
        message_id: input.message_id,
        reporter_id: user.id,
        reason: input.reason,
        details: input.details?.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      // 23505 is PostgreSQL unique constraint violation
      if (error.code === "23505") {
        throw new Error("You have already reported this message.");
      }
      throw error;
    }

    // Best-effort admin notification for prompt moderation visibility
    try {
      await supabase.from("notifications").insert({
        title: `Chat Report: ${input.reason}`,
        message: `A message was reported for "${input.reason}".`,
        type: "warning",
        target_type: "all",
        metadata: {
          report_id: inserted?.id,
          message_id: input.message_id,
          reason: input.reason,
        },
        created_by: user.id,
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Check whether Global Chat is currently enabled by administrators.
   */
  static async getChatStatus(): Promise<ChatSystemStatus> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "global_chat")
        .single();

      if (data && typeof data.value === "object" && data.value !== null) {
        const val = data.value as Record<string, unknown>;
        return {
          enabled: val.enabled !== false,
          disabled_reason: (val.disabled_reason as string) || null,
        };
      }
    } catch {
      // Defaults to enabled if settings row not found
    }
    return { enabled: true, disabled_reason: null };
  }

  /**
   * Helper to fetch profile for a specific sender ID (for incoming realtime messages)
   */
  static async getSenderProfile(senderId: string): Promise<ChatSender | null> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", senderId)
        .single();
      return (data as ChatSender) || null;
    } catch {
      return null;
    }
  }
}
