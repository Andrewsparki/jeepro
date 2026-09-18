import { createClient } from "@/lib/supabase/client";
import { getChapterUuid, getTopicUuid } from "@/features/syllabus/services/mapping.service";
import { NotificationService } from "@/features/notifications/services/notification.service";

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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
  subject_id?: string | null;
  chapter_id?: string | null;
  topic_id?: string | null;
  section_id?: string | null;
  activity_type?: string | null;
  completion_percentage?: number | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  xp_earned?: number | null; // For UI display, might not exist in db
  notes?: string | null; // Future ready
}

export async function deleteStudySessions(sessionIds: string[]): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("study_sessions")
    .delete()
    .eq("user_id", user.id)
    .in("id", sessionIds);
    
  if (error) {
    console.error("Error deleting study sessions:", error.message);
    return false;
  }
  return true;
}

export async function clearAllStudySessions(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("study_sessions")
    .delete()
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error clearing study sessions:", error.message);
    return false;
  }
  return true;
}

export async function resetAccountProgress(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Execute atomic server-side RPC first
    const { error: rpcError } = await supabase.rpc("reset_user_account_progress", { p_user_id: user.id });

    if (rpcError) {
      console.warn("RPC reset_user_account_progress error/fallback:", rpcError.message);
      
      // Fallback: Delete across all progression tables directly
      await Promise.allSettled([
        supabase.from("user_topic_progress").delete().eq("user_id", user.id),
        supabase.from("study_sessions").delete().eq("user_id", user.id),
        supabase.from("user_achievements").delete().eq("user_id", user.id),
        supabase.from("daily_missions").delete().eq("user_id", user.id),
        supabase.from("progress").delete().eq("user_id", user.id),
        supabase.from("daily_progress").delete().eq("user_id", user.id),
        supabase.from("xp_history").delete().eq("user_id", user.id),
        supabase.from("user_resume_state").delete().eq("user_id", user.id),
        supabase.from("planner_events").update({ status: "pending" }).eq("user_id", user.id).eq("status", "completed"),
      ]);
    }

    return true;
  } catch (err) {
    console.error("resetAccountProgress error:", err);
    return false;
  }
}

export async function getUserProgress(): Promise<UserTopicProgress[]> {
  try {
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
    
    return (progress || []) as UserTopicProgress[];
  } catch (err) {
    console.error("getUserProgress error:", err);
    return [];
  }
}

export async function updateTopicProgress(topicId: string, status: ProgressStatus): Promise<UserTopicProgress | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("updateTopicProgress: No authenticated user");
    return null;
  }
  
  const completedAt = status === "Mastered" ? new Date().toISOString() : null;
  
  const topicUuid = await getTopicUuid(topicId);
  if (!topicUuid || !isUuid(topicUuid)) {
    console.error(`updateTopicProgress: Could not resolve valid UUID for topic ID: ${topicId}. Got: ${topicUuid}`);
    return null;
  }

  const { data, error } = await supabase
    .from("user_topic_progress")
    .upsert({
      user_id: user.id,
      topic_id: topicUuid,
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
  
  if (status === "Mastered") {
    import("@/features/achievements/services/achievements.service")
      .then(({ AchievementsService }) => AchievementsService.evaluateAchievements(user.id))
      .catch((err) => console.error("Error evaluating achievements after topic update:", err));
  }

  return data as UserTopicProgress;
}

export async function updateChapterProgress(subjectSlug: string, chapterSlug: string, status: ProgressStatus): Promise<UserTopicProgress[] | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("updateChapterProgress: No authenticated user");
    return null;
  }

  // Get the chapter to find its topics
  const chapter = await getChapterBySlug(subjectSlug, chapterSlug);
  if (!chapter) {
    console.error("updateChapterProgress: Chapter not found");
    return null;
  }

  const topicUuids: string[] = [];
  
  await Promise.all(chapter.topics.map(async topic => {
    const topicUuid = await getTopicUuid(topic.id);
    if (topicUuid && isUuid(topicUuid)) {
      topicUuids.push(topicUuid);
    } else {
      console.warn(`updateChapterProgress: Skipped topic ${topic.id} because a valid UUID could not be resolved.`);
    }
  }));

  if (topicUuids.length === 0) return [];

  const isNewlyMastered = status === "Mastered" && chapter.status !== "Mastered" && chapter.completionPercentage < 100;
  
  const completedAt = status === "Mastered" ? new Date().toISOString() : null;
  const updatedAt = new Date().toISOString();

  const upsertData = topicUuids.map(uuid => ({
    user_id: user.id,
    topic_id: uuid,
    status,
    completed_at: completedAt,
    updated_at: updatedAt
  }));

  const { data, error } = await supabase
    .from("user_topic_progress")
    .upsert(upsertData, { onConflict: 'user_id,topic_id' })
    .select();

  if (error) {
    console.error("Error updating chapter progress:", error.message, error.details, error.hint);
    return null;
  }

  if (isNewlyMastered) {
    try {
      await updateMissionProgress("chapter_completion", 1);
      await NotificationService.createNotification({
        userId: user.id,
        type: "achievement",
        title: "Chapter Mastered!",
        message: `Outstanding! You have mastered all topics in "${chapter.title}".`,
        metadata: { chapterId: chapter.id, chapterSlug: chapter.slug },
      });
    } catch (err) {
      console.error("Error updating mission progress for chapter:", err);
    }
  }

  if (status === "Mastered") {
    import("@/features/achievements/services/achievements.service")
      .then(({ AchievementsService }) => AchievementsService.evaluateAchievements(user.id))
      .catch((err) => console.error("Error evaluating achievements after chapter update:", err));
  }

  return (data || []) as UserTopicProgress[];
}

