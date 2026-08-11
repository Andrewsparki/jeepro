import { UserTopicProgress, StudySession } from "@/features/study/services/progress";
import { Subject } from "@/features/syllabus/services/syllabus";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
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

export function generateXPEvents(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[],
  completedMissions: { reward_xp?: number; bonus_xp_awarded?: boolean; date?: string; completed_at?: string }[] = []
): XPEvent[] {
  const events: XPEvent[] = [];

  // 1. Session XP
  for (const session of sessions) {
    if (typeof session.xp_earned === 'number') {
      events.push({ timestamp: session.started_at, xp: session.xp_earned });
    } else {
      events.push({ 
        timestamp: session.started_at, 
        xp: calculateSessionXP(session.duration_seconds, session.activity_type as ActivityType | undefined) 
      });
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

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function calculateXPAndLevel(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[],
  completedMissions: { reward_xp?: number; bonus_xp_awarded?: boolean; date?: string }[] = []
): XPDetails {
  let totalXP = 0;

  // 1. Session XP
  // Rely on the database exact `xp_earned` to prevent any deviations!
  // If `xp_earned` is null (e.g. legacy row before the update), calculate exactly as fallback.
  for (const session of sessions) {
    if (typeof session.xp_earned === 'number') {
      totalXP += session.xp_earned;
    } else {
      totalXP += calculateSessionXP(session.duration_seconds, session.activity_type as ActivityType | undefined);
    }
  }

  // 2. Topic Milestone XP
  const masteredTopics = progress.filter(p => p.status === "Mastered").length;
  totalXP += masteredTopics * XP_CONFIG.MILESTONES.TOPIC_COMPLETED;

  // 3. Chapter XP
  let masteredChapters = 0;
  for (const subject of syllabus) {
    for (const chapter of subject.chapters) {
      if (chapter.completionPercentage === 100) {
        masteredChapters++;
      }
    }
  }
  totalXP += masteredChapters * XP_CONFIG.MILESTONES.CHAPTER_COMPLETED;

  // 4. Daily Missions XP
  for (const mission of completedMissions) {
    totalXP += mission.reward_xp || 0;
    // Add bonus XP once per unique date where all 3 missions were finished
    // We assume the DB correctly flags bonus_xp_awarded only when the criteria is met
  }
  
  const datesWithBonus = new Set(completedMissions.filter(m => m.bonus_xp_awarded).map(m => m.date));
  totalXP += datesWithBonus.size * XP_CONFIG.MILESTONES.ALL_DAILY_MISSIONS_COMPLETED;

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
    currentXP: totalXP, // Using total accumulated XP (could also display relative XP)
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
  let masteredChapters = 0;
  for (const subject of syllabus) {
    for (const chapter of subject.chapters) {
      if (chapter.completionPercentage === 100) {
        masteredChapters++;
      }
    }
  }

  const achievements: Achievement[] = [
    {
      id: "first_session",
      title: "First Steps",
      description: "Complete your first study session",
      icon: "play",
      unlocked: sessions.length >= 1
    },
    {
      id: "first_topic",
      title: "Knowledge Seeker",
      description: "Master your first topic",
      icon: "book-open",
      unlocked: masteredTopics >= 1
    },
    {
      id: "first_chapter",
      title: "Chapter Conquered",
      description: "Master all topics in a chapter",
      icon: "trophy",
      unlocked: masteredChapters >= 1
    },
    {
      id: "streak_7",
      title: "Consistent Scholar",
      description: "Achieve a 7-day study streak",
      icon: "flame",
      unlocked: streakDays >= 7
    },
    {
      id: "sessions_25",
      title: "Dedicated Learner",
      description: "Complete 25 study sessions",
      icon: "clock",
      unlocked: sessions.length >= 25
    },
    {
      id: "topics_100",
      title: "Century Master",
      description: "Master 100 topics",
      icon: "star",
      unlocked: masteredTopics >= 100
    }
  ];

  return achievements;
}
