export interface ChatSender {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sender?: ChatSender | null;
}

export interface ChatReportInput {
  message_id: string;
  reason: string;
  details?: string;
}

export interface ChatReport {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string;
  details?: string | null;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
}

export interface ChatPresenceUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  online_at: number;
}

export interface ChatSystemStatus {
  enabled: boolean;
  disabled_reason: string | null;
}
