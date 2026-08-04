export type ProgressStatus = 'Not Started' | 'In Progress' | 'Mastered' | 'Needs Revision';

export interface MasteryNode {
  id: string;
  userId: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string;
  status: ProgressStatus;
  progressPercentage: number;
  sessionsCompleted: number;
  revisionCount: number;
  lastStudiedAt?: Date;
}

export interface RevisionSchedule {
  nodeId: string;
  nextRevisionDate: Date;
  intervalDays: number;
  easeFactor: number;
}

export interface SubjectCompletion {
  subjectId: string;
  totalChapters: number;
  masteredChapters: number;
  overallPercentage: number;
}
