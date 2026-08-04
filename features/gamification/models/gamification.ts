export interface XPMilestone {
  id: string;
  threshold: number;
  title: string;
  icon: string;
  rewardType: 'badge' | 'avatar' | 'title';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  category: 'study' | 'streak' | 'mastery' | 'revision';
  isSecret: boolean;
}

export interface UserStreak {
  userId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastStudyDate: Date;
}
