import { createClient } from "@/lib/supabase/client";
import {
  NotificationItem,
  CreateNotificationParams,
} from "../types";

export class NotificationService {
  /**
   * Creates a notification using the secure server-side RPC create_user_notification.
   * Enforces server-side authentication, actor derivation, input validation, and
   * relationship verification while preserving strict table-level RLS.
   */
  static async createNotification(
    params: CreateNotificationParams
  ): Promise<NotificationItem | null> {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isCrossUser = user && user.id !== params.userId;

      // 1. Primary path: Call the secure server-side RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_user_notification",
        {
          p_target_user_id: params.userId,
          p_title: params.title,
          p_message: params.message,
          p_type: params.type || "info",
          p_metadata: params.metadata || {},
        }
      );

      if (!rpcError && rpcData) {
        const item = rpcData as NotificationItem;
        if (typeof window !== "undefined" && item) {
          window.dispatchEvent(
            new CustomEvent("jee-pro:notification-created", { detail: item })
          );
        }
        return item;
      }

      // If the RPC failed with an authorization or constraint error, log and do not attempt direct cross-user insert
      if (rpcError && rpcError.code !== "42883") {
        console.error(
          "[NotificationService] Secure RPC create_user_notification error:",
          rpcError.message
        );
        return null;
      }

      // Cross-user notifications require the secure server-side RPC (direct table insert is strictly blocked by RLS)
      if (isCrossUser) {
        console.error(
          "[NotificationService] Cannot create cross-user notification: RPC create_user_notification unavailable"
        );
        return null;
      }

      // 2. Fallback path for self-notifications only (where auth.uid() = user_id)
      const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000).toISOString();
      const existingRes = await supabase
        .from("notifications")
        .select("id, title, created_at")
        .eq("user_id", params.userId)
        .eq("title", params.title)
        .gte("created_at", fifteenSecondsAgo)
        .limit(1);

      if (existingRes.data && existingRes.data.length > 0) {
        return existingRes.data[0] as NotificationItem;
      }

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: params.userId,
          target_user_id: params.userId,
          target_type: "user",
          title: params.title,
          message: params.message,
          type: params.type || "info",
          metadata: params.metadata || {},
          seen_at: null,
        })
        .select()
        .single();

      if (error) {
        console.error("[NotificationService] Fallback self-insert error:", error.message);
        return null;
      }

      const item = data as NotificationItem;
      if (typeof window !== "undefined" && item) {
        window.dispatchEvent(
          new CustomEvent("jee-pro:notification-created", { detail: item })
        );
      }
      return item;
    } catch (err) {
      console.error("[NotificationService] createNotification exception:", err);
      return null;
    }
  }

  /**
   * Fetches paginated notification history for a user (newest first).
   */
  static async getNotifications(
    userId: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<{ notifications: NotificationItem[]; total: number }> {
    try {
      const supabase = createClient();

      // Query across user_id, target_user_id, and broadcast target_type 'all'
      let { data, count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .or(`user_id.eq.${userId},target_user_id.eq.${userId},target_type.eq.all`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && error.code === "42703") {
        // Fallback before 009 migration is applied
        const fallback = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .or(`target_user_id.eq.${userId},target_type.eq.all`)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        data = fallback.data;
        count = fallback.count;
        error = fallback.error;
      }

      if (error) {
        console.error("[NotificationService] getNotifications error:", error.message);
        return { notifications: [], total: 0 };
      }

      const formatted = (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        user_id: (item.user_id || item.target_user_id || userId) as string,
        type: (item.type || "info") as NotificationItem["type"],
        title: item.title as string,
        message: item.message as string,
        metadata: (item.metadata || {}) as Record<string, unknown>,
        created_at: item.created_at as string,
        seen_at: (item.seen_at ?? null) as string | null,
      }));

      return {
        notifications: formatted,
        total: count || 0,
      };
    } catch (err) {
      console.error("[NotificationService] getNotifications exception:", err);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Returns count of unseen notifications (where seen_at IS NULL).
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = createClient();

      let { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${userId},target_user_id.eq.${userId},target_type.eq.all`)
        .is("seen_at", null);

      if (error && error.code === "42703") {
        // If seen_at column does not exist yet prior to running migration 009, fallback
        const fallback = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .or(`target_user_id.eq.${userId},target_type.eq.all`);

        count = fallback.count;
        error = fallback.error;
      }

      if (error) {
        console.error("[NotificationService] getUnreadCount error:", error.message);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error("[NotificationService] getUnreadCount exception:", err);
      return 0;
    }
  }

  /**
   * Marks an individual notification as read.
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("notifications")
        .update({ seen_at: new Date().toISOString() })
        .eq("id", notificationId)
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);

      if (error) {
        if (error.code === "42703") {
          return true;
        }
        console.error("[NotificationService] markAsRead error:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[NotificationService] markAsRead exception:", err);
      return false;
    }
  }

  /**
   * Marks all unseen notifications for a user as read.
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("notifications")
        .update({ seen_at: new Date().toISOString() })
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`)
        .is("seen_at", null);

      if (error) {
        if (error.code === "42703") {
          return true;
        }
        console.error("[NotificationService] markAllAsRead error:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[NotificationService] markAllAsRead exception:", err);
      return false;
    }
  }
}
