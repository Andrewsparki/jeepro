export type ActivityType = 
  | 'Study Guide' 
  | 'Formula Sheet' 
  | 'Practice' 
  | 'PYQs' 
  | 'Flashcards' 
  | 'AI Tutor' 
  | 'Revision' 
  | 'Mock Test' 
  | 'Planner';

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  chapterId?: string;
  sectionId?: string;
  activityType: ActivityType;
  startTime: Date;
  endTime?: Date;
  timeSpentSeconds: number;
  xpEarned: number;
}

export interface SessionAction {
  type: 'PAUSE' | 'RESUME' | 'COMPLETE' | 'ABORT';
  timestamp: Date;
}

export interface ResumeState {
  userId: string;
  subjectId?: string;
  chapterId?: string;
  sectionId?: string;
  activityType?: ActivityType;
  currentTab?: string;
  scrollPosition: number;
  studyTimerSeconds: number;
  plannerEventId?: string;
  updatedAt: Date;
}
