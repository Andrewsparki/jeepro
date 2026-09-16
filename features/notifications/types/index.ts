export type NotificationType =
  | "info"
  | "warning"
  | "success"
  | "error"
  | "achievement"
  | "milestone";

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  seen_at: string | null;
}

export interface CreateNotificationParams {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
}
