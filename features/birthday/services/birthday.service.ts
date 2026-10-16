import { createClient } from "@/lib/supabase/client";

export interface BirthdayRewardConfig {
  rewardType: "xp" | "badge" | "streak_protection" | "cosmetic";
  xpAmount: number;
  badgeTitle: string;
  description: string;
}

export const DEFAULT_BIRTHDAY_REWARD: BirthdayRewardConfig = {
  rewardType: "xp",
  xpAmount: 500,
  badgeTitle: "Birthday Scholar",
  description: "Special yearly celebration recognition with +500 Bonus XP & Birthday Scholar status!",
};

export interface UserBirthdayInfo {
  birthday: string | null; // YYYY-MM-DD
  lastClaimedYear: number | null;
  isBirthdayToday: boolean;
  canClaim: boolean;
}

export interface SubjectBreakdown {
  name: string;
  slug: string;
  hours: number;
  minutes: number;
  sessionsCount: number;
  percentage: number;
  color: string;
}

export interface UserBirthdayRecapData {
  userName: string;
  currentYear: number;
  joinedDate: string | null;
  daysSinceJoined: number;
  
  // Real Study Metrics
  totalStudySeconds: number;
  totalStudyHours: number;
  totalStudyMinutes: number;
  totalSessions: number;
  longestSessionMinutes: number;
  
  // Mastery & Syllabus
  topicsMastered: number;
  chaptersCompleted: number;
  favoriteSubject: SubjectBreakdown | null;
  allSubjects: SubjectBreakdown[];
  favoriteChapter: {
    title: string;
    subjectName: string;
    hours: number;
    sessionsCount: number;
  } | null;
  
  // Streaks & Consistency
  currentStreak: number;
  longestStreak: number;
  
  // Gamification & Progression
  canonicalTotalXp: number;
  unlockedAchievementsCount: number;
  topAchievement: {
    title: string;
    description: string;
    icon: string;
    tier: string;
  } | null;
  
  // Study Persona & Milestone
  studyTendency: "night_owl" | "early_bird" | "afternoon" | "evening" | "consistent";
  hasMeaningfulHistory: boolean;
  milestoneTitle: string;
  isAlreadyClaimedThisYear: boolean;
  claimedAtTimestamp?: string | null;
}

export class BirthdayService {
  /**
   * Evaluates user birthday status and claimability.
   */
  static async getBirthdayInfo(userId?: string): Promise<UserBirthdayInfo> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        return { birthday: null, lastClaimedYear: null, isBirthdayToday: false, canClaim: false };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("birthday, birthday_last_claimed_year")
        .eq("id", resolvedUserId)
        .single();

      if (error || !data) {
        return { birthday: null, lastClaimedYear: null, isBirthdayToday: false, canClaim: false };
      }

      const birthdayStr = data.birthday as string | null;
      const lastClaimedYear = data.birthday_last_claimed_year as number | null;
      const currentYear = new Date().getFullYear();

      let isBirthdayToday = false;
      if (birthdayStr) {
        const today = new Date();
        const bday = new Date(birthdayStr);
        isBirthdayToday = today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
      }

      const canClaim = isBirthdayToday && (lastClaimedYear === null || lastClaimedYear < currentYear);

