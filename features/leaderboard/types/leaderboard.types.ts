export type LeaderboardScope = "global" | "friends";
export type LeaderboardPeriod = "weekly" | "monthly" | "all_time";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  targetExam: string | null;
  targetYear: number | null;
  totalXp: number;
  level: number;
  isCurrentUser: boolean;
}

export interface CurrentUserRank {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  targetExam: string | null;
  targetYear: number | null;
  totalXp: number;
  level: number;
  totalUsers: number;
}

export interface RawLeaderboardRpcRow {
  rank: number | string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  total_xp: number | string;
  level: number | string;
  total_users?: number | string;
}
