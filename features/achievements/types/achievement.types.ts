export type AchievementCategory = 'all' | 'study' | 'time' | 'streak' | 'progress' | 'xp';

export type AchievementRequirementType =
  | 'session_count'
  | 'study_hours'
  | 'streak_days'
  | 'topics_mastered'
  | 'chapters_mastered'
  | 'total_xp';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementItem {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'time' | 'streak' | 'progress' | 'xp';
  tier: AchievementTier;
  requirement_type: AchievementRequirementType;
  requirement_value: number;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string | null;
  current_progress: number;
  progress_percentage: number;
}

export interface AchievementStats {
  total: number;
  unlockedCount: number;
  totalXpEarned: number;
  overallPercentage: number;
}
