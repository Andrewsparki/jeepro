"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalStudySessions: number;
  totalStudyTimeSeconds: number;
  activeUsersLast7Days: number;
  totalTopicsMastered: number;
  totalNotifications: number;
}

export interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createAdminClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel for performance
  const [
    totalUsersResult,
    newUsers7dResult,
    newUsers30dResult,
    totalSessionsResult,
    studyTimeResult,
    activeUsers7dResult,
    masteredTopicsResult,
    notificationsResult,
  ] = await Promise.all([
    // Total users
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    // New users (7 days)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    // New users (30 days)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    // Total study sessions
    supabase.from("study_sessions").select("id", { count: "exact", head: true }),
    // Total study time (sum of duration_seconds) - fetch with limit
    supabase
      .from("study_sessions")
      .select("duration_seconds"),
    // Active users in last 7 days (distinct users with sessions)
    supabase
      .from("study_sessions")
      .select("user_id")
      .gte("started_at", sevenDaysAgo),
    // Total topics mastered
    supabase
      .from("user_topic_progress")
      .select("id", { count: "exact", head: true })
      .eq("status", "Mastered"),
    // Total notifications
    supabase.from("notifications").select("id", { count: "exact", head: true }),
  ]);

  // Calculate total study time
  const totalStudyTime = studyTimeResult.data
    ? studyTimeResult.data.reduce(
        (sum: number, s: { duration_seconds: number }) => sum + (s.duration_seconds || 0),
        0
      )
    : 0;

  // Calculate distinct active users
  const activeUserIds = new Set(
    activeUsers7dResult.data?.map((s: { user_id: string }) => s.user_id) || []
  );

  return {
    totalUsers: totalUsersResult.count || 0,
    newUsersLast7Days: newUsers7dResult.count || 0,
    newUsersLast30Days: newUsers30dResult.count || 0,
    totalStudySessions: totalSessionsResult.count || 0,
    totalStudyTimeSeconds: totalStudyTime,
    activeUsersLast7Days: activeUserIds.size,
    totalTopicsMastered: masteredTopicsResult.count || 0,
    totalNotifications: notificationsResult.count || 0,
  };
}

export async function getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent users:", error);
    return [];
  }

  return (data || []) as RecentUser[];
}
