import { createClient } from "@/lib/supabase/client";

export type ProgressStatus = "Not Started" | "In Progress" | "Mastered" | "Needs Revision";

export interface UserTopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  status: ProgressStatus;
  completed_at: string | null;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  chapter_id?: string | null;
  topic_id?: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
}

export async function getUserProgress(): Promise<UserTopicProgress[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data: progress, error } = await supabase
    .from("user_topic_progress")
    .select("*")
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error fetching user progress:", error.message, error.details, error.hint);
    return [];
  }
  
  return progress as UserTopicProgress[];
}

export async function updateTopicProgress(topicId: string, status: ProgressStatus): Promise<UserTopicProgress | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("updateTopicProgress: No authenticated user");
    return null;
  }
  
  console.log("updateTopicProgress called with user:", user.id, "topic:", topicId, "status:", status);
  
  const completedAt = status === "Mastered" ? new Date().toISOString() : null;
  
  const { data, error } = await supabase
    .from("user_topic_progress")
    .upsert({
      user_id: user.id,
      topic_id: topicId,
      status,
      completed_at: completedAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,topic_id' })
    .select()
    .single();
    
  if (error) {
    console.error("Error updating progress:", error.message, error.details, error.hint);
    return null;
  }
  
  return data as UserTopicProgress;
}

export async function getStudySessions(): Promise<StudySession[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error fetching study sessions:", error.message, error.details, error.hint);
    return [];
  }

  return data as StudySession[];
}

export async function saveStudySession({
  durationSeconds,
  startedAt,
  endedAt,
  chapterId,
  topicId
}: {
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  chapterId?: string;
  topicId?: string;
}): Promise<StudySession | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("saveStudySession: No authenticated user");
    return null;
  }
  
  console.log("saveStudySession called with user:", user.id, "duration:", durationSeconds);

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      duration_seconds: durationSeconds,
      started_at: startedAt,
      ended_at: endedAt,
      chapter_id: chapterId || null,
      topic_id: topicId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving study session:", error.message, error.details, error.hint);
    return null;
  }

  return data as StudySession;
}

import { getSyllabus } from "@/features/syllabus/services/syllabus";
import { calculateXPAndLevel, getAchievements } from "@/features/gamification/services/gamification";

export async function getDashboardMetrics() {
  const [progress, sessions, syllabus] = await Promise.all([
    getUserProgress(),
    getStudySessions(),
    getSyllabus()
  ]);

  const masteredCount = progress.filter(p => p.status === "Mastered").length;
  const inProgressCount = progress.filter(p => p.status === "In Progress").length;
  
  // Overall totals
  const totalDurationSeconds = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const studyHours = Math.floor(totalDurationSeconds / 3600);
  const studyMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  
  // Today stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = sessions.filter(s => new Date(s.started_at) >= today);
  const todayDurationSeconds = todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const todayStudyHours = Math.floor(todayDurationSeconds / 3600);
  const todayStudyMinutes = Math.floor((todayDurationSeconds % 3600) / 60);
  const todayStudyTimeFormatted = todayStudyHours > 0 
    ? `${todayStudyHours}h ${todayStudyMinutes}m` 
    : `${todayStudyMinutes}m`;

  const topicsCompletedToday = progress.filter(p => p.status === "Mastered" && p.completed_at && new Date(p.completed_at) >= today).length;

  // Streak Calculation
  let currentStreak = 0;
  const uniqueStudyDays = new Set(
    sessions.map(s => {
      const d = new Date(s.started_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const checkDate = new Date();
  // If no session today, check if streak continued yesterday
  const todayStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!uniqueStudyDays.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (uniqueStudyDays.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Gamification
  const xpDetails = calculateXPAndLevel(sessions, progress, syllabus);
  const achievements = getAchievements(sessions, progress, syllabus, currentStreak);

  // Last active chapter for Continue Learning
  let lastActiveChapter = null;
  if (sessions.length > 0) {
    const lastSessionWithChapter = sessions.find(s => s.chapter_id);
    if (lastSessionWithChapter && lastSessionWithChapter.chapter_id) {
      // Find the chapter in the syllabus
      for (const sub of syllabus) {
        const chap = sub.chapters.find(c => c.id === lastSessionWithChapter.chapter_id);
        if (chap) {
          lastActiveChapter = {
            subjectSlug: sub.slug,
            subjectName: sub.name,
            chapterSlug: chap.slug,
            chapterTitle: chap.title
          };
          break;
        }
      }
    }
  }

  return {
    masteredTopics: masteredCount,
    inProgressTopics: inProgressCount,
    studyTimeFormatted: `${studyHours}h ${studyMinutes}m`,
    totalDurationSeconds,
    sessionsCount: sessions.length,
    todayStudyTimeFormatted,
    topicsCompletedToday,
    currentStreak,
    xpDetails,
    achievements,
    lastActiveChapter,
    syllabus
  };
}