export async function updateSubjectProgress(subjectSlug: string, status: ProgressStatus): Promise<UserTopicProgress[] | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("updateSubjectProgress: No authenticated user");
    return null;
  }

  // Get the subject to find all topics across all chapters
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) {
    console.error("updateSubjectProgress: Subject not found");
    return null;
  }

  let newlyMasteredChaptersCount = 0;
  if (status === "Mastered") {
    newlyMasteredChaptersCount = subject.chapters.filter(
      c => c.status !== "Mastered" && c.completionPercentage < 100
    ).length;
  }

  const completedAt = status === "Mastered" ? new Date().toISOString() : null;
  const updatedAt = new Date().toISOString();
  
  const upsertData: { user_id: string; topic_id: string; status: ProgressStatus; completed_at: string | null; updated_at: string }[] = [];

  for (const chapter of subject.chapters) {
    for (const topic of chapter.topics) {
      const topicUuid = await getTopicUuid(topic.id);
      if (topicUuid && isUuid(topicUuid)) {
        upsertData.push({
          user_id: user.id,
          topic_id: topicUuid,
          status,
          completed_at: completedAt,
          updated_at: updatedAt
        });
      } else {
        console.warn(`updateSubjectProgress: Skipped topic ${topic.id} because a valid UUID could not be resolved.`);
      }
    }
  }

  if (upsertData.length === 0) return [];

  const { data, error } = await supabase
    .from("user_topic_progress")
    .upsert(upsertData, { onConflict: 'user_id,topic_id' })
    .select();

  if (error) {
    console.error("Error updating subject progress:", error.message, error.details, error.hint);
    return null;
  }

  if (status === "Mastered" && newlyMasteredChaptersCount > 0) {
    try {
      await updateMissionProgress("chapter_completion", newlyMasteredChaptersCount);
    } catch (err) {
      console.error("Error updating mission progress for subject completion:", err);
    }
  }

  if (status === "Mastered") {
    import("@/features/achievements/services/achievements.service")
      .then(({ AchievementsService }) => AchievementsService.evaluateAchievements(user.id))
      .catch((err) => console.error("Error evaluating achievements after subject update:", err));
  }

  return (data || []) as UserTopicProgress[];
}

export async function getStudySessions(limit?: number): Promise<StudySession[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (typeof limit === "number" && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching study sessions:", error.message, error.details, error.hint);
    return [];
  }

  return data as StudySession[];
}

import { updateMissionProgress } from "@/features/daily-missions/services/missions.service";

