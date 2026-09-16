import { createClient } from "@/lib/supabase/client";
import { XP_CONFIG } from "@/features/progress/config/xp-config";

export type MissionType = 'study_duration' | 'focus_sessions' | 'chapter_completion' | 'pomodoro_sessions' | 'planner_completion';

export interface DailyMission {
  id: string;
  user_id: string;
  date: string;
  mission_type: MissionType;
  title: string;
  target_value: number;
  current_value: number;
  completed: boolean;
  reward_xp: number;
  bonus_xp_awarded: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function getTodayMissions(
  existingRecentSessions?: { duration_seconds: number; started_at: string }[]
): Promise<DailyMission[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const todayStr = getLocalDateString();

  const { data, error } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching daily missions:", error.message);
    return [];
  }

  if (data && data.length > 0) {
    return data as DailyMission[];
  }

  // Generate if they don't exist
  return await generateDailyMissions(user.id, todayStr, existingRecentSessions);
}

export async function getAllCompletedMissions(): Promise<DailyMission[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("daily_missions")
    .select("id, date, mission_type, title, target_value, current_value, completed, reward_xp, bonus_xp_awarded, created_at, updated_at, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (error) {
    console.error("Error fetching completed missions:", error.message);
    return [];
  }

  return data as DailyMission[];
}

async function generateDailyMissions(
  userId: string,
  todayStr: string,
  existingRecentSessions?: { duration_seconds: number; started_at: string }[]
): Promise<DailyMission[]> {
  const supabase = createClient();
  
  let recentSessions: { duration_seconds: number; started_at: string }[] = [];

  if (existingRecentSessions) {
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    recentSessions = existingRecentSessions.filter(
      (s) => new Date(s.started_at).getTime() >= sevenDaysAgoMs
    );
  } else {
    // Bounded query for past 7 days only
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

  // Determine targets
  const studyTarget = Math.max(30, Math.ceil((avgDurationMinutes + 10) / 10) * 10);
  const sessionTarget = Math.max(1, avgSessionsPerDay + 1);
  const chapterTarget = 1;

  const missionsToInsert = [
    {
      user_id: userId,
      date: todayStr,
      mission_type: 'study_duration' as MissionType,
      title: `Study for ${studyTarget} minutes`,
      target_value: studyTarget,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    },
    {
      user_id: userId,
      date: todayStr,
      mission_type: 'focus_sessions' as MissionType,
      title: `Complete ${sessionTarget} focus session${sessionTarget > 1 ? 's' : ''}`,
      target_value: sessionTarget,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    },
    {
      user_id: userId,
      date: todayStr,
      mission_type: 'chapter_completion' as MissionType,
      title: `Complete ${chapterTarget} chapter`,
      target_value: chapterTarget,
      reward_xp: XP_CONFIG.MILESTONES.DAILY_MISSION_COMPLETED,
    }
  ];

  const { data, error } = await supabase
    .from("daily_missions")
    .upsert(missionsToInsert, { onConflict: 'user_id,date,mission_type' })
    .select();

  if (error) {
    console.warn("Daily missions insert conflict, re-fetching:", error.message);
    // Race condition: another call already inserted. Just re-fetch.
    const { data: existing } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .order("created_at", { ascending: true });
    return (existing || []) as DailyMission[];
  }

  return data as DailyMission[];
}

export async function updateMissionProgress(missionType: MissionType, valueToAdd: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const todayStr = getLocalDateString();

  // Fetch the specific mission's ID
  const { data: mission, error: fetchError } = await supabase
    .from("daily_missions")
    .select("id, completed")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .eq("mission_type", missionType)
    .single();

  if (fetchError || !mission) {
    if (fetchError?.code !== 'PGRST116') { // Not found
      console.error("Error fetching mission to update:", fetchError?.message);
    }
    return;
  }

  if (mission.completed) return; // Already finished, avoid RPC call if possible

  // Use Atomic RPC to prevent read-modify-write data loss
  const { data: updatedMission, error: updateError } = await supabase
    .rpc("increment_daily_mission", {
      p_mission_id: mission.id,
      p_amount: valueToAdd
    });

  if (updateError) {
    console.error("Error updating mission progress via RPC:", updateError.message);
    return;
  }

  const isCompleted = updatedMission?.completed;

  // XP is calculated on the fly in gamification.ts by summing all completed missions
  // However, we should still handle the bonus xp awarded state if all are completed
  if (isCompleted) {
    const { data: allMissions } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr);

    if (allMissions && allMissions.every((m: DailyMission) => m.completed)) {
      const alreadyAwarded = allMissions.some((m: DailyMission) => m.bonus_xp_awarded);
      if (!alreadyAwarded) {
        await supabase
          .from("daily_missions")
          .update({ bonus_xp_awarded: true })
          .eq("user_id", user.id)
          .eq("date", todayStr);
      }
    }
  }
}
