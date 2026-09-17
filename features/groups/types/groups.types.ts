export type GroupRole = "owner" | "admin" | "member";

export type GroupAvatarColor = 
  | "blue"
  | "purple"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "cyan";

export type GroupAvatarIcon = 
  | "book"
  | "atom"
  | "flask"
  | "calculator"
  | "rocket"
  | "target"
  | "brain"
  | "trophy";

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  avatar_icon: string;
  avatar_color: string;
  is_private: boolean;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  user_role?: GroupRole | null;
  creator_name?: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    target_exam?: string | null;
    target_year?: number | null;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface GroupInvite {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  updated_at: string;
  group?: {
    id: string;
    name: string;
    description: string | null;
    avatar_icon: string;
    avatar_color: string;
    member_count: number;
    is_private: boolean;
  };
  inviter?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  avatar_icon?: string;
  avatar_color?: string;
  is_private?: boolean;
}

export interface InvitableFriend {
  id: string;
  full_name: string;
  avatar_url: string | null;
  target_exam: string | null;
  is_invited: boolean;
}