export async function saveStudySession({
  durationSeconds,
  startedAt,
  endedAt,
  chapterId,
  topicId,
  activityType
}: {
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  chapterId?: string;
  topicId?: string;
  activityType?: string;
}): Promise<StudySession | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("saveStudySession: No authenticated user");
    return null;
  }
  
  const chapterUuid = await getChapterUuid(chapterId);
  const topicUuid = await getTopicUuid(topicId);

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      duration_seconds: durationSeconds,
      started_at: startedAt,
      ended_at: endedAt,
      chapter_id: chapterUuid && isUuid(chapterUuid) ? chapterUuid : null,
      topic_id: topicUuid && isUuid(topicUuid) ? topicUuid : null,
      activity_type: activityType || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving study session:", error.message, error.details, error.hint);
    return null;
  }

  // Hook into Daily Missions
  try {
    const durationMins = Math.floor(durationSeconds / 60);
    if (durationMins > 0) {
      await updateMissionProgress("study_duration", durationMins);
    }
    await updateMissionProgress("focus_sessions", 1);
  } catch (err) {
    console.error("Error updating mission progress for session:", err);
  }

  // Hook into Achievements
  import("@/features/achievements/services/achievements.service")
    .then(({ AchievementsService }) => AchievementsService.evaluateAchievements(user.id))
    .catch((err) => console.error("Error evaluating achievements after session:", err));

  return data as StudySession;
}

import { getSyllabus, getChapterBySlug, getSubjectBySlug } from "@/features/syllabus/services/syllabus";
import { calculateXPAndLevel, getAchievements, generateXPEvents } from "@/features/gamification/services/gamification";
import { AchievementsService } from "@/features/achievements/services/achievements.service";
import { getPlannerEvents } from "@/features/planner/services/planner.service";
import { getTodayMissions, getAllCompletedMissions } from "@/features/daily-missions/services/missions.service";

export async function getDashboardMetrics() {
  const [progress, sessions, syllabus, allEvents, allCompletedMissions, realAchievements] = await Promise.all([
    getUserProgress(),
    getStudySessions(),
    getSyllabus(),
    getPlannerEvents(),
    getAllCompletedMissions(),
    AchievementsService.getUserAchievements().catch(() => [])
  ]);

  // Reuse already-fetched sessions to avoid duplicate database query when daily missions are generated
  const dailyMissions = await getTodayMissions(sessions);

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
  const unlockedAchievementsList = realAchievements.filter(a => a.unlocked);
  const achievementXP = unlockedAchievementsList.reduce((sum, a) => sum + (a.xp_reward || 0), 0);

  const xpDetails = calculateXPAndLevel(sessions, progress, syllabus, allCompletedMissions, achievementXP);
  const achievements = realAchievements.length > 0
    ? realAchievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        unlocked: a.unlocked,
        unlockedAt: a.unlocked_at || undefined,
      }))
    : getAchievements(sessions, progress, syllabus, currentStreak);
  const xpEvents = generateXPEvents(sessions, progress, syllabus, allCompletedMissions, unlockedAchievementsList);

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

  // Today's events
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysEvents = allEvents.filter(e => {
    const eventTime = new Date(e.start_time);
    return eventTime >= todayStart && eventTime <= todayEnd;
  });

  // Weekly stats
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklySessions = sessions.filter(s => new Date(s.started_at) >= startOfWeek);
  const weeklyDurationSeconds = weeklySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const weeklyStudyHours = Math.floor(weeklyDurationSeconds / 3600);

  return {
    masteredTopics: masteredCount,
    inProgressTopics: inProgressCount,
    studyTimeFormatted: `${studyHours}h ${studyMinutes}m`,
    totalDurationSeconds,
    sessionsCount: sessions.length,
    todayStudyHours,
    todayStudyMinutes,
    todayStudyTimeFormatted,
    topicsCompletedToday,
    currentStreak,
    xpDetails,
    achievements,
    lastActiveChapter,
    syllabus,
    todaysEvents,
    weeklyStudyHours,
    study_sessions: sessions,
    progress,
    dailyMissions,
    xpEvents,
  };
}
