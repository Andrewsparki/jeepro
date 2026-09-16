"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  is_admin: boolean;
  created_at: string;
  study_sessions_count: number;
  topics_mastered_count: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  study_sessions_count: number;
  total_study_time_seconds: number;
  topics_mastered_count: number;
  topics_in_progress_count: number;
  recent_sessions: {
    id: string;
    duration_seconds: number;
    started_at: string;
    ended_at: string;
    chapter_id: string | null;
    topic_id: string | null;
  }[];
}

export interface PaginatedUsers {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUsers(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedUsers> {
  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  // Build base query
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, target_exam, target_year, is_admin, created_at", {
      count: "exact",
    });

  // Apply search filter
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`);
  }

  // Apply pagination and ordering
  const { data: profiles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0, page, pageSize, totalPages: 0 };
  }

  if (!profiles || profiles.length === 0) {
    return { users: [], total: count || 0, page, pageSize, totalPages: Math.ceil((count || 0) / pageSize) };
  }

  // Fetch session counts and mastered topic counts for these users
  const userIds = profiles.map((p) => p.id);

  const [sessionsResult, masteredResult] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("user_id")
      .in("user_id", userIds),
    supabase
      .from("user_topic_progress")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "Mastered"),
  ]);

  // Count by user
  const sessionCounts: Record<string, number> = {};
  const masteredCounts: Record<string, number> = {};

  sessionsResult.data?.forEach((s: { user_id: string }) => {
    sessionCounts[s.user_id] = (sessionCounts[s.user_id] || 0) + 1;
  });

  masteredResult.data?.forEach((m: { user_id: string }) => {
    masteredCounts[m.user_id] = (masteredCounts[m.user_id] || 0) + 1;
  });

  const users: AdminUserListItem[] = profiles.map((p) => ({
    ...p,
    study_sessions_count: sessionCounts[p.id] || 0,
    topics_mastered_count: masteredCounts[p.id] || 0,
  }));

  const total = count || 0;

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createAdminClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, target_exam, target_year, is_admin, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching user detail:", profileError);
    return null;
  }

  // Fetch stats in parallel
  const [sessionsResult, topicProgressResult, recentSessionsResult] = await Promise.all([
    // All sessions for time calculation
    supabase
      .from("study_sessions")
      .select("duration_seconds")
      .eq("user_id", userId),
    // Topic progress
    supabase
      .from("user_topic_progress")
      .select("status")
      .eq("user_id", userId),
    // Recent sessions (last 10)
    supabase
      .from("study_sessions")
      .select("id, duration_seconds, started_at, ended_at, chapter_id, topic_id")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(10),
  ]);

  const sessions = sessionsResult.data || [];
  const totalStudyTime = sessions.reduce(
    (sum: number, s: { duration_seconds: number }) => sum + (s.duration_seconds || 0),
    0
  );

  const progress = topicProgressResult.data || [];
  const masteredCount = progress.filter((p: { status: string }) => p.status === "Mastered").length;
  const inProgressCount = progress.filter((p: { status: string }) => p.status === "In Progress").length;

  return {
    ...profile,
    study_sessions_count: sessions.length,
    total_study_time_seconds: totalStudyTime,
    topics_mastered_count: masteredCount,
    topics_in_progress_count: inProgressCount,
    recent_sessions: (recentSessionsResult.data || []) as AdminUserDetail["recent_sessions"],
  };
}
