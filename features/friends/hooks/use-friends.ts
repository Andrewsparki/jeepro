"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { FriendUser } from "../types/friends.types";
import { FriendsService } from "../services/friends.service";
import { useAuth } from "@/features/auth/components/auth-provider";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";
import { globalPresence } from "@/features/chat/services/presence-service";

export interface UseFriendsOptions {
  enabled?: boolean;
}

export function useFriends(options?: UseFriendsOptions) {
  const enabled = options?.enabled ?? true;
  const { user } = useAuth();
  const userId = user?.id;
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendUser[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Online status set of user IDs
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const friendshipsChannelRef = useRef<RealtimeChannel | null>(null);

  // 1. Fetch initial friends and pending requests
  const loadFriendships = useCallback(async (silent = false) => {
    if (!enabled) return;
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [friendsList, pending] = await Promise.all([
        FriendsService.getFriends(userId),
        FriendsService.getPendingRequests(userId),
      ]);

      setFriends(friendsList);
      setPendingReceived(pending.received);
      setPendingSent(pending.sent);
    } catch (err: unknown) {
      console.error("Failed to load friends:", err);
      const msg = err instanceof Error ? err.message : "Failed to load friends.";
      setError(msg);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled) return;
    loadFriendships();
  }, [enabled, loadFriendships]);

  // 2. Realtime listener on friendships table
  useEffect(() => {
    if (!enabled || !user) return;
    const supabase = createClient();

    // Clean up any existing local channel reference
    if (friendshipsChannelRef.current) {
      friendshipsChannelRef.current.unsubscribe();
      supabase.removeChannel(friendshipsChannelRef.current);
      friendshipsChannelRef.current = null;
    }

    // Clean up any existing stale friendship channels for this user
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic.startsWith(`realtime:user_friendships_${user.id}`));
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Unique per-instance channel topic prevents collision with already-subscribed channels
    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `user_friendships_${user.id}_${instanceId}`;
    const channel = supabase.channel(channelName);
    friendshipsChannelRef.current = channel;

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendships",
      },
      () => {
        // Silently reload friendships upon any change involving this user
        loadFriendships(true);
      }
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      friendshipsChannelRef.current = null;
    };
  }, [enabled, user, loadFriendships]);

  // 3. Shared presence tracker using globalPresence singleton
  useEffect(() => {
    if (!enabled || !user) return;
    const unsub = globalPresence.subscribe((presences) => {
      const onlineIds = new Set<string>();
      presences.forEach((p) => {
        if (p?.user_id) {
          onlineIds.add(p.user_id);
        }
      });
      setOnlineUserIds(onlineIds);
    });

    return () => {
      unsub();
    };
  }, [enabled, user]);

  // 4. Debounced user search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await FriendsService.searchUsers(trimmed, 20);
        if (!isCancelled) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // 5. Actions with immediate optimistic updates
  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    try {
      const sentItem = await FriendsService.sendFriendRequest(targetUserId);
      toast.success("Friend request sent!");

      // Update search results or pendingSent optimistically
      setPendingSent((prev) => [...prev, sentItem]);
      setSearchResults((prev) =>
        prev.map((u) =>
          u.id === targetUserId
            ? { ...u, friendshipStatus: "pending", isRequester: true, friendshipId: sentItem.friendshipId }
            : u
        )
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send friend request.";
      toast.error(msg);
      return false;
    }
  }, []);

  const acceptFriendRequest = useCallback(async (friendshipId: string, friendId: string) => {
    try {
      await FriendsService.acceptFriendRequest(friendshipId);
      toast.success("Friend request accepted!");

      // Optimistic update
      setPendingReceived((prev) => {
        const acceptedUser = prev.find((u) => u.id === friendId);
        if (acceptedUser) {
          setFriends((fPrev) => [...fPrev, { ...acceptedUser, friendshipStatus: "accepted" }]);
        }
        return prev.filter((u) => u.id !== friendId);
      });

      setSearchResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, friendshipStatus: "accepted" } : u))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept request.";
      toast.error(msg);
      return false;
    }
  }, []);

  const declineFriendRequest = useCallback(async (friendshipId: string, friendId: string) => {
    try {
      await FriendsService.declineFriendRequest(friendshipId);
      toast.info("Friend request declined");

      setPendingReceived((prev) => prev.filter((u) => u.id !== friendId));
      setSearchResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, friendshipStatus: "none" } : u))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to decline request.";
      toast.error(msg);
      return false;
    }
  }, []);

  const cancelFriendRequest = useCallback(async (friendshipId: string, friendId: string) => {
    try {
      await FriendsService.cancelFriendRequest(friendshipId);
      toast.info("Friend request cancelled");

      setPendingSent((prev) => prev.filter((u) => u.id !== friendId));
      setSearchResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, friendshipStatus: "none" } : u))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel request.";
      toast.error(msg);
      return false;
    }
  }, []);

  const removeFriend = useCallback(async (friendshipId: string, friendId: string) => {
    try {
      await FriendsService.removeFriend(friendshipId);
      toast.info("Friend removed");

      setFriends((prev) => prev.filter((u) => u.id !== friendId));
      setSearchResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, friendshipStatus: "none" } : u))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove friend.";
      toast.error(msg);
      return false;
    }
  }, []);

  // Annotate friends with live online status
  const friendsWithOnline = useMemo(
    () =>
      friends.map((f) => ({
        ...f,
        isOnline: onlineUserIds.has(f.id),
      })),
    [friends, onlineUserIds]
  );

  const refreshFriends = useCallback(() => loadFriendships(false), [loadFriendships]);

  return useMemo(
    () => ({
      friends: friendsWithOnline,
      pendingReceived,
      pendingSent,
      pendingCount: pendingReceived.length,
      isLoading,
      error,
      searchQuery,
      setSearchQuery,
      searchResults: searchQuery.trim() ? searchResults : [],
      isSearching: searchQuery.trim() ? isSearching : false,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      cancelFriendRequest,
      removeFriend,
      refreshFriends,
    }),
    [
      friendsWithOnline,
      pendingReceived,
      pendingSent,
      isLoading,
      error,
      searchQuery,
      searchResults,
      isSearching,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      cancelFriendRequest,
      removeFriend,
      refreshFriends,
    ]
  );
}
