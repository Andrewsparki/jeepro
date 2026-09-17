"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { GroupsService } from "../services/groups.service";
import { GroupMessage } from "../types/groups.types";
import { useAuth } from "@/features/auth/components/auth-provider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

export function useGroupChat(groupId: string) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesRef = useRef<GroupMessage[]>([]);
  const profileRef = useRef(profile);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // 1. Initial message batch load
  const loadInitialMessages = useCallback(async () => {
    if (!user || !groupId) {
      setIsLoading(false);
      return;
    }
    try {
      const result = await GroupsService.getMessages(groupId, 30);
      setMessages(result.messages);
      setHasMore(result.hasMore);
    } catch (err: unknown) {
      console.error("[useGroupChat] Load messages error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load messages.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, groupId]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!user || !groupId) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await GroupsService.getMessages(groupId, 30);
        if (!ignore) {
          setMessages(result.messages);
          setHasMore(result.hasMore);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("[useGroupChat] Load messages error:", err);
          const msg = err instanceof Error ? err.message : "Failed to load messages.";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, [user, groupId]);

  // 2. Cursor pagination for loading older history
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || !groupId || messages.length === 0) return;

    setIsLoadingOlder(true);
    try {
      const oldest = messages[0];
      const result = await GroupsService.getMessages(groupId, 30, oldest.created_at);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newUnique = result.messages.filter((m) => !existingIds.has(m.id));
        return [...newUnique, ...prev];
      });

      setHasMore(result.hasMore);
    } catch (err: unknown) {
      console.error("[useGroupChat] Load older error:", err);
      toast.error("Could not load older messages.");
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMore, groupId, messages]);

  // 3. Send Message
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (isSending || !content.trim() || !groupId) return false;

      setIsSending(true);
      try {
        const newMessage = await GroupsService.sendMessage(groupId, content);

        // Immediate append if not received via realtime yet
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        return true;
      } catch (err: unknown) {
        console.error("[useGroupChat] Send error:", err);
        const msg = err instanceof Error ? err.message : "Failed to send message.";
        toast.error(msg);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isSending, groupId]
  );

  // 4. Delete Message
  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      try {
        await GroupsService.deleteMessage(messageId);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        toast.success("Message deleted");
        return true;
      } catch (err: unknown) {
        console.error("[useGroupChat] Delete error:", err);
        const msg = err instanceof Error ? err.message : "Failed to delete message.";
        toast.error(msg);
        return false;
      }
    },
    []
  );

  // 5. Realtime Channel Subscription (one channel per group conversation)
  useEffect(() => {
    if (!user || !groupId) return;

    const supabase = createClient();

    // Cleanup previous active channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clean up any stale group channels for this client instance
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) =>
        c.topic.startsWith(`realtime:group_${groupId}_${user.id}`)
      );
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `group_${groupId}_${user.id}_${instanceId}`;
    const channel = supabase.channel(channelName);

    channelRef.current = channel;

    // A. Listen for new messages inserted into this group
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      },
      async (payload: { new: Record<string, unknown> }) => {
        const rawNew = payload.new as unknown as GroupMessage;

        // Skip deleted or duplicate
        if (
          !rawNew ||
          rawNew.deleted_at ||
          messagesRef.current.some((m) => m.id === rawNew.id)
        ) {
          return;
        }

        // Hydrate sender details
        let sender: GroupMessage["sender"] = null;
        if (rawNew.sender_id === user.id) {
          sender = {
            id: user.id,
            full_name: profileRef.current?.full_name || "You",
            avatar_url: profileRef.current?.avatar_url || null,
          };
        } else {
          // Fetch sender profile if not current user
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", rawNew.sender_id)
            .single();

          if (senderProfile) {
            sender = senderProfile;
          }
        }

        const messageWithSender: GroupMessage = {
          ...rawNew,
          sender,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === rawNew.id)) return prev;
          return [...prev, messageWithSender];
        });
      }
    );

    // B. Listen for message soft-deletions/updates
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        const updated = payload.new as unknown as GroupMessage;
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

    channel.subscribe();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, groupId]);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    isSending,
    error,
    sendMessage,
    deleteMessage,
    loadOlderMessages,
    refresh: loadInitialMessages,
  };
}
