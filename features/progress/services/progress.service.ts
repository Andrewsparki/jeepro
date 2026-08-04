import { createClient } from "@/lib/supabase/client";
import { ActivityType, getXPForActivity } from "../config/xp-config";

export interface ProgressEntry {
  id: string;
  subject_id: string | null;
  chapter_id: string | null;
  section_id: string | null;
  activity_type: string;
  status: "Not Started" | "In Progress" | "Mastered" | "Needs Revision";
  time_spent_seconds: number;
  sessions_completed: number;
  progress_percentage: number;
  xp_earned: number;
  revision_count: number;
  last_studied_at: string;
}

export interface DailyProgress {
  date: string;
  time_spent_seconds: number;
  xp_earned: number;
  sessions_completed: number;
  streak_count: number;
}

export async function saveStudySessionAndProgress({
  durationSeconds,
  startedAt,
  endedAt,
  subjectId,
  chapterId,
  sectionId,
  activityType,
  completionPercentage = 0,
}: {
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  subjectId?: string;
  chapterId?: string;
  sectionId?: string;
  activityType?: ActivityType;
  completionPercentage?: number;
}) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Save Study Session
    const { error: sessionError } = await supabase.from("study_sessions").insert({
      user_id: user.id,
      duration_seconds: durationSeconds,
      started_at: startedAt,
      ended_at: endedAt,
      subject_id: subjectId || null,
      chapter_id: chapterId || null,
      topic_id: sectionId || null,
      activity_type: activityType || null,
      completion_percentage: completionPercentage
    });
    if (sessionError) throw sessionError;

    const xpEarned = activityType ? getXPForActivity(activityType) : 0;

    // 2. Update Progress (if applicable)
    if (subjectId && chapterId && sectionId && activityType) {
      const { data: existingProgress, error: fetchError } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", subjectId)
        .eq("chapter_id", chapterId)
        .eq("section_id", sectionId)
        .eq("activity_type", activityType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingProgress) {
        const newTime = (existingProgress.time_spent_seconds || 0) + durationSeconds;
        const newSessions = (existingProgress.sessions_completed || 0) + 1;
        const newXp = (existingProgress.xp_earned || 0) + xpEarned;
        const newStatus = completionPercentage === 100 ? "Mastered" : "In Progress";
        
        const { error: updateError } = await supabase.from("progress").update({
          time_spent_seconds: newTime,
          sessions_completed: newSessions,
          xp_earned: newXp,
          progress_percentage: Math.max(existingProgress.progress_percentage || 0, completionPercentage),
          status: newStatus,
          last_studied_at: new Date().toISOString()
        }).eq("id", existingProgress.id);
        if (updateError) throw updateError;
      } else {
        const newStatus = completionPercentage === 100 ? "Mastered" : "In Progress";
        const { error: insertError } = await supabase.from("progress").insert({
          user_id: user.id,
          subject_id: subjectId,
          chapter_id: chapterId,
          section_id: sectionId,
          activity_type: activityType,
          time_spent_seconds: durationSeconds,
          sessions_completed: 1,
          xp_earned: xpEarned,
          progress_percentage: completionPercentage,
          status: newStatus,
          last_studied_at: new Date().toISOString()
        });
        if (insertError) throw insertError;
      }
    }

    // 3. Update Daily Progress
    if (durationSeconds > 0 || xpEarned > 0) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Check yesterday for streak
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      const { data: existingDaily, error: dailyFetchError } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (dailyFetchError && dailyFetchError.code !== 'PGRST116') throw dailyFetchError;

      if (existingDaily) {
        const { error: dailyUpdateError } = await supabase.from("daily_progress").update({
          time_spent_seconds: (existingDaily.time_spent_seconds || 0) + durationSeconds,
          xp_earned: (existingDaily.xp_earned || 0) + xpEarned,
          sessions_completed: (existingDaily.sessions_completed || 0) + 1
        }).eq("id", existingDaily.id);
        if (dailyUpdateError) throw dailyUpdateError;
      } else {
        // Calculate streak
        let newStreak = 1;
        const { data: yesterdayDaily, error: yesterdayError } = await supabase
          .from("daily_progress")
          .select("streak_count")
          .eq("user_id", user.id)
          .eq("date", yesterday)
          .single();
          
        if (yesterdayError && yesterdayError.code !== 'PGRST116') throw yesterdayError;
        if (yesterdayDaily) {
          newStreak = (yesterdayDaily.streak_count || 0) + 1;
        }

        const { error: dailyInsertError } = await supabase.from("daily_progress").insert({
          user_id: user.id,
          date: today,
          time_spent_seconds: durationSeconds,
          xp_earned: xpEarned,
          sessions_completed: 1,
          streak_count: newStreak
        });
        if (dailyInsertError) throw dailyInsertError;
      }

      // 4. Record XP History
      if (xpEarned > 0) {
        const { error: xpError } = await supabase.from("xp_history").insert({
          user_id: user.id,
          amount: xpEarned,
          source: activityType || "Study Session"
        });
        if (xpError) throw xpError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving study session and progress:", error);
    return false;
  }
}

export async function getOverallProgress() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
  return data as ProgressEntry[];
}

export async function getDailyProgress(date: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    console.error("Error fetching daily progress:", error);
    return null;
  }
  
  return data as DailyProgress | null;
}
