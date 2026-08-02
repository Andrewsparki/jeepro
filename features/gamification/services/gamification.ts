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
  nextLevelXP: number;
  progressPercentage: number;
}

export const XP_CONSTANTS = {
  SESSION_COMPLETED: 20,
  TOPIC_MASTERED: 50,
  CHAPTER_MASTERED: 200,
  BASE_LEVEL_XP: 500, // XP needed for level 2
  LEVEL_MULTIPLIER: 1.5, // Each level takes 1.5x more XP
};

export function calculateXPAndLevel(
  sessions: StudySession[],
  progress: UserTopicProgress[],
  syllabus: Subject[]
): XPDetails {
  let totalXP = 0;

  // 1. Session XP
  totalXP += sessions.length * XP_CONSTANTS.SESSION_COMPLETED;

  // 2. Topic XP
  const masteredTopics = progress.filter(p => p.status === "Mastered").length;
  totalXP += masteredTopics * XP_CONSTANTS.TOPIC_MASTERED;

  // 3. Chapter XP
  let masteredChapters = 0;
  for (const subject of syllabus) {
    for (const chapter of subject.chapters) {
      if (chapter.completionPercentage === 100) {
        masteredChapters++;
      }
    }
  }
  totalXP += masteredChapters * XP_CONSTANTS.CHAPTER_MASTERED;

  // Calculate Level
  let currentLevel = 1;
  let xpForNextLevel = XP_CONSTANTS.BASE_LEVEL_XP;
  let xpRemaining = totalXP;

  while (xpRemaining >= xpForNextLevel) {
    xpRemaining -= xpForNextLevel;
    currentLevel++;
    xpForNextLevel = Math.floor(xpForNextLevel * XP_CONSTANTS.LEVEL_MULTIPLIER);
  }

  const progressPercentage = Math.min(100, Math.round((xpRemaining / xpForNextLevel) * 100));

  return {
    currentLevel,
    currentXP: totalXP, // Using total accumulated XP (could also display relative XP)
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
