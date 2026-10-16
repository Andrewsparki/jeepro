import { UserTopicProgress, StudySession } from "@/features/study/services/progress";
import { Subject } from "@/features/syllabus/services/syllabus";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
  category?: string;
  current_progress?: number;
  requirement_value?: number;
  progress_percentage?: number;
  requirement_type?: string;
  xp_reward?: number;
}

export interface XPDetails {
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  progressPercentage: number;
}

import { XP_CONFIG, calculateSessionXP, ActivityType } from "@/features/progress/config/xp-config";

export const XP_CONSTANTS = {
  // We keep these for backward compatibility in imports, but they pull from central config
  SESSION_COMPLETED: 20, // deprecated, don't use
  TOPIC_MASTERED: XP_CONFIG.MILESTONES.TOPIC_COMPLETED,
  CHAPTER_MASTERED: XP_CONFIG.MILESTONES.CHAPTER_COMPLETED,
  BASE_LEVEL_XP: XP_CONFIG.LEVELING.BASE_LEVEL_XP,
  LEVEL_MULTIPLIER: XP_CONFIG.LEVELING.LEVEL_MULTIPLIER,
};

export interface XPEvent {
  timestamp: string; // ISO String
  xp: number;
}

export function getSessionXP(session: StudySession): number {
  return typeof session.xp_earned === "number" && session.xp_earned > 0
    ? session.xp_earned
    : calculateSessionXP(session.duration_seconds, session.activity_type as ActivityType | undefined);
}

function countMasteredChapters(syllabus: Subject[]): number {
  let count = 0;
  for (const subject of syllabus) {
    for (const chapter of subject.chapters) {
      if (chapter.completionPercentage === 100) count++;
    }
  }
  return count;
}

