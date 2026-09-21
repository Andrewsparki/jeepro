"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { FriendUser } from "../types/friends.types";
import { FriendsService } from "../services/friends.service";
import { useAuth } from "@/features/auth/components/auth-provider";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendUser[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Online status set of user IDs
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const friendshipsChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // 1. Fetch initial friends and pending requests
  const loadFriendships = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [friendsList, pending] = await Promise.all([
        FriendsService.getFriends(),
        FriendsService.getPendingRequests(),
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
  }, []);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      try {
        const [friendsList, pending] = await Promise.all([
          FriendsService.getFriends(),
          FriendsService.getPendingRequests(),
        ]);
        if (!ignore) {
          setFriends(friendsList);
          setPendingReceived(pending.received);
          setPendingSent(pending.sent);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load friends.";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Realtime listener on friendships table
  useEffect(() => {
    if (!user) return;
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
  }, [user, loadFriendships]);

  // 3. Shared presence channel to track online friends
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    // Clean up any existing local presence channel reference
    if (presenceChannelRef.current) {
      presenceChannelRef.current.unsubscribe();
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }

    // Clean up any existing stale presence channels for jee_global_chat
    const stalePresence = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic === "realtime:jee_global_chat");
    stalePresence.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    // Connect to existing presence channel
    const presenceChannel = supabase.channel("jee_global_chat");
    presenceChannelRef.current = presenceChannel;

    presenceChannel.on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      const onlineIds = new Set<string>();

      Object.values(state).forEach((presences: unknown) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: unknown) => {
            const pres = p as { user_id?: string };
            if (pres?.user_id) {
              onlineIds.add(pres.user_id);
            }
          });
        }
      });

      setOnlineUserIds(onlineIds);
    });

    presenceChannel.subscribe();

    return () => {
      presenceChannel.unsubscribe();
      supabase.removeChannel(presenceChannel);
      presenceChannelRef.current = null;
    };
  }, [user]);

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
  const sendFriendRequest = async (targetUserId: string) => {
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
  };

  const acceptFriendRequest = async (friendshipId: string, friendId: string) => {
    try {
      await FriendsService.acceptFriendRequest(friendshipId);
      toast.success("Friend request accepted!");

      // Optimistic update
      const acceptedUser = pendingReceived.find((u) => u.id === friendId);
      setPendingReceived((prev) => prev.filter((u) => u.id !== friendId));

      if (acceptedUser) {
        setFriends((prev) => [...prev, { ...acceptedUser, friendshipStatus: "accepted" }]);
      }

      setSearchResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, friendshipStatus: "accepted" } : u))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept request.";
      toast.error(msg);
      return false;
    }
  };

  const declineFriendRequest = async (friendshipId: string, friendId: string) => {
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
  };

  const cancelFriendRequest = async (friendshipId: string, friendId: string) => {
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
  };

  const removeFriend = async (friendshipId: string, friendId: string) => {
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
  };

  // Annotate friends with live online status
  const friendsWithOnline = friends.map((f) => ({
    ...f,
    isOnline: onlineUserIds.has(f.id),
  }));

  return {
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
    refreshFriends: () => loadFriendships(false),
  };
}
