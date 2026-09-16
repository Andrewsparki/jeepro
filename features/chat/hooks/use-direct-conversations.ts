"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrivateChatService } from "../services/private-chat.service";
import { ConversationItem } from "../types/private-chat.types";
import { useAuth } from "@/features/auth/components/auth-provider";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useDirectConversations(enabled: boolean = true) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!enabled) return;
    if (!silent) setIsLoading(true);
    try {
      const list = await PrivateChatService.getConversations();
      setConversations(list);
      setError(null);
    } catch (err: unknown) {
      console.error("[useDirectConversations] Error loading conversations:", err);
      setError("Failed to load direct messages.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [enabled]);

  // Stable ref for loadConversations to prevent effect re-runs
  const loadConversationsRef = useRef(loadConversations);
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  useEffect(() => {
    if (!enabled || !user) return;
    let ignore = false;

    async function init() {
      try {
        const list = await PrivateChatService.getConversations();
        if (!ignore) {
          setConversations(list);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("[useDirectConversations] Init error:", err);
          setError("Failed to load direct messages.");
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
  }, [enabled, user]);

  // Realtime listener for message events to keep unread badges updated
  useEffect(() => {
    if (!enabled || !user?.id) return;

    const supabase = createClient();

    // Clean up any existing local channel reference before registering a new one
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clean up any existing stale inbox channels from this client instance
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic.startsWith(`realtime:inbox_conversations_${user.id}`));
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Unique per-instance channel topic prevents collision with already-subscribed channels
    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `inbox_conversations_${user.id}_${instanceId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Register event callback strictly before subscribe()
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "private_messages",
      },
      () => {
        loadConversationsRef.current(true);
      }
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, user?.id]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  }, [conversations]);

  return {
    conversations,
    totalUnreadCount,
    isLoading,
    error,
    refresh: () => loadConversations(false),
  };
}
