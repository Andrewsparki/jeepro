"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlobalChatService } from "../services/chat.service";
import { ChatMessage, ChatPresenceUser, ChatSystemStatus, ChatSender } from "../types/chat.types";
import { useAuth } from "@/features/auth/components/auth-provider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { adminDeleteChatMessage } from "@/features/admin/services/admin-chat-actions";

export function useGlobalChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<ChatSystemStatus>({ enabled: true, disabled_reason: null });
  const [onlineUsers, setOnlineUsers] = useState<ChatPresenceUser[]>([]);
  const [unreadCountBelow, setUnreadCountBelow] = useState(0);

  // Profile cache to avoid redundant profile fetches during rapid realtime messaging
  const profileCache = useRef<Map<string, ChatSender>>(new Map());
  const isNearBottomRef = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep ref to messages to avoid stale closures in realtime handlers
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 1. Initial message loading & system status
  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [status, result] = await Promise.all([
        GlobalChatService.getChatStatus(),
        GlobalChatService.getMessages(40),
      ]);

      setChatStatus(status);
      setMessages(result.messages);
      setHasMore(result.hasMore);

      // Cache senders
      result.messages.forEach((m) => {
        if (m.sender) {
          profileCache.current.set(m.sender_id, m.sender);
        }
      });
    } catch (err: unknown) {
      console.error("Failed to load global chat:", err);
      const msg = err instanceof Error ? err.message : "Failed to load messages. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [status, result] = await Promise.all([
          GlobalChatService.getChatStatus(),
          GlobalChatService.getMessages(40),
        ]);
        if (!ignore) {
          setChatStatus(status);
          setMessages(result.messages);
          setHasMore(result.hasMore);
          result.messages.forEach((m) => {
            if (m.sender) profileCache.current.set(m.sender_id, m.sender);
          });
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Failed to load global chat:", err);
          const msg = err instanceof Error ? err.message : "Failed to load messages. Please try again.";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Cursor pagination for loading older history
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || messages.length === 0) return;

    setIsLoadingOlder(true);
    try {
      const oldest = messages[0];
      const result = await GlobalChatService.getMessages(30, oldest.created_at);

      // Cache senders
      result.messages.forEach((m) => {
        if (m.sender) {
          profileCache.current.set(m.sender_id, m.sender);
        }
      });

      setMessages((prev) => {
        // De-duplicate by ID
        const existingIds = new Set(prev.map((m) => m.id));
        const newUnique = result.messages.filter((m) => !existingIds.has(m.id));
        return [...newUnique, ...prev];
      });

      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load older messages:", err);
      toast.error("Could not load older messages.");
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMore, messages]);

  // 3. Send Message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (isSending || !content.trim() || !chatStatus.enabled) return false;

    setIsSending(true);
    try {
      const newMessage = await GlobalChatService.sendMessage(content);
      dispatchInteractionSound("social.messageSent");

      // Append immediately if not received through realtime yet
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      setUnreadCountBelow(0);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message.";
      const isModerationError =
        msg.includes("muted") ||
        msg.includes("restricted") ||
        msg.includes("banned") ||
        msg.includes("Community guidelines");

      if (!isModerationError) {
        console.error("Failed to send message:", err);
      }
      toast.error(msg);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [isSending, chatStatus.enabled]);

  // 4. Delete Message (User's own or Admin moderation)
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      if (profile?.is_admin) {
        const res = await adminDeleteChatMessage(messageId);
        if (!res.success) throw new Error(res.error || "Failed to delete message.");
      } else {
        await GlobalChatService.deleteOwnMessage(messageId);
      }
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete message.";
      toast.error(msg);
    }
  }, [profile?.is_admin]);

  // 5. Report Message
  const reportMessage = useCallback(async (messageId: string, reason: string, details?: string) => {
    try {
      await GlobalChatService.reportMessage({ message_id: messageId, reason, details });
      toast.success("Message reported. Thank you for helping keep JEE Pro safe.");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to report message.";
      toast.error(msg);
      return false;
    }
  }, []);

  // 6. Supabase Realtime Subscription + Presence
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // Clean up any existing local channel reference before registering a new one
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clean up any existing stale global chat channels from this client instance to prevent callback errors
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic === "realtime:jee_global_chat");
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Single unified channel for postgres changes and presence
    const channel = supabase.channel("jee_global_chat", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    // A. Listen for new messages inserted
    channel.on(
      "postgres_changes" as unknown as "broadcast",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      },
      async (payload: { new: Record<string, unknown> }) => {
        const rawNew = payload.new as unknown as ChatMessage;

        // Skip if already soft-deleted or already present in state
        if (rawNew.deleted_at || messagesRef.current.some((m) => m.id === rawNew.id)) {
          return;
        }

        // Hydrate sender
        let sender = profileCache.current.get(rawNew.sender_id) || null;
        if (!sender) {
          if (rawNew.sender_id === user.id && profile) {
            sender = {
              id: user.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            };
          } else {
            sender = await GlobalChatService.getSenderProfile(rawNew.sender_id);
          }
          if (sender) {
            profileCache.current.set(rawNew.sender_id, sender);
          }
        }

        const messageWithSender: ChatMessage = {
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

        // If user is scrolled away from bottom and message isn't their own, increment unread badge
        if (!isNearBottomRef.current && rawNew.sender_id !== user.id) {
          setUnreadCountBelow((prev) => prev + 1);
        }
      }
    );

    // B. Listen for message updates (e.g. soft-deletion)
    channel.on(
      "postgres_changes" as unknown as "broadcast",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_messages",
      },
      (payload: { new: Record<string, unknown> }) => {
        const updated = payload.new as unknown as ChatMessage;
        if (updated.deleted_at) {
          // Message was soft-deleted — remove from view
          setMessages((prev) => prev.filter((m) => m.id !== updated.id));
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      }
    );

    // C. Listen for message hard deletes
    channel.on(
      "postgres_changes" as unknown as "broadcast",
      {
        event: "DELETE",
        schema: "public",
        table: "chat_messages",
      },
      (payload: { old: Record<string, unknown> }) => {
        const deletedId = payload.old?.id as string | undefined;
        if (deletedId) {
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      }
    );

    // D. Supabase Presence Tracking
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const active: ChatPresenceUser[] = [];

      Object.values(state).forEach((presences: unknown) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: unknown) => {
            const pres = p as ChatPresenceUser;
            if (pres?.user_id && !active.some((u) => u.user_id === pres.user_id)) {
              active.push(pres);
            }
          });
        }
      });

      setOnlineUsers(active);
    });

    // Subscribe and track current student presence
    channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
          full_name: profile?.full_name || user.email?.split("@")[0] || "Student",
          avatar_url: profile?.avatar_url || null,
          online_at: Date.now(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, profile]);

  const setNearBottom = useCallback((isNear: boolean) => {
    isNearBottomRef.current = isNear;
    if (isNear) {
      setUnreadCountBelow(0);
    }
  }, []);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    isSending,
    error,
    chatStatus,
    onlineUsers,
    onlineCount: Math.max(1, onlineUsers.length),
    unreadCountBelow,
    sendMessage,
    deleteMessage,
    reportMessage,
    loadOlderMessages,
    refreshMessages: loadInitialMessages,
    setNearBottom,
    currentUserId: user?.id,
    isAdmin: profile?.is_admin === true,
    isMuted: profile?.is_muted === true,
    isBanned: profile?.is_banned === true,
    muteReason: profile?.mute_reason || null,
    banReason: profile?.ban_reason || null,
  };
}
