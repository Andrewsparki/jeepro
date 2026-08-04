export const XP_CONFIG = {
  // Activity base rewards
  ACTIVITIES: {
    STUDY_GUIDE: 5,
    FORMULA_SHEET: 8,
    PRACTICE: 15,
    PYQS: 20,
    FLASHCARDS: 10,
    REVISION: 12,
    MOCK_TEST: 50,
  },
  
  // Progression thresholds
  LEVELING: {
    BASE_LEVEL_XP: 500, // XP needed for Level 2
    LEVEL_MULTIPLIER: 1.5, // Scaling factor for next levels
  },
  
  // Streaks & Multipliers
  STREAK: {
    MILESTONE_DAYS: [7, 14, 30, 50, 100],
    MILESTONE_BONUS_XP: 100, // Flat bonus when hitting a milestone
  }
};

export type ActivityType = "Study Guide" | "Formula Sheet" | "Practice" | "PYQs" | "Flashcards" | "AI Tutor" | "Revision" | "Mock Test" | "Planner";

export function getXPForActivity(activity: ActivityType): number {
  switch (activity) {
    case "Study Guide": return XP_CONFIG.ACTIVITIES.STUDY_GUIDE;
    case "Formula Sheet": return XP_CONFIG.ACTIVITIES.FORMULA_SHEET;
    case "Practice": return XP_CONFIG.ACTIVITIES.PRACTICE;
    case "PYQs": return XP_CONFIG.ACTIVITIES.PYQS;
    case "Flashcards": return XP_CONFIG.ACTIVITIES.FLASHCARDS;
    case "Revision": return XP_CONFIG.ACTIVITIES.REVISION;
    case "Mock Test": return XP_CONFIG.ACTIVITIES.MOCK_TEST;
    default: return 0;
  }
}
