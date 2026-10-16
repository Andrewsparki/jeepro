export type MissionType =
  | 'study_duration'
  | 'focus_sessions'
  | 'chapter_completion'
  | 'pomodoro_sessions'
  | 'planner_completion';

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
