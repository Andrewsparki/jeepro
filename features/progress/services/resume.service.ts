import { createClient } from "@/lib/supabase/client";
import { ActivityType } from "../config/xp-config";

export interface UserResumeState {
  subject_id?: string;
  chapter_id?: string;
  section_id?: string;
  activity_type?: ActivityType;
  current_tab?: string;
  scroll_position?: number;
  study_timer_seconds?: number;
  planner_event_id?: string;
}

export async function saveResumeState(state: UserResumeState) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("user_resume_state")
    .upsert({
      user_id: user.id,
      subject_id: state.subject_id || null,
      chapter_id: state.chapter_id || null,
      section_id: state.section_id || null,
      activity_type: state.activity_type || null,
      current_tab: state.current_tab || null,
      scroll_position: state.scroll_position || 0,
      study_timer_seconds: state.study_timer_seconds || 0,
      planner_event_id: state.planner_event_id || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error("Error saving resume state:", error);
    return false;
  }
  return true;
}

export async function getResumeState(): Promise<UserResumeState | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_resume_state")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching resume state:", error);
    return null;
  }
  
  return data as UserResumeState | null;
}
