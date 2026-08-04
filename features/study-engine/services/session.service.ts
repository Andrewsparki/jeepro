import { createClient } from "@/lib/supabase/client";
import { StudySession, ResumeState, ActivityType } from "../models/study-session";
import { getXPForActivity } from "@/features/progress/config/xp-config";

export class SessionService {
  private static OFFLINE_QUEUE_KEY = "jee_pro_pending_sessions";

  /**
   * Initializes a new study session.
   */
  static async startSession(
    activityType: ActivityType,
    subjectId?: string,
    chapterId?: string
  ): Promise<Partial<StudySession>> {
    console.info('[SessionService] Starting session', { activityType, subjectId, chapterId });
    return {
      activityType,
      subjectId,
      chapterId,
      startTime: new Date()
    };
  }

  /**
   * Completes an active study session transactionally via Supabase RPC.
   * Includes offline fallback queueing.
   */
  static async endSession(sessionData: {
    durationSeconds: number;
    startedAt: string;
    endedAt: string;
    subjectId?: string;
    chapterId?: string;
    sectionId?: string;
    activityType?: ActivityType;
    completionPercentage?: number;
  }): Promise<void> {
    const xpEarned = sessionData.activityType ? getXPForActivity(sessionData.activityType) : 0;

    console.info('[SessionService] Attempting to end session transactionally', {
      duration: sessionData.durationSeconds,
      xpEarned,
      activityType: sessionData.activityType
    });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated.");
      }

      const { data, error } = await supabase.rpc('end_study_session_transaction', {
        p_user_id: user.id,
        p_duration_seconds: sessionData.durationSeconds,
        p_started_at: sessionData.startedAt,
        p_ended_at: sessionData.endedAt,
        p_chapter_id: sessionData.chapterId || null,
        p_topic_id: sessionData.sectionId || null,
        p_xp_earned: xpEarned
      });

      if (error) {
        console.error('[SessionService] RPC Error:', error);
        throw error;
      }

      if (!data) {
        throw new Error("Transaction rolled back or failed on the database level.");
      }

      console.info('[SessionService] Session ended successfully.');

    } catch (error) {
      console.error('[SessionService] Backend sync failed, queueing offline:', error);
      this.queueSessionForSync({ ...sessionData, xpEarned });
      throw error; // Re-throw so caller can toast error
    }
  }

  /**
   * Offline Queueing Logic
   */
  private static queueSessionForSync(session: Parameters<typeof SessionService.endSession>[0] & { xpEarned: number }) {
    try {
      const existing = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({ ...session, _queuedAt: new Date().toISOString() });
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('[SessionService] Failed to write to localStorage', e);
    }
  }

  static async syncOfflineSessions(): Promise<void> {
    try {
      const existing = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      if (!existing) return;

      const queue = JSON.parse(existing);
      if (!Array.isArray(queue) || queue.length === 0) return;

      console.info(`[SessionService] Found ${queue.length} offline sessions. Attempting sync...`);

      const successful: string[] = [];
      for (const session of queue) {
        try {
          // Re-attempt without re-queueing on fail inside the loop
          await this.endSession(session);
          successful.push(session._queuedAt);
        } catch {
          console.warn('[SessionService] Sync failed for session:', session);
        }
      }

      // Remove successful from queue
      const remaining = queue.filter(q => !successful.includes(q._queuedAt));
      if (remaining.length === 0) {
        localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
        console.info('[SessionService] Offline sync complete.');
      } else {
        localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
      }
    } catch (e) {
      console.error('[SessionService] Error processing offline queue', e);
    }
  }

  /**
   * Persists the user's current view state for cross-device resumption.
   */
  static async syncResumeState(state: Partial<ResumeState>): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_resume_state")
      .upsert({
        user_id: user.id,
        subject_id: state.subjectId || null,
        chapter_id: state.chapterId || null,
        section_id: state.sectionId || null,
        activity_type: state.activityType || null,
        current_tab: state.currentTab || null,
        scroll_position: state.scrollPosition || 0,
        study_timer_seconds: state.studyTimerSeconds || 0,
        planner_event_id: state.plannerEventId || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("[SessionService] Error syncing resume state:", error);
    }
  }

  /**
   * Fetches the user's last known state to restore the workspace.
   */
  static async getResumeState(): Promise<ResumeState | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_resume_state")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("[SessionService] Error fetching resume state:", error);
      return null;
    }

    if (!data) return null;

    return {
      userId: data.user_id,
      subjectId: data.subject_id,
      chapterId: data.chapter_id,
      sectionId: data.section_id,
      activityType: data.activity_type,
      currentTab: data.current_tab,
      scrollPosition: data.scroll_position,
      studyTimerSeconds: data.study_timer_seconds,
      plannerEventId: data.planner_event_id,
      updatedAt: data.updated_at
    };
  }
}