export function generateXPEvents(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[],
  completedMissions: { reward_xp?: number; bonus_xp_awarded?: boolean; date?: string; completed_at?: string | null }[] = [],
  unlockedAchievements: { unlocked_at?: string | null; xp_reward?: number }[] = []
): XPEvent[] {
  const events: XPEvent[] = [];

  // 1. Session XP
  for (const session of sessions) {
    const xp = getSessionXP(session);
    if (xp > 0) {
      events.push({ timestamp: session.started_at, xp });
    }
  }

  // 2. Topic Milestone XP
  for (const p of progress) {
    if (p.status === "Mastered" && p.completed_at) {
      events.push({ timestamp: p.completed_at, xp: XP_CONFIG.MILESTONES.TOPIC_COMPLETED });
    }
  }

  // 3. Chapter XP
  for (const subject of syllabus) {
    for (const chapter of subject.chapters) {
      if (chapter.completionPercentage === 100) {
        // Find latest topic completion in this chapter
        const chapterTopicIds = new Set(chapter.topics.map(t => t.id));
        let latestDate = "2000-01-01T00:00:00.000Z";
        for (const p of progress) {
          if (p.status === "Mastered" && p.completed_at && chapterTopicIds.has(p.topic_id)) {
            if (p.completed_at > latestDate) latestDate = p.completed_at;
          }
        }
        if (latestDate !== "2000-01-01T00:00:00.000Z") {
          events.push({ timestamp: latestDate, xp: XP_CONFIG.MILESTONES.CHAPTER_COMPLETED });
        }
      }
    }
  }

  // 4. Daily Missions XP
  for (const mission of completedMissions) {
    if (mission.completed_at) {
      events.push({ timestamp: mission.completed_at, xp: mission.reward_xp || 0 });
    } else if (mission.date) {
      // Fallback if completed_at doesn't exist
      events.push({ timestamp: `${mission.date}T12:00:00.000Z`, xp: mission.reward_xp || 0 });
    }
  }
  
  const datesWithBonus = new Set(completedMissions.filter(m => m.bonus_xp_awarded).map(m => m.date));
  for (const date of Array.from(datesWithBonus)) {
    if (date) {
      // Attribute bonus to end of the day
      events.push({ timestamp: `${date}T23:59:59.000Z`, xp: XP_CONFIG.MILESTONES.ALL_DAILY_MISSIONS_COMPLETED });
    }
  }

  // 5. Achievement Rewards XP
  for (const ach of unlockedAchievements) {
    if (ach.xp_reward && ach.xp_reward > 0) {
      events.push({
        timestamp: ach.unlocked_at || new Date().toISOString(),
        xp: ach.xp_reward,
      });
    }
  }

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function calculateXPAndLevel(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[],
  completedMissions: { reward_xp?: number; bonus_xp_awarded?: boolean; date?: string }[] = [],
  achievementXP: number = 0,
  canonicalTotalXP?: number | null
): XPDetails {
  let totalXP = 0;

  if (typeof canonicalTotalXP === "number" && canonicalTotalXP > 0) {
    totalXP = canonicalTotalXP;
  } else {
    // 1. Session XP
    for (const session of sessions) {
      totalXP += getSessionXP(session);
    }

  // 2. Topic Milestone XP
  const masteredTopics = progress.filter(p => p.status === "Mastered").length;
  totalXP += masteredTopics * XP_CONFIG.MILESTONES.TOPIC_COMPLETED;

  // 3. Chapter XP
  totalXP += countMasteredChapters(syllabus) * XP_CONFIG.MILESTONES.CHAPTER_COMPLETED;

  // 4. Daily Missions XP
  for (const mission of completedMissions) {
    totalXP += mission.reward_xp || 0;
  }
  
  const datesWithBonus = new Set(completedMissions.filter(m => m.bonus_xp_awarded).map(m => m.date));
  totalXP += datesWithBonus.size * XP_CONFIG.MILESTONES.ALL_DAILY_MISSIONS_COMPLETED;

    // 5. Achievement Rewards XP
    totalXP += achievementXP;
  }

  // Calculate Level
  let currentLevel = 1;
  let xpForNextLevel = XP_CONFIG.LEVELING.BASE_LEVEL_XP;
  let xpRemaining = totalXP;

  while (xpRemaining >= xpForNextLevel) {
    xpRemaining -= xpForNextLevel;
    currentLevel++;
    xpForNextLevel = Math.floor(xpForNextLevel * XP_CONFIG.LEVELING.LEVEL_MULTIPLIER);
  }

  const progressPercentage = Math.min(100, Math.round((xpRemaining / xpForNextLevel) * 100));

  return {
    currentLevel,
    currentXP: totalXP,
    totalXP,
    nextLevelXP: totalXP - xpRemaining + xpForNextLevel,
    progressPercentage
  };
}

export function getAchievements(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[],
  streakDays: number
): Achievement[] {
  const masteredTopics = progress.filter(p => p.status === "Mastered").length;
  const masteredChapters = countMasteredChapters(syllabus);
  const totalDurationSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const studyHours = Math.floor(totalDurationSeconds / 3600);

  const calculatePct = (current: number, target: number) =>
    target <= 0 ? 0 : Math.min(100, Math.round((current / target) * 100));

  const achievements: Achievement[] = [
    {
      id: "first_session",
      title: "First Steps",
      description: "Complete your first study session",
      icon: "play",
      category: "study",
      requirement_type: "session_count",
      requirement_value: 1,
      xp_reward: 50,
      current_progress: sessions.length,
      progress_percentage: calculatePct(sessions.length, 1),
      unlocked: sessions.length >= 1
    },
    {
      id: "session_10",
      title: "Getting in the Rhythm",
      description: "Complete 10 study sessions",
      icon: "zap",
      category: "study",
      requirement_type: "session_count",
      requirement_value: 10,
      xp_reward: 100,
      current_progress: sessions.length,
      progress_percentage: calculatePct(sessions.length, 10),
      unlocked: sessions.length >= 10
    },
    {
      id: "session_50",
      title: "Deep Focus Master",
      description: "Complete 50 study sessions",
      icon: "target",
      category: "study",
      requirement_type: "session_count",
      requirement_value: 50,
      xp_reward: 250,
      current_progress: sessions.length,
      progress_percentage: calculatePct(sessions.length, 50),
      unlocked: sessions.length >= 50
    },
    {
      id: "session_100",
      title: "Centurion Scholar",
      description: "Complete 100 study sessions",
      icon: "award",
      category: "study",
      requirement_type: "session_count",
      requirement_value: 100,
      xp_reward: 500,
      current_progress: sessions.length,
      progress_percentage: calculatePct(sessions.length, 100),
      unlocked: sessions.length >= 100
    },
    {
      id: "hours_1",
      title: "Hour of Power",
      description: "Accumulate 1 hour of total study time",
      icon: "clock",
      category: "time",
      requirement_type: "study_hours",
      requirement_value: 1,
      xp_reward: 50,
      current_progress: studyHours,
      progress_percentage: calculatePct(studyHours, 1),
      unlocked: studyHours >= 1
    },
    {
      id: "first_topic",
      title: "Concept Conqueror",
      description: "Master your first topic",
      icon: "book-open",
      category: "progress",
      requirement_type: "topics_mastered",
      requirement_value: 1,
      xp_reward: 50,
      current_progress: masteredTopics,
      progress_percentage: calculatePct(masteredTopics, 1),
      unlocked: masteredTopics >= 1
    },
    {
      id: "first_chapter",
      title: "Chapter Champion",
      description: "Master all topics in 1 full chapter",
      icon: "trophy",
      category: "progress",
      requirement_type: "chapters_mastered",
      requirement_value: 1,
      xp_reward: 100,
      current_progress: masteredChapters,
      progress_percentage: calculatePct(masteredChapters, 1),
      unlocked: masteredChapters >= 1
    },
    {
      id: "streak_3",
      title: "Building Momentum",
      description: "Maintain a 3-day study streak",
      icon: "flame",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 3,
      xp_reward: 50,
      current_progress: streakDays,
      progress_percentage: calculatePct(streakDays, 3),
      unlocked: streakDays >= 3
    },
    {
      id: "streak_7",
      title: "Unstoppable",
      description: "Maintain a 7-day study streak",
      icon: "flame",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 7,
      xp_reward: 150,
      current_progress: streakDays,
      progress_percentage: calculatePct(streakDays, 7),
      unlocked: streakDays >= 7
    }
  ];

  return achievements;
}
