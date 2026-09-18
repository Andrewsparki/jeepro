"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useSettings } from "@/providers/settings-provider";
import { createClient } from "@/lib/supabase/client";
import { NotificationItem } from "../types";
import { NotificationService } from "../services/notification.service";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const { settings, playSound } = useSettings();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const lastSoundPlayedRef = useRef<number>(0);

  const playNotificationSound = useCallback(() => {
    if (!settings.sounds) return;
    const now = Date.now();
    if (now - lastSoundPlayedRef.current < 600) return; // Prevent burst audio spam
    lastSoundPlayedRef.current = now;
    playSound("notification");
  }, [settings.sounds, playSound]);

  const fetchNotifications = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [listResult, count] = await Promise.all([
        NotificationService.getNotifications(userId, 40),
        NotificationService.getUnreadCount(userId),
      ]);

      setNotifications(listResult.notifications);
      setUnreadCount(count);
    } catch (err) {
      console.error("[NotificationProvider] Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  // Initial fetch on user change with deferred tick to prevent synchronous effect cascade
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, [userId, fetchNotifications]);

  // Realtime subscription setup with automatic unsubscribe on user change / unmount
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = `notifications-${userId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.eventType === "INSERT") {
            const raw = payload.new;
            const isForUser =
              !raw.user_id ||
              raw.user_id === userId ||
              raw.target_user_id === userId ||
              raw.target_type === "all";

            if (!isForUser) return;

            const newItem: NotificationItem = {
              id: raw.id as string,
              user_id: (raw.user_id || raw.target_user_id || userId) as string,
              type: (raw.type || "info") as NotificationItem["type"],
              title: raw.title as string,
              message: raw.message as string,
              metadata: (raw.metadata || {}) as Record<string, unknown>,
              created_at: raw.created_at as string,
              seen_at: (raw.seen_at ?? null) as string | null,
            };

            setNotifications((prev) => {
              if (prev.some((n) => n.id === newItem.id)) {
                return prev;
              }
              return [newItem, ...prev];
            });

            if (!newItem.seen_at) {
              setUnreadCount((prev) => prev + 1);
              playNotificationSound();
            }
          } else if (payload.eventType === "UPDATE") {
            const raw = payload.new;
            const updated: NotificationItem = {
              id: raw.id as string,
              user_id: (raw.user_id || raw.target_user_id || userId) as string,
              type: (raw.type || "info") as NotificationItem["type"],
              title: raw.title as string,
              message: raw.message as string,
              metadata: (raw.metadata || {}) as Record<string, unknown>,
              created_at: raw.created_at as string,
              seen_at: (raw.seen_at ?? null) as string | null,
            };

            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );

            // Recompute unread count based on current state
            setNotifications((current) => {
              const activeUnread = current.filter((n) => !n.seen_at).length;
              setUnreadCount(activeUnread);
              return current;
            });
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as unknown as { id: string };
            setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, playNotificationSound]);

  // Client-side event listener for notifications dispatched in current browser session
  useEffect(() => {
    const handleLocalNotification = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      const item = customEvent.detail;
      if (!item) return;

      const isForUser =
        !item.user_id ||
        item.user_id === userId;

      if (!isForUser) return;

      setNotifications((prev) => {
        if (prev.some((n) => n.id === item.id)) return prev;
        return [item, ...prev];
      });

      if (!item.seen_at) {
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();
      }
    };

    window.addEventListener("jee-pro:notification-created", handleLocalNotification);
    return () => {
      window.removeEventListener("jee-pro:notification-created", handleLocalNotification);
    };
  }, [userId, playNotificationSound]);

  // Mark an individual notification as read (Optimistic UI)
  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) return;

      const now = new Date().toISOString();
      let shouldUpdate = false;

      // Optimistic state update via functional setter
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === id && !n.seen_at) {
            shouldUpdate = true;
            return { ...n, seen_at: now };
          }
          return n;
        })
      );

      if (shouldUpdate) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await NotificationService.markAsRead(id, userId);
      }
    },
    [userId]
  );

  // Mark all notifications as read (Optimistic UI)
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const now = new Date().toISOString();

    // Optimistic state update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, seen_at: n.seen_at || now }))
    );
    setUnreadCount(0);

    // Asynchronously update in database
    await NotificationService.markAllAsRead(userId);
  }, [userId]);

  // Delete an individual notification (Optimistic UI)
  const deleteNotification = useCallback(
    async (id: string) => {
      if (!userId) return;

      let wasUnread = false;
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.seen_at) {
          wasUnread = true;
        }
        return prev.filter((n) => n.id !== id);
      });

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await NotificationService.deleteNotification(id, userId);
    },
    [userId]
  );

  // Clear all notifications for user (Optimistic UI)
  const clearAll = useCallback(async () => {
    if (!userId) return;

    setNotifications([]);
    setUnreadCount(0);

    await NotificationService.clearAllNotifications(userId);
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refresh: fetchNotifications,
        playNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
