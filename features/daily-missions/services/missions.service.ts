"use server";

import { createClient } from "@/lib/supabase/server";
import { XP_CONFIG } from "@/features/progress/config/xp-config";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { getLocalISTDateString } from "@/lib/date-utils";
import type { DailyMission, MissionType } from "../types/mission.types";

function getLocalDateString(userDateOverride?: string): string {
  if (userDateOverride && /^\d{4}-\d{2}-\d{2}$/.test(userDateOverride)) {
    return userDateOverride;
  }
  return getLocalISTDateString();
}

/**
 * Reconciles mission progress against actual recorded study_sessions from today.
 * Guarantees that any completed focus session or study session is accurately reflected
 * in Daily Mission progress even if it was synced offline or completed before daily_missions existed.
 */
async function reconcileMissionsWithSessions(
  userId: string,
  todayStr: string,
  missions: DailyMission[],
  existingRecentSessions?: { duration_seconds: number; started_at: string }[],
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<DailyMission[]> {
  try {
    const client = supabase || (await createClient());

    let recentSessions: { duration_seconds: number; started_at: string }[] = [];
    if (existingRecentSessions && existingRecentSessions.length > 0) {
      recentSessions = existingRecentSessions;
    } else {
      // Bounded query for today's sessions in ISO range
      const sevenDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await client
        .from("study_sessions")
        .select("duration_seconds, started_at")
        .eq("user_id", userId)
        .gte("started_at", sevenDaysAgo);
      recentSessions = data || [];
    }

    const todaySessions = recentSessions.filter(
      (s) => getLocalISTDateString(s.started_at) === todayStr
    );
    const todayStudyMins = Math.floor(
      todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
    );
    const todaySessionCount = todaySessions.length;

    let hasUpdates = false;
    const reconciled = [...missions];

    for (let i = 0; i < reconciled.length; i++) {
      const mission = reconciled[i];
      if (mission.mission_type === "study_duration") {
        if (todayStudyMins > mission.current_value) {
          hasUpdates = true;
          const completed = todayStudyMins >= mission.target_value;
          reconciled[i] = {
            ...mission,
            current_value: todayStudyMins,
            completed: mission.completed || completed,
            completed_at: mission.completed_at || (completed ? new Date().toISOString() : null),
          };
          await client
            .from("daily_missions")
            .update({
              current_value: todayStudyMins,
              completed: reconciled[i].completed,
              completed_at: reconciled[i].completed_at,
            })
            .eq("id", mission.id);
        }
      } else if (mission.mission_type === "focus_sessions") {
        if (todaySessionCount > mission.current_value) {
          hasUpdates = true;
          const completed = todaySessionCount >= mission.target_value;
          reconciled[i] = {
            ...mission,
            current_value: todaySessionCount,
            completed: mission.completed || completed,
            completed_at: mission.completed_at || (completed ? new Date().toISOString() : null),
          };
          await client
            .from("daily_missions")
            .update({
              current_value: todaySessionCount,
              completed: reconciled[i].completed,
              completed_at: reconciled[i].completed_at,
            })
            .eq("id", mission.id);
        }
      }
    }

    if (hasUpdates && reconciled.every((m) => m.completed)) {
      const alreadyAwarded = reconciled.some((m) => m.bonus_xp_awarded);
      if (!alreadyAwarded) {
        await client
          .from("daily_missions")
          .update({ bonus_xp_awarded: true })
          .eq("user_id", userId)
          .eq("date", todayStr);
      }
    }

    return reconciled;
  } catch (err) {
    console.error("[DailyMissions] Error in reconcileMissionsWithSessions:", err);
    return missions;
  }
}

export async function getTodayMissions(
  existingRecentSessions?: { duration_seconds: number; started_at: string }[],
  userId?: string,
  dateOverride?: string
): Promise<DailyMission[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedUserId = user?.id || userId;
    if (!resolvedUserId) return [];

    const todayStr = getLocalDateString(dateOverride);

    const { data, error } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", resolvedUserId)
      .eq("date", todayStr)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[DailyMissions] Error fetching daily missions:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return await reconcileMissionsWithSessions(
        resolvedUserId,
        todayStr,
        data as DailyMission[],
        existingRecentSessions,
        supabase
      );
    }

    // Automatically generate if no missions exist yet for today
    return await generateDailyMissions(resolvedUserId, todayStr, existingRecentSessions, supabase);
  } catch (err) {
    console.error("[DailyMissions] Exception in getTodayMissions:", err);
    return [];
  }
}

