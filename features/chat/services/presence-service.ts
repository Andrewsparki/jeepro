"use client";

import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceUser {
  user_id: string;
  full_name?: string;
  avatar_url?: string | null;
  online_at?: number;
}

type PresenceListener = (onlineUsers: PresenceUser[]) => void;

/**
 * Singleton global presence service.
 *
 * Manages a single `jee_global_chat` Supabase Realtime channel with
 * reference-counted subscriptions. Multiple consumers (global chat,
 * private chat, friends list) share the same channel instead of each
 * creating/destroying their own — which previously caused a destructive
 * race condition.
 */
class GlobalPresenceService {
  private channel: RealtimeChannel | null = null;
  private listeners = new Set<PresenceListener>();
  private currentUsers: PresenceUser[] = [];
  private trackedData: Record<string, unknown> | null = null;
  private isSubscribed = false;

  /** Subscribe a listener. Returns an unsubscribe function. */
  subscribe(listener: PresenceListener): () => void {
    this.listeners.add(listener);

    // Deliver current state immediately
    if (this.currentUsers.length > 0) {
      listener(this.currentUsers);
    }

    // Ensure the channel is up
    this.ensureChannel();

    return () => {
      this.listeners.delete(listener);
      // Tear down channel when last consumer leaves
      if (this.listeners.size === 0) {
        this.destroyChannel();
      }
    };
  }

  /** Track the current user's presence. */
  track(data: Record<string, unknown>) {
    this.trackedData = data;
    if (this.channel && this.isSubscribed) {
      this.channel.track(data).catch(() => {});
    }
  }

  /** Stop tracking the current user's presence. */
  untrack() {
    this.trackedData = null;
    if (this.channel && this.isSubscribed) {
      this.channel.untrack().catch(() => {});
    }
  }

  /** Get current snapshot of online users. */
  getOnlineUsers(): PresenceUser[] {
    return this.currentUsers;
  }

  /** Check if a specific user is online. */
  isUserOnline(userId: string): boolean {
    return this.currentUsers.some((u) => u.user_id === userId);
  }

  private ensureChannel() {
    if (this.channel) return;

    const supabase = createClient();

    // Clean up any stale channels with the same topic from previous instances
    const staleChannels = supabase
      .getChannels()
      .filter((c: RealtimeChannel) => c.topic === "realtime:jee_global_chat");
    staleChannels.forEach((c: RealtimeChannel) => {
      c.unsubscribe();
      supabase.removeChannel(c);
    });

    const channel = supabase.channel("jee_global_chat");
    this.channel = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users: PresenceUser[] = [];

      Object.values(state).forEach((presences: unknown) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: unknown) => {
            const pres = p as PresenceUser;
            if (pres?.user_id && !users.some((u) => u.user_id === pres.user_id)) {
              users.push(pres);
            }
          });
        }
      });

      this.currentUsers = users;
      this.notifyListeners();
    });

    channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        this.isSubscribed = true;
        // Re-track if we had pending track data
        if (this.trackedData) {
          await channel.track(this.trackedData).catch(() => {});
        }
      }
    });
  }

  private destroyChannel() {
    if (!this.channel) return;

    const supabase = createClient();
    this.channel.unsubscribe();
    supabase.removeChannel(this.channel);
    this.channel = null;
    this.isSubscribed = false;
    this.currentUsers = [];
    this.trackedData = null;
  }

  private notifyListeners() {
    const users = this.currentUsers;
    this.listeners.forEach((listener) => {
      try {
        listener(users);
      } catch {
        // Don't let one listener crash others
      }
    });
  }
}

// Module-level singleton
export const globalPresence = new GlobalPresenceService();
