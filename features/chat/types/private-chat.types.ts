export interface DirectUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam?: string | null;
  target_year?: number | null;
  isOnline?: boolean;
}

export interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sender?: DirectUser | null;
}

export interface ConversationLastMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ConversationItem {
  id: string;
  other_user: DirectUser;
  friendship_status: "accepted" | "pending" | "none" | "blocked";
  last_message: ConversationLastMessage | null;
  last_message_at: string;
  created_at: string;
  unread_count: number;
}

export interface GetOrCreateConversationResult {
  conversation_id: string;
  created_at: string;
  other_user: DirectUser;
  friendship_status: string;
}