export async function getAllCompletedMissions(userId?: string): Promise<DailyMission[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedUserId = user?.id || userId;
    if (!resolvedUserId) return [];

    const { data, error } = await supabase
      .from("daily_missions")
      .select("id, date, mission_type, title, target_value, current_value, completed, reward_xp, bonus_xp_awarded, created_at, updated_at, completed_at")
      .eq("user_id", resolvedUserId)
      .eq("completed", true);

    if (error) {
      console.error("[DailyMissions] Error fetching completed missions:", error.message);
      return [];
    }

    return (data || []) as DailyMission[];
  } catch (err) {
    console.error("[DailyMissions] Exception in getAllCompletedMissions:", err);
    return [];
  }
}

export async function generateMissionsForToday(dateOverride?: string): Promise<DailyMission[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const todayStr = getLocalDateString(dateOverride);
    return await generateDailyMissions(user.id, todayStr, undefined, supabase);
  } catch (err) {
    console.error("[DailyMissions] Exception in generateMissionsForToday:", err);
    return [];
  }
}

async function generateDailyMissions(
  userId: string,
  todayStr: string,
  existingRecentSessions?: { duration_seconds: number; started_at: string }[],
  passedSupabase?: Awaited<ReturnType<typeof createClient>>
): Promise<DailyMission[]> {
  const supabase = passedSupabase || (await createClient());

  let recentSessions: { duration_seconds: number; started_at: string }[] = [];

  if (existingRecentSessions && existingRecentSessions.length > 0) {
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    recentSessions = existingRecentSessions.filter(
      (s) => new Date(s.started_at).getTime() >= sevenDaysAgoMs
    );
  } else {
    // Bounded query for past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSessionsData } = await supabase
      .from("study_sessions")
      .select("duration_seconds, started_at")
      .eq("user_id", userId)
      .gte("started_at", sevenDaysAgo);

    recentSessions = recentSessionsData || [];
  }

  const totalDurationSeconds = recentSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const avgDurationMinutes = recentSessions.length > 0 ? Math.round((totalDurationSeconds / 60) / 7) : 0;
  const avgSessionsPerDay = recentSessions.length > 0 ? Math.round(recentSessions.length / 7) : 0;

  // Determine personalized targets
  const studyTarget = Math.max(30, Math.ceil((avgDurationMinutes + 10) / 10) * 10);
  const sessionTarget = Math.max(1, avgSessionsPerDay + 1);
  const chapterTarget = 1;

  // Calculate baseline progress from today's sessions in IST
  const todaySessions = recentSessions.filter(
    (s) => getLocalISTDateString(s.started_at) === todayStr
  );
  const initialStudyMins = Math.floor(
    todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  const initialSessionCount = todaySessions.length;
  const nowIso = new Date().toISOString();

  const missionsToInsert = [
    {
      user_id: userId,
      date: todayStr,
      mission_type: "study_duration" as MissionType,
      title: `Study for ${studyTarget} minutes`,
      target_value: studyTarget,
      current_value: initialStudyMins,
      completed: initialStudyMins >= studyTarget,
      completed_at: initialStudyMins >= studyTarget ? nowIso : null,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    },
    {
      user_id: userId,
      date: todayStr,
      mission_type: "focus_sessions" as MissionType,
      title: `Complete ${sessionTarget} focus session${sessionTarget > 1 ? "s" : ""}`,
      target_value: sessionTarget,
      current_value: initialSessionCount,
      completed: initialSessionCount >= sessionTarget,
      completed_at: initialSessionCount >= sessionTarget ? nowIso : null,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    },
    {
      user_id: userId,
      date: todayStr,
      mission_type: "chapter_completion" as MissionType,
      title: `Complete ${chapterTarget} chapter`,
      target_value: chapterTarget,
      current_value: 0,
      completed: false,
      completed_at: null,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    },
  ];

  const { data, error } = await supabase
    .from("daily_missions")
    .upsert(missionsToInsert, { onConflict: "user_id,date,mission_type", ignoreDuplicates: true })
    .select();

  if (error || !data || data.length === 0) {
    console.warn("[DailyMissions] Insert conflict or fetch existing:", error?.message);
    const { data: existing } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .order("created_at", { ascending: true });
    return (existing || []) as DailyMission[];
  }

  return (data || []) as DailyMission[];
}

export async function updateMissionProgress(
  missionType: MissionType,
  valueToAdd: number,
  userId?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedUserId = user?.id || userId;
    if (!resolvedUserId) return;

    const todayStr = getLocalDateString();

    // Fetch the specific mission
    const { data: initialMission, error: fetchError } = await supabase
      .from("daily_missions")
      .select("id, completed, current_value, target_value")
      .eq("user_id", resolvedUserId)
      .eq("date", todayStr)
      .eq("mission_type", missionType)
      .maybeSingle();

    let mission = initialMission;

    // If no mission exists yet for today, generate today's missions first!
    if (!mission) {
      const generated = await generateDailyMissions(resolvedUserId, todayStr, undefined, supabase);
      mission = generated.find((m) => m.mission_type === missionType) || null;
      if (!mission) {
        if (fetchError) {
          console.error("[DailyMissions] Error fetching mission to update:", fetchError.message);
        }
        return;
      }
    }

    if (mission.completed) return;

    // Use Atomic RPC to prevent read-modify-write data loss
    const { data: updatedMission, error: updateError } = await supabase
      .rpc("increment_daily_mission", {
        p_mission_id: mission.id,
        p_amount: valueToAdd,
      });

    if (updateError) {
      console.error("[DailyMissions] Error updating mission progress via RPC:", updateError.message);
      return;
    }

    const isCompleted = updatedMission?.completed;

    if (isCompleted) {
      try {
        await NotificationService.createNotification({
          userId: resolvedUserId,
          type: "milestone",
          title: "Daily Mission Completed!",
          message: `Great work finishing today's ${missionType.replace("_", " ")} mission!`,
          metadata: { missionId: mission.id, date: todayStr },
        });
      } catch {
        // Non-critical notification failure
      }

      const { data: allMissions } = await supabase
        .from("daily_missions")
        .select("*")
        .eq("user_id", resolvedUserId)
        .eq("date", todayStr);

      if (allMissions && allMissions.every((m: DailyMission) => m.completed)) {
        const alreadyAwarded = allMissions.some((m: DailyMission) => m.bonus_xp_awarded);
        if (!alreadyAwarded) {
          await supabase
            .from("daily_missions")
            .update({ bonus_xp_awarded: true })
            .eq("user_id", resolvedUserId)
            .eq("date", todayStr);

          try {
            await NotificationService.createNotification({
              userId: resolvedUserId,
              type: "achievement",
              title: "All Daily Missions Finished!",
              message: "Perfect consistency! You completed all daily missions for today and earned bonus XP.",
              metadata: { date: todayStr, allCompleted: true },
            });
          } catch {
            // Non-critical notification failure
          }
        }
      }

      // Trigger achievement evaluation on mission progress / XP change
      import("@/features/achievements/services/achievements.service")
        .then(({ AchievementsService }) => AchievementsService.evaluateAchievements(resolvedUserId))
        .catch((achErr) => console.error("[DailyMissions] Error evaluating achievements:", achErr));
    }
  } catch (err) {
    console.error("[DailyMissions] Exception in updateMissionProgress:", err);
  }
}
