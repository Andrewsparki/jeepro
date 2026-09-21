import { createClient } from "@/lib/supabase/client";
import {
  PrivateMessage,
  ConversationItem,
  GetOrCreateConversationResult,
  DirectUser,
} from "../types/private-chat.types";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { isModerationError } from "../utils/moderation";

export class PrivateChatService {
  /**
   * Initialize or retrieve an existing 1-to-1 conversation with an accepted friend.
   * Race-condition safe with PostgreSQL RPC and symmetric table indexes.
   */
  static async getOrCreateConversation(
    otherUserId: string
  ): Promise<GetOrCreateConversationResult> {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("You must be signed in to access private conversations.");
    }

    if (user.id === otherUserId) {
      throw new Error("You cannot open a private chat with yourself.");
    }

    // Check direct_messages moderation status
    const { data: modScope } = await supabase
      .from("user_moderation_scopes")
      .select("status, reason, expires_at")
      .eq("user_id", user.id)
      .eq("scope", "direct_messages")
      .maybeSingle();

    if (modScope && modScope.status !== "active") {
      const isExpired = modScope.expires_at && new Date(modScope.expires_at) <= new Date();
      if (!isExpired) {
        throw new Error(
          modScope.reason
            ? `Direct Messaging Restricted: ${modScope.reason}`
            : "Your direct messaging access has been restricted by an administrator."
        );
      }
    }

