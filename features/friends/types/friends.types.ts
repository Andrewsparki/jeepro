export type FriendshipStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked"
  | "none";

export interface FriendUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  created_at: string;
  isOnline?: boolean;
  friendshipId?: string;
  friendshipStatus?: FriendshipStatus;
  isRequester?: boolean; // true if current user sent the request
}

export interface FriendshipRecord {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  requester?: FriendUser | null;
  addressee?: FriendUser | null;
}

export interface PublicProfileStats {
  level: number;
  totalXP: number;
  masteredTopicsCount: number;
  studySessionsCount: number;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  created_at: string;
  friendshipStatus: FriendshipStatus;
  friendshipId?: string;
  isRequester?: boolean;
  stats?: PublicProfileStats;
}