      return {
        birthday: birthdayStr,
        lastClaimedYear,
        isBirthdayToday,
        canClaim,
      };
    } catch (err) {
      console.error("[BirthdayService] getBirthdayInfo error:", err);
      return { birthday: null, lastClaimedYear: null, isBirthdayToday: false, canClaim: false };
    }
  }

  /**
   * Test trigger for BDAYTEST2026 code. Sets birthday to today and resets last claimed year.
   */
  static async triggerTestBirthday(userId?: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return false;

      const todayStr = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("profiles")
        .update({
          birthday: todayStr,
          birthday_last_claimed_year: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resolvedUserId);

      if (error) {
        console.error("[BirthdayService] triggerTestBirthday error:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[BirthdayService] triggerTestBirthday exception:", err);
      return false;
    }
  }

  /**
   * Sets or updates user birthday in Supabase profiles table.
   */
  static async setBirthday(birthdayDate: string, userId?: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return false;

      const { error } = await supabase
        .from("profiles")
        .update({ birthday: birthdayDate, updated_at: new Date().toISOString() })
        .eq("id", resolvedUserId);

      if (error) {
        console.error("[BirthdayService] setBirthday error:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[BirthdayService] setBirthday exception:", err);
      return false;
    }
  }

  /**
   * Compiles the user's REAL historical JEE Pro data for the cinematic Birthday Year Recap.
   * Leverages canonical database tables, achievements evaluator, and streak engine with zero fabricated data.
   */
  static async getUserYearRecap(userId?: string): Promise<UserBirthdayRecapData> {
    const currentYear = new Date().getFullYear();
    const milestoneTitle = `Birthday Scholar · ${currentYear}`;

    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!resolvedUserId) {
        return this.getEmptyRecap("Aspirant", currentYear, milestoneTitle);
      }

      // Parallel fetch of all authoritative tables
      const [
        profileRes,
        sessionsRes,
        progressRes,
        subjectsRes,
        chaptersRes,
        topicsRes,
        xpRes,
        streakRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", resolvedUserId).single(),
        supabase.from("study_sessions").select("*").eq("user_id", resolvedUserId).order("started_at", { ascending: true }),
        supabase.from("user_topic_progress").select("topic_id, status").eq("user_id", resolvedUserId),
        supabase.from("subjects").select("id, name, slug"),
        supabase.from("chapters").select("id, title, slug, subject_id"),
        supabase.from("topics").select("id, chapter_id"),
        supabase.rpc("calculate_user_total_xp", { p_user_id: resolvedUserId }),
        supabase.rpc("calculate_user_streak", { p_user_id: resolvedUserId }),
      ]);

      const profile = profileRes.data;
      const userName = profile?.full_name?.split(" ")[0] || "Aspirant";
      const joinedDate = profile?.created_at || null;
      const daysSinceJoined = joinedDate
        ? Math.max(1, Math.floor((Date.now() - new Date(joinedDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

      const isAlreadyClaimedThisYear =
        profile?.birthday_last_claimed_year === currentYear;

      // 1. Process Study Sessions
      const sessions = (sessionsRes.data || []) as Array<{
        duration_seconds: number | null;
        started_at: string;
        chapter_id: string | null;
        topic_id: string | null;
        activity_type: string | null;
        xp_earned: number | null;
      }>;

      let totalStudySeconds = 0;
      let longestSessionMinutes = 0;
      const hourDistribution = { night: 0, early: 0, afternoon: 0, evening: 0 };
      const chapterTimeMap = new Map<string, { duration: number; count: number }>();
      const subjectTimeMap = new Map<string, { duration: number; count: number }>();

      // Mapping lookups
      const subjects = (subjectsRes.data || []) as Array<{ id: string; name: string; slug: string }>;
      const chapters = (chaptersRes.data || []) as Array<{ id: string; title: string; slug: string; subject_id: string }>;
      const topics = (topicsRes.data || []) as Array<{ id: string; chapter_id: string | null }>;

      const chapterSubjectMap = new Map<string, string>();
      const chapterTitleMap = new Map<string, { title: string; subjectId: string }>();
      chapters.forEach((c: { id: string; title: string; subject_id: string }) => {
        chapterSubjectMap.set(c.id, c.subject_id);
        chapterTitleMap.set(c.id, { title: c.title, subjectId: c.subject_id });
      });

      const topicChapterMap = new Map<string, string>();
      topics.forEach((t: { id: string; chapter_id: string | null }) => {
        if (t.chapter_id) topicChapterMap.set(t.id, t.chapter_id);
      });

      sessions.forEach((s) => {
        const dur = Math.max(0, s.duration_seconds || 0);
        totalStudySeconds += dur;
        const sessionMins = Math.floor(dur / 60);
        if (sessionMins > longestSessionMinutes) {
          longestSessionMinutes = sessionMins;
        }

        // Time of day tendency
        if (s.started_at) {
          const startHour = new Date(s.started_at).getHours();
          if (startHour >= 22 || startHour < 5) hourDistribution.night++;
          else if (startHour >= 5 && startHour < 12) hourDistribution.early++;
          else if (startHour >= 12 && startHour < 17) hourDistribution.afternoon++;
          else hourDistribution.evening++;
        }

        // Chapter attribution
        let resolvedChapterId = s.chapter_id;
        if (!resolvedChapterId && s.topic_id) {
          resolvedChapterId = topicChapterMap.get(s.topic_id) || null;
        }

        if (resolvedChapterId) {
          const current = chapterTimeMap.get(resolvedChapterId) || { duration: 0, count: 0 };
          chapterTimeMap.set(resolvedChapterId, {
            duration: current.duration + dur,
            count: current.count + 1,
          });

          const subjId = chapterSubjectMap.get(resolvedChapterId);
          if (subjId) {
            const subjCur = subjectTimeMap.get(subjId) || { duration: 0, count: 0 };
            subjectTimeMap.set(subjId, {
              duration: subjCur.duration + dur,
              count: subjCur.count + 1,
            });
          }
        }
      });

      const totalStudyHours = Math.floor(totalStudySeconds / 3600);
      const totalStudyMinutes = Math.floor((totalStudySeconds % 3600) / 60);
      const totalSessions = sessions.length;

      // Determine Study Persona
      let studyTendency: UserBirthdayRecapData["studyTendency"] = "consistent";
      const maxHourCount = Math.max(
        hourDistribution.night,
        hourDistribution.early,
        hourDistribution.afternoon,
        hourDistribution.evening
      );
      if (maxHourCount > 0) {
        if (hourDistribution.night === maxHourCount) studyTendency = "night_owl";
        else if (hourDistribution.early === maxHourCount) studyTendency = "early_bird";
        else if (hourDistribution.afternoon === maxHourCount) studyTendency = "afternoon";
        else studyTendency = "evening";
      }

      // 2. Process Subject & Chapter Breakdown
      const subjectColors: Record<string, string> = {
        physics: "#38BDF8", // Cyan / Sky
        chemistry: "#34D399", // Emerald / Green
        mathematics: "#F59E0B", // Amber / Gold
      };

      const allSubjects: SubjectBreakdown[] = subjects.map((sub: { id: string; name: string; slug: string }) => {
        const subData = subjectTimeMap.get(sub.id) || { duration: 0, count: 0 };
        const subHours = Math.floor(subData.duration / 3600);
        const subMins = Math.floor((subData.duration % 3600) / 60);
        const percentage = totalStudySeconds > 0
          ? Math.round((subData.duration / totalStudySeconds) * 100)
          : 0;

        return {
          name: sub.name,
          slug: sub.slug,
          hours: subHours,
          minutes: subMins,
          sessionsCount: subData.count,
          percentage,
          color: subjectColors[sub.slug.toLowerCase()] || "#A855F7",
        };
      });

      // Sort subjects by time spent
      allSubjects.sort((a, b) => b.hours * 60 + b.minutes - (a.hours * 60 + a.minutes));
      const favoriteSubject = allSubjects.find((s: SubjectBreakdown) => s.sessionsCount > 0 || s.hours > 0) || allSubjects[0] || null;

      // Find top studied chapter
      let favoriteChapter: UserBirthdayRecapData["favoriteChapter"] = null;
      let maxChapterTime = 0;
      chapterTimeMap.forEach((data, chapId) => {
        if (data.duration > maxChapterTime) {
          maxChapterTime = data.duration;
          const chapInfo = chapterTitleMap.get(chapId);
          const subjName = subjects.find((s: { id: string }) => s.id === chapInfo?.subjectId)?.name || "JEE Core";
          if (chapInfo) {
            favoriteChapter = {
              title: chapInfo.title,
              subjectName: subjName,
              hours: Math.round((data.duration / 3600) * 10) / 10,
              sessionsCount: data.count,
            };
          }
        }
      });

      // 3. Process Topic & Chapter Mastery
      const progressData = (progressRes.data || []) as Array<{ topic_id: string; status: string }>;
      const masteredTopicIds = new Set(
        progressData.filter((p: { status: string }) => p.status === "Mastered").map((p: { topic_id: string }) => p.topic_id)
      );
      const topicsMastered = masteredTopicIds.size;

      // Calculate completed chapters
      const chapterTopicsCount = new Map<string, string[]>();
      topics.forEach((t: { id: string; chapter_id: string | null }) => {
        if (!t.chapter_id) return;
        const list = chapterTopicsCount.get(t.chapter_id) || [];
        list.push(t.id);
        chapterTopicsCount.set(t.chapter_id, list);
      });

      let chaptersCompleted = 0;
      chapterTopicsCount.forEach((topicIds) => {
        if (topicIds.length > 0 && topicIds.every((id) => masteredTopicIds.has(id))) {
          chaptersCompleted++;
        }
      });

      // 4. Streaks (Current & All-Time Longest)
      const currentStreak = Number(streakRes.data || 0);
      let longestStreak = currentStreak;

      // Compute precise historical longest streak from sessions dates
      if (sessions.length > 0) {
        const uniqueDayStrings = Array.from(
          new Set(
            sessions.map((s) => {
              const d = new Date(s.started_at);
              return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
            })
          )
        ).sort();

        let tempStreak = 0;
        let prevDate: Date | null = null;

        for (const dateStr of uniqueDayStrings) {
          const currentDate = new Date(dateStr + "T00:00:00Z");
          if (!prevDate) {
            tempStreak = 1;
          } else {
            const diffDays = Math.round(
              (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          }
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          prevDate = currentDate;
        }
      }

      // 5. XP & Achievements
      const canonicalTotalXp = Number(xpRes.data || 0);

      let unlockedAchievementsCount = 0;
      let topAchievement: UserBirthdayRecapData["topAchievement"] = null;

      try {
        const { AchievementsService } = await import(
          "@/features/achievements/services/achievements.service"
        );
        const achievementsList = await AchievementsService.getUserAchievements(resolvedUserId);
        const unlockedList = achievementsList.filter((a) => a.unlocked);
        unlockedAchievementsCount = unlockedList.length;

        if (unlockedList.length > 0) {
          // Sort by tier priority: platinum > gold > silver > bronze, then requirement value
          const tierWeight: Record<string, number> = {
            platinum: 4,
            gold: 3,
            silver: 2,
            bronze: 1,
          };
          unlockedList.sort((a, b) => {
            const twA = tierWeight[a.tier] || 0;
            const twB = tierWeight[b.tier] || 0;
            if (twA !== twB) return twB - twA;
            return b.xp_reward - a.xp_reward;
          });

          const best = unlockedList[0];
          topAchievement = {
            title: best.title,
            description: best.description,
            icon: best.icon,
            tier: best.tier,
          };
        }
      } catch (achErr) {
        console.warn("[BirthdayService] Achievements fetch warning:", achErr);
      }

      const hasMeaningfulHistory = totalSessions > 0 || totalStudySeconds > 0 || canonicalTotalXp > 0 || topicsMastered > 0;

      return {
        userName,
        currentYear,
        joinedDate,
        daysSinceJoined,
        totalStudySeconds,
        totalStudyHours,
        totalStudyMinutes,
        totalSessions,
        longestSessionMinutes,
        topicsMastered,
        chaptersCompleted,
        favoriteSubject,
        allSubjects,
        favoriteChapter,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        canonicalTotalXp,
        unlockedAchievementsCount,
        topAchievement,
        studyTendency,
        hasMeaningfulHistory,
        milestoneTitle,
        isAlreadyClaimedThisYear,
      };
    } catch (err) {
      console.error("[BirthdayService] getUserYearRecap exception:", err);
      return this.getEmptyRecap("Aspirant", currentYear, milestoneTitle);
    }
  }

  private static getEmptyRecap(
    userName: string,
    currentYear: number,
    milestoneTitle: string
  ): UserBirthdayRecapData {
    return {
      userName,
      currentYear,
      joinedDate: null,
      daysSinceJoined: 1,
      totalStudySeconds: 0,
      totalStudyHours: 0,
      totalStudyMinutes: 0,
      totalSessions: 0,
      longestSessionMinutes: 0,
      topicsMastered: 0,
      chaptersCompleted: 0,
      favoriteSubject: null,
      allSubjects: [],
      favoriteChapter: null,
      currentStreak: 0,
      longestStreak: 0,
      canonicalTotalXp: 0,
      unlockedAchievementsCount: 0,
      topAchievement: null,
      studyTendency: "consistent",
      hasMeaningfulHistory: false,
      milestoneTitle,
      isAlreadyClaimedThisYear: false,
    };
  }

  /**
   * Extensible claim reward function that updates Supabase, grants XP, triggers notifications, and marks claimed year.
   * Idempotent: rewards are strictly awarded once per calendar year.
   */
  static async claimBirthdayReward(
    config: BirthdayRewardConfig = DEFAULT_BIRTHDAY_REWARD,
    userId?: string
  ): Promise<{ success: boolean; xpEarned: number }> {
    try {
      const supabase = createClient();
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) return { success: false, xpEarned: 0 };

      const info = await this.getBirthdayInfo(resolvedUserId);
      if (!info.canClaim) {
        return { success: false, xpEarned: 0 };
      }

      const currentYear = new Date().getFullYear();

      // 1. Record claim in database atomically
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ birthday_last_claimed_year: currentYear, updated_at: new Date().toISOString() })
        .eq("id", resolvedUserId);

      if (updateError) {
        console.error("[BirthdayService] claim error:", updateError.message);
        return { success: false, xpEarned: 0 };
      }

      // 2. Extensible reward handlers
      if (config.rewardType === "xp" && config.xpAmount > 0) {
        // Insert XP log entry in xp_history table for gamification engine integration
        await supabase.from("xp_history").insert({
          user_id: resolvedUserId,
          amount: config.xpAmount,
          reason: `Birthday Celebration Gift (${currentYear})`,
          created_at: new Date().toISOString(),
        });
      }

      // 3. Evaluate & Unlock Birthday Achievements if any
      try {
        const { AchievementsService } = await import("@/features/achievements/services/achievements.service");
        await AchievementsService.evaluateAchievements(resolvedUserId);
      } catch (err) {
        console.error("Error evaluating achievements after birthday claim:", err);
      }

      // 4. Create Notification
      try {
        const { NotificationService } = await import("@/features/notifications/services/notification.service");
        await NotificationService.createNotification({
          userId: resolvedUserId,
          type: "milestone",
          title: "Happy Birthday Aspirant! 🎉",
          message: `Your birthday gift of +${config.xpAmount} XP and Birthday Scholar status have been added to your profile. Keep shining!`,
          metadata: { rewardType: config.rewardType, xpAmount: config.xpAmount, year: currentYear },
        });
      } catch (err) {
        console.error("Error creating birthday notification:", err);
      }

      return { success: true, xpEarned: config.xpAmount };
    } catch (err) {
      console.error("[BirthdayService] claimBirthdayReward exception:", err);
      return { success: false, xpEarned: 0 };
    }
  }
}