    // 1. Primary path: Call the secure server-side RPC function
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      p_other_user_id: otherUserId,
    });

    if (!error && data) {
      return data as GetOrCreateConversationResult;
    }

    // Handle non-accepted friendship status gracefully without throwing an unhandled exception
    if (error && error.message?.includes("Direct messaging requires an accepted friendship")) {
      const { data: friendship } = await supabase
        .from("friendships")
        .select("status")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`
        )
        .maybeSingle();

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, target_exam, target_year")
        .eq("id", otherUserId)
        .maybeSingle();

      const friendshipStatus =
        typeof friendship?.status === "string" ? friendship.status : "none";

      return {
        conversation_id: "",
        created_at: new Date().toISOString(),
        other_user: (otherProfile as DirectUser) || {
          id: otherUserId,
          full_name: "Student",
          avatar_url: null,
        },
        friendship_status: friendshipStatus,
      };
    }

    // If the RPC returned a real database or authorization error, throw it directly
    if (error && error.code !== "42883" && error.code !== "PGRST202") {
      if (!isModerationError(error)) {
        console.error("[PrivateChatService] RPC get_or_create_conversation error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }
      throw new Error(error.message || "Failed to access private conversation.");
    }

    // 2. Resilient fallback path if RPC is not yet registered in schema cache
    console.warn(
      "[PrivateChatService] RPC get_or_create_conversation unavailable, using client-side fallback:",
      error?.message
    );

    // Verify friendship exists and is accepted
    const { data: friendship, error: friendError } = await supabase
      .from("friendships")
      .select("id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (friendError) {
      if (!isModerationError(friendError)) {
        console.error("[PrivateChatService] Friendship verification error:", {
          message: friendError.message,
          code: friendError.code,
          details: friendError.details,
        });
      }
      throw new Error(friendError.message || "Failed to verify friendship status.");
    }

    if (!friendship || friendship.status !== "accepted") {
      throw new Error("Direct messaging requires an accepted friendship.");
    }

    // Fetch target user profile
    const { data: otherProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, target_exam, target_year")
      .eq("id", otherUserId)
      .single();

    if (profileErr || !otherProfile) {
      if (!isModerationError(profileErr)) {
        console.error("[PrivateChatService] Target profile fetch error:", profileErr);
      }
      throw new Error(profileErr?.message || "Target user profile was not found.");
    }

    // Canonical ordering: user1_id is always strictly less than user2_id
    const u1 = user.id < otherUserId ? user.id : otherUserId;
    const u2 = user.id < otherUserId ? otherUserId : user.id;

    // Check existing conversation
    const { data: existingConv, error: convLookupErr } = await supabase
      .from("conversations")
      .select("id, created_at")
      .eq("user1_id", u1)
      .eq("user2_id", u2)
      .maybeSingle();

    if (convLookupErr) {
      if (!isModerationError(convLookupErr)) {
        console.error("[PrivateChatService] Conversation lookup error:", convLookupErr);
      }
      throw new Error(convLookupErr.message || "Failed to query conversations.");
    }

    if (existingConv) {
      return {
        conversation_id: existingConv.id,
        created_at: existingConv.created_at,
        other_user: otherProfile as DirectUser,
        friendship_status: friendship.status,
      };
    }

    // Create conversation safely
    const { data: newConv, error: insertError } = await supabase
      .from("conversations")
      .insert({
        user1_id: u1,
        user2_id: u2,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      // Re-query in case of concurrent insert race
      const { data: raceConv } = await supabase
        .from("conversations")
        .select("id, created_at")
        .eq("user1_id", u1)
        .eq("user2_id", u2)
        .maybeSingle();

      if (raceConv) {
        return {
          conversation_id: raceConv.id,
          created_at: raceConv.created_at,
          other_user: otherProfile as DirectUser,
          friendship_status: friendship.status,
        };
      }

      if (!isModerationError(insertError)) {
        console.error("[PrivateChatService] Conversation creation error:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
        });
      }
      throw new Error(insertError.message || "Failed to create conversation.");
    }

    // Insert participants
    const { error: partErr } = await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: user.id },
      { conversation_id: newConv.id, user_id: otherUserId },
    ]);

    if (partErr) {
      console.warn("[PrivateChatService] Participants insert warning:", partErr.message);
    }

    return {
      conversation_id: newConv.id,
      created_at: newConv.created_at,
      other_user: otherProfile as DirectUser,
      friendship_status: friendship.status,
    };
  }

  /**
   * Fetch user's direct conversations with other participants, last message, and unread counts.
   */
  static async getConversations(): Promise<ConversationItem[]> {
    const supabase = createClient();

    // 1. Try PostgreSQL RPC
    const { data, error } = await supabase.rpc("get_user_conversations");
    if (!error && Array.isArray(data)) {
      return data as ConversationItem[];
    }

    if (error && error.code !== "42883" && error.code !== "PGRST202") {
      if (!isModerationError(error)) {
        console.error("[PrivateChatService] RPC get_user_conversations error:", error.message);
      }
    }

    // 2. Direct fallback
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: convs, error: convError } = await supabase
      .from("conversations")
      .select(`
        id,
        user1_id,
        user2_id,
        last_message_at,
        created_at
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (convError || !convs) return [];

    // Hydrate each conversation
    const items: ConversationItem[] = [];
    for (const c of convs) {
      const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;

      const [{ data: otherProfile }, { data: lastMsg }, { data: participant }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, avatar_url, target_exam, target_year")
            .eq("id", otherId)
            .single(),
          supabase
            .from("private_messages")
            .select("id, content, sender_id, created_at, deleted_at")
            .eq("conversation_id", c.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("conversation_participants")
            .select("last_read_at")
            .eq("conversation_id", c.id)
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      let unreadCount = 0;
      if (participant?.last_read_at) {
        const { count } = await supabase
          .from("private_messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .gt("created_at", participant.last_read_at)
          .neq("sender_id", user.id)
          .is("deleted_at", null);

        unreadCount = count || 0;
      }

      items.push({
        id: c.id,
        other_user: (otherProfile as DirectUser) || {
          id: otherId,
          full_name: "Student",
          avatar_url: null,
        },
        friendship_status: "accepted",
        last_message: lastMsg || null,
        last_message_at: c.last_message_at,
        created_at: c.created_at,
        unread_count: unreadCount,
      });
    }

    return items;
  }

  /**
   * Fetch bounded message history for a specific conversation using cursor pagination.
   */
  static async getMessages(
    conversationId: string,
    limit = 30,
    beforeCreatedAt?: string
  ): Promise<{ messages: PrivateMessage[]; hasMore: boolean }> {
    const supabase = createClient();

    let query = supabase
      .from("private_messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        updated_at,
        deleted_at,
        sender:profiles!private_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      query = query.lt("created_at", beforeCreatedAt);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback if relational foreign key join alias is unparsed
      return this.getMessagesFallback(conversationId, limit, beforeCreatedAt);
    }

    const rows = (data || []) as unknown as Array<
      PrivateMessage & { sender: DirectUser | null }
    >;
    const hasMore = rows.length > limit;
    const paginated = hasMore ? rows.slice(0, limit) : rows;

    return {
      messages: paginated.reverse(),
      hasMore,
    };
  }

  /**
   * Fallback message retrieval hydrating profiles in separate query
   */
  private static async getMessagesFallback(
    conversationId: string,
    limit: number,
    beforeCreatedAt?: string
  ): Promise<{ messages: PrivateMessage[]; hasMore: boolean }> {
    const supabase = createClient();

    let query = supabase
      .from("private_messages")
      .select("id, conversation_id, sender_id, content, created_at, updated_at, deleted_at")
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      query = query.lt("created_at", beforeCreatedAt);
    }

    const { data: rawMessages, error } = await query;
    if (error) {
      if (!isModerationError(error)) {
        console.error("[PrivateChatService] getMessages error:", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
      }
      throw new Error(error.message || "Failed to load messages.");
    }

    const rows = (rawMessages || []) as PrivateMessage[];
    const hasMore = rows.length > limit;
    const paginated = hasMore ? rows.slice(0, limit) : rows;

    // Hydrate senders
    const senderIds = Array.from(new Set(paginated.map((m) => m.sender_id)));
    let senderMap = new Map<string, DirectUser>();

    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      if (profiles) {
        senderMap = new Map((profiles as DirectUser[]).map((p) => [p.id, p]));
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
   * Post a new private message to the conversation.
   * Sender identity is strictly derived from the authenticated session.
   */
  static async sendMessage(
    conversationId: string,
    recipientId: string,
    content: string
  ): Promise<PrivateMessage> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Message content cannot be empty.");
    }
    if (trimmed.length > 1000) {
      throw new Error("Message exceeds the maximum length of 1,000 characters.");
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("You must be signed in to send private messages.");
    }

    // Check direct_messages moderation status
    const { data: modScope } = await supabase
      .from("user_moderation_scopes")
      .select("status, reason, expires_at")
      .eq("user_id", user.id)
      .eq("scope", "direct_messages")
      .maybeSingle();

    if (modScope && modScope.status !== "active") {
      const isExpired = modScope.expires_at && new Date(modScope.expires_at) <= new Date();
      if (!isExpired) {
        throw new Error(
          modScope.reason
            ? `Direct Messaging Restricted: ${modScope.reason}`
            : "Your direct messaging access has been restricted by an administrator."
        );
      }
    }

    // Insert message into private_messages (RLS verifies membership & accepted friendship)
    const { data: inserted, error: insertError } = await supabase
      .from("private_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmed,
      })
      .select("id, conversation_id, sender_id, content, created_at, updated_at, deleted_at")
      .single();

    if (insertError) {
      if (!isModerationError(insertError)) {
        console.error("[PrivateChatService] Message send error:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
        });
      }
      throw new Error(insertError.message || "Failed to send message.");
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Update caller's last_read_at
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    // Fetch caller profile for presentation & notification
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || "A friend";

    // Send recipient notification (deduplicated server-side within 15s)
    try {
      const preview =
        trimmed.length > 80 ? trimmed.substring(0, 77) + "..." : trimmed;

      await NotificationService.createNotification({
        userId: recipientId,
        type: "info",
        title: `💬 Message from ${senderName}`,
        message: preview,
        metadata: {
          type: "direct_message",
          conversation_id: conversationId,
          sender_id: user.id,
        },
      });
    } catch (notifErr) {
      console.warn("[PrivateChatService] Notification delivery skipped:", notifErr);
    }

    return {
      ...(inserted as PrivateMessage),
      sender: (profile as DirectUser) || {
        id: user.id,
        full_name: senderName,
        avatar_url: null,
      },
    };
  }

  /**
   * Soft-delete a user's own message.
   */
  static async deleteOwnMessage(messageId: string): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) throw new Error("Authentication required.");

    const { error } = await supabase
      .from("private_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", user.id);

    if (error) {
      if (!isModerationError(error)) {
        console.error("[PrivateChatService] Delete error:", error);
      }
      throw new Error(error.message || "Failed to delete message.");
    }
  }

  /**
   * Mark all messages in a conversation as read by the caller.
   */
  static async markAsRead(conversationId: string): Promise<void> {
    const supabase = createClient();
    try {
      // 1. Try RPC
      const { error } = await supabase.rpc("mark_conversation_read", {
        p_conversation_id: conversationId,
      });

      if (error) {
        // Fallback to direct participant update
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("conversation_participants")
            .update({ last_read_at: new Date().toISOString() })
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);
        }
      }
    } catch (err) {
      console.warn("[PrivateChatService] Error marking conversation read:", err);
    }
  }

  /**
   * Fetch current friendship status between the authenticated user and another user.
   */
  static async checkFriendship(
    otherUserId: string
  ): Promise<"accepted" | "pending" | "blocked" | "none"> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "none";

    const { data } = await supabase
      .from("friendships")
      .select("status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    return (data?.status as "accepted" | "pending" | "blocked") || "none";
  }
}
