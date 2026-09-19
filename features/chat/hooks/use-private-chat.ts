"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrivateChatService } from "../services/private-chat.service";
import { PrivateMessage, DirectUser } from "../types/private-chat.types";
import { useAuth } from "@/features/auth/components/auth-provider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { isModerationError } from "../utils/moderation";

function formatErrorDetails(err: unknown) {
  let message = "An unexpected error occurred.";
  let code: string | undefined = undefined;
  let details: string | undefined = undefined;
  let hint: string | undefined = undefined;

  if (err instanceof Error) {
    message = err.message || message;
    code = (err as any).code;
    details = (err as any).details;
    hint = (err as any).hint;
  } else if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message.trim()) {
      message = e.message;
    } else if (typeof e.error === "string" && e.error.trim()) {
      message = e.error;
    }
    if (typeof e.code === "string") code = e.code;
    if (typeof e.details === "string") details = e.details;
    if (typeof e.hint === "string") hint = e.hint;
  } else if (typeof err === "string" && err.trim()) {
    message = err;
  } else if (err !== null && err !== undefined) {
    message = String(err);
  }

  const result: Record<string, string> = { message };
  if (code) result.code = code;
  if (details) result.details = details;
  if (hint) result.hint = hint;

  return result;
}

export function usePrivateChat(otherUserId: string) {
  const { user, profile } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<DirectUser | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "accepted" | "pending" | "none" | "blocked"
  >("none");
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [unreadCountBelow, setUnreadCountBelow] = useState(0);

  const isNearBottomRef = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const globalPresenceChannelRef = useRef<RealtimeChannel | null>(null);
  const messagesRef = useRef<PrivateMessage[]>([]);
  const otherUserRef = useRef<DirectUser | null>(null);
  const profileRef = useRef(profile);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    otherUserRef.current = otherUser;
  }, [otherUser]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // 1. Initialize conversation & initial message batch
  const initConversation = useCallback(async () => {
    if (!user || !otherUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      const convData = await PrivateChatService.getOrCreateConversation(
        otherUserId
      );

      setConversationId(convData.conversation_id || null);
      setOtherUser(convData.other_user);
      setFriendshipStatus(
        (convData.friendship_status as "accepted" | "pending" | "none") ||
          "none"
      );

      if (convData.conversation_id) {
        const result = await PrivateChatService.getMessages(
          convData.conversation_id,
          30
        );

        setMessages(result.messages);
        setHasMore(result.hasMore);

        await PrivateChatService.markAsRead(convData.conversation_id);
      } else {
        setMessages([]);
        setHasMore(false);
      }
    } catch (err: unknown) {
      const details = formatErrorDetails(err);
      if (!isModerationError(err)) {
        console.error("[usePrivateChat] Init error:", details.message, details);
      }
      setError(details.message || "Failed to initialize conversation.");
    } finally {
      setIsLoading(false);
    }
  }, [user, otherUserId]);

  useEffect(() => {
    if (!user || !otherUserId) return;
    initConversation();
  }, [user, otherUserId, initConversation]);

  // 2. Cursor pagination for loading older history
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || !conversationId || messages.length === 0)
      return;

    setIsLoadingOlder(true);
    try {
      const oldest = messages[0];
      const result = await PrivateChatService.getMessages(
        conversationId,
        30,
        oldest.created_at
      );

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newUnique = result.messages.filter((m) => !existingIds.has(m.id));
        return [...newUnique, ...prev];
      });

      setHasMore(result.hasMore);
    } catch (err: unknown) {
      const details = formatErrorDetails(err);
      if (!isModerationError(err)) {
        console.error("[usePrivateChat] Load older messages error:", details);
      }
      toast.error("Could not load older messages.");
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMore, conversationId, messages]);

  // 3. Send Message
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (
        isSending ||
        !content.trim() ||
        !conversationId ||
        !otherUser ||
        friendshipStatus !== "accepted"
      ) {
        return false;
      }

      setIsSending(true);
      try {
        const newMessage = await PrivateChatService.sendMessage(
          conversationId,
          otherUser.id,
          content
        );

        dispatchInteractionSound("social.messageSent");

        // Immediate append if not received via realtime yet
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        setUnreadCountBelow(0);
        return true;
      } catch (err: unknown) {
        const details = formatErrorDetails(err);
        if (!isModerationError(err)) {
          console.error("[usePrivateChat] Send message error:", details);
        }
        toast.error(details.message || "Failed to send message.");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isSending, conversationId, otherUser, friendshipStatus]
  );

  // 4. Delete Own Message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await PrivateChatService.deleteOwnMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch (err: unknown) {
      const details = formatErrorDetails(err);
      if (!isModerationError(err)) {
        console.error("[usePrivateChat] Delete message error:", details);
      }
      toast.error(details.message || "Failed to delete message.");
    }
  }, []);

  // 5. Supabase Realtime Subscription Scoped to Current Conversation
  useEffect(() => {
    if (!user?.id || !conversationId) return;

    const supabase = createClient();

    // Clean up any stale local channel reference before registering a new one
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clean up any stale DM channels from this client instance
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) =>
        c.topic.startsWith(`realtime:dm_${conversationId}_${user.id}`)
      );
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Unique per-instance channel topic prevents collision with already-subscribed channels
    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `dm_${conversationId}_${user.id}_${instanceId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    // A. Listen for new messages inserted in this conversation
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "private_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload: { new: Record<string, unknown> }) => {
        const rawNew = payload.new as unknown as PrivateMessage;

        // Skip deleted or duplicate
        if (
          !rawNew ||
          rawNew.deleted_at ||
          messagesRef.current.some((m) => m.id === rawNew.id)
        ) {
          return;
        }

        // Hydrate sender using stable references
        let sender: DirectUser | null = null;
        if (rawNew.sender_id === user.id) {
          sender = {
            id: user.id,
            full_name: profileRef.current?.full_name || "You",
            avatar_url: profileRef.current?.avatar_url || null,
          };
        } else if (
          otherUserRef.current &&
          rawNew.sender_id === otherUserRef.current.id
        ) {
          sender = otherUserRef.current;
        }

        const messageWithSender: PrivateMessage = {
          ...rawNew,
          sender,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === rawNew.id)) return prev;
          if (rawNew.sender_id !== user.id) {
            dispatchInteractionSound("social.messageReceived");
          }
          return [...prev, messageWithSender];
        });

        // Auto mark read if user is viewing near bottom
        if (isNearBottomRef.current && rawNew.sender_id !== user.id) {
          await PrivateChatService.markAsRead(conversationId);
        } else if (rawNew.sender_id !== user.id) {
          setUnreadCountBelow((prev) => prev + 1);
        }
      }
    );

    // B. Listen for message soft-deletions / updates
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "private_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        const updated = payload.new as unknown as PrivateMessage;
        if (!updated) return;

        if (updated.deleted_at) {
          setMessages((prev) => prev.filter((m) => m.id !== updated.id));
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      }
    );

    // C. Listen for message hard-deletes
    channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "private_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: { old: Record<string, unknown> }) => {
        const deletedId = (payload.old as { id?: string })?.id;
        if (deletedId) {
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      }
    );

    // D. In-conversation presence
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const onlineIds = new Set<string>();
      Object.values(state).forEach((presences: unknown) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: unknown) => {
            const pres = p as { user_id?: string };
            if (pres?.user_id) onlineIds.add(pres.user_id);
          });
        }
      });

      if (otherUserId) {
        setIsOtherUserOnline(onlineIds.has(otherUserId));
      }
    });

    // Register all callbacks before subscribe()
    channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
          online_at: Date.now(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id, conversationId, otherUserId]);

  // 6. Global friends presence fallback if other user is online outside this specific chat
  useEffect(() => {
    if (!user?.id || !otherUserId) return;

    const supabase = createClient();

    if (globalPresenceChannelRef.current) {
      globalPresenceChannelRef.current.unsubscribe();
      supabase.removeChannel(globalPresenceChannelRef.current);
      globalPresenceChannelRef.current = null;
    }

    // Clean up any existing active/joined channels for jee_global_chat before adding presence listeners
    const stalePresence = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic === "realtime:jee_global_chat");
    stalePresence.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Shared global presence channel where active students broadcast presence
    const presenceChannel = supabase.channel("jee_global_chat");
    globalPresenceChannelRef.current = presenceChannel;

    presenceChannel.on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      const onlineIds = new Set<string>();
      Object.values(state).forEach((presences: unknown) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: unknown) => {
            const pres = p as { user_id?: string };
            if (pres?.user_id) onlineIds.add(pres.user_id);
          });
        }
      });

      setIsOtherUserOnline((prev) => prev || onlineIds.has(otherUserId));
    });

    presenceChannel.subscribe();

    return () => {
      presenceChannel.unsubscribe();
      supabase.removeChannel(presenceChannel);
      globalPresenceChannelRef.current = null;
    };
  }, [user?.id, otherUserId]);

  const setNearBottom = useCallback(
    (isNear: boolean) => {
      isNearBottomRef.current = isNear;
      if (isNear && conversationId) {
        setUnreadCountBelow(0);
        PrivateChatService.markAsRead(conversationId);
      }
    },
    [conversationId]
  );

  return {
    conversationId,
    otherUser,
    friendshipStatus,
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    isSending,
    error,
    isOtherUserOnline,
    unreadCountBelow,
    sendMessage,
    deleteMessage,
    loadOlderMessages,
    setNearBottom,
    retry: initConversation,
    currentUserId: user?.id,
  };
}
