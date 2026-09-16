import { createClient } from "@/lib/supabase/client";
import { StudySession, ResumeState, ActivityType } from "../models/study-session";
import { calculateSessionXP } from "@/features/progress/config/xp-config";
import { getChapterUuid, getTopicUuid, getSubjectUuid } from "@/features/syllabus/services/mapping.service";
import { updateMissionProgress } from "@/features/daily-missions/services/missions.service";

export class SessionService {
  private static OFFLINE_QUEUE_KEY = "jee_pro_pending_sessions";
  private static isSyncingOfflineSessions = false;

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
    const xpEarned = calculateSessionXP(sessionData.durationSeconds, sessionData.activityType);

    console.info('[SessionService] Attempting to end session transactionally', {
      duration: sessionData.durationSeconds,
      xpEarned,
      activityType: sessionData.activityType
    });

    // Guard against corrupted session data (e.g. NaN or non-number duration)
    if (typeof sessionData.durationSeconds !== 'number' || !Number.isFinite(sessionData.durationSeconds) || sessionData.durationSeconds < 0) {
      console.error('[SessionService] Refusing to submit invalid session duration:', sessionData.durationSeconds);
      throw new Error(`Invalid durationSeconds: ${sessionData.durationSeconds}`);
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated.");
      }

      const isUuid = (str?: string | null): boolean =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      const rawChapterUuid = await getChapterUuid(sessionData.chapterId);
      const rawTopicUuid = await getTopicUuid(sessionData.sectionId);
      const validChapterId = isUuid(rawChapterUuid) ? rawChapterUuid : null;
      const validTopicId = isUuid(rawTopicUuid) ? rawTopicUuid : null;

      let rpcSuccess = false;

      // Layer 1: Attempt atomic transactional RPC
      try {
        const { error: rpcError } = await supabase.rpc('end_study_session_transaction', {
          p_user_id: user.id,
          p_duration_seconds: Math.floor(sessionData.durationSeconds),
          p_started_at: sessionData.startedAt,
          p_ended_at: sessionData.endedAt,
          p_chapter_id: validChapterId,
          p_topic_id: validTopicId,
          p_xp_earned: xpEarned
        });

        if (!rpcError) {
          rpcSuccess = true;
        } else {
          console.warn('[SessionService] RPC call failed, attempting direct table insert fallback:', rpcError.message || rpcError);
        }
      } catch (rpcErr) {
        console.warn('[SessionService] RPC exception, attempting direct table insert fallback:', rpcErr);
      }

      // Layer 2: Direct authenticated table insert fallback to guarantee zero data loss
      if (!rpcSuccess) {
        const { error: insertError } = await supabase
          .from("study_sessions")
          .insert({
            user_id: user.id,
            duration_seconds: Math.floor(sessionData.durationSeconds),
            started_at: sessionData.startedAt,
            ended_at: sessionData.endedAt,
            chapter_id: validChapterId,
            topic_id: validTopicId,
          });

        if (insertError) {
          console.error('[SessionService] Direct insert fallback failed:', insertError.message || insertError);
          throw insertError;
        }
        console.info('[SessionService] Session saved successfully via direct table fallback.');
      } else {
        console.info('[SessionService] Session ended successfully via RPC.');
      }

      // Update daily mission progress (non-blocking — don't fail the session save)
      try {
        const durationMins = Math.floor(sessionData.durationSeconds / 60);
        if (durationMins > 0) {
          await updateMissionProgress("study_duration", durationMins);
        }
        await updateMissionProgress("focus_sessions", 1);
      } catch (missionErr) {
        console.error('[SessionService] Mission progress update failed (non-critical):', missionErr);
      }

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : (error as { details?: string })?.details || String(error);
      console.error('[SessionService] Backend sync failed:', errorMsg);
      // Only queue offline if the duration itself is valid
      if (typeof sessionData.durationSeconds === 'number' && Number.isFinite(sessionData.durationSeconds) && sessionData.durationSeconds >= 0) {
        this.queueSessionForSync({ ...sessionData, xpEarned });
      }
      throw error; // Re-throw so caller can toast error
    }
  }

  /**
   * Offline Queueing Logic with Retry Counter
   */
  private static queueSessionForSync(session: Parameters<typeof SessionService.endSession>[0] & { xpEarned: number; _retries?: number }) {
    if (typeof session.durationSeconds !== 'number' || !Number.isFinite(session.durationSeconds) || session.durationSeconds < 0) {
      return; // Never store invalid sessions
    }
    try {
      const existing = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      const queue: Array<Parameters<typeof SessionService.endSession>[0] & { xpEarned: number; _retries?: number; _queuedAt?: string }> = existing ? JSON.parse(existing) : [];
      // Prevent duplicate queue entries
      const isDuplicate = queue.some((q) => q.startedAt === session.startedAt && q.durationSeconds === session.durationSeconds);
      if (!isDuplicate) {
        queue.push({ ...session, _retries: session._retries || 0, _queuedAt: new Date().toISOString() });
        localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (e) {
      console.error('[SessionService] Failed to write to localStorage', e);
    }
  }

  static async syncOfflineSessions(): Promise<void> {
    try {
      const existing = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      if (!existing) return;

      let queue: unknown[];
      try {
        queue = JSON.parse(existing);
      } catch {
        console.warn('[SessionService] Corrupt offline queue JSON, purging entirely.');
        localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
        return;
      }
      if (!Array.isArray(queue) || queue.length === 0) return;

      // Filter out any corrupted entries
      const isValid = (q: unknown): q is Parameters<typeof SessionService.endSession>[0] & { _retries?: number } => {
        const item = q as Record<string, unknown> | null;
        return (
          typeof item === 'object' && item !== null &&
          typeof item.durationSeconds === 'number' &&
          Number.isFinite(item.durationSeconds) &&
          item.durationSeconds > 0 &&
          typeof item.startedAt === 'string' &&
          typeof item.endedAt === 'string'
        );
      };

      type ValidQueuedSession = Parameters<typeof SessionService.endSession>[0] & { _retries?: number };
      const validQueue: ValidQueuedSession[] = queue.filter(isValid);
      if (validQueue.length !== queue.length) {
        console.warn(`[SessionService] Purged ${queue.length - validQueue.length} corrupt offline session(s).`);
        localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(validQueue));
      }
      if (validQueue.length === 0) {
        localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
        return;
      }

      // Prevent concurrent syncs
      if (this.isSyncingOfflineSessions) return;
      this.isSyncingOfflineSessions = true;

      console.info(`[SessionService] Found ${validQueue.length} offline sessions. Attempting sync...`);

      const removeFromQueue = (session: { startedAt: string; durationSeconds: number }) => {
        try {
          const raw = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
          if (!raw) return;
          const current: ValidQueuedSession[] = JSON.parse(raw);
          const updated = current.filter((q) => 
            !(q.startedAt === session.startedAt && q.durationSeconds === session.durationSeconds)
          );
          if (updated.length === 0) {
            localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
          } else {
            localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updated));
          }
        } catch { /* localStorage failure, ignore */ }
      };

      const updateRetryCount = (session: { startedAt: string; durationSeconds: number }, retries: number) => {
        try {
          const raw = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
          if (!raw) return;
          const current: ValidQueuedSession[] = JSON.parse(raw);
          const updated = current.map((q) => 
            (q.startedAt === session.startedAt && q.durationSeconds === session.durationSeconds)
              ? { ...q, _retries: retries }
              : q
          );
          localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updated));
        } catch { /* localStorage failure, ignore */ }
      };

      for (const session of validQueue) {
        try {
          await this.endSession(session);
          removeFromQueue(session);
        } catch (err) {
          const currentRetries = (session._retries || 0) + 1;
          if (currentRetries >= 3) {
            console.error('[SessionService] Dropping offline session after 3 failed retries to prevent loop:', session.startedAt, err);
            removeFromQueue(session);
          } else {
            console.warn(`[SessionService] Offline sync attempt ${currentRetries}/3 failed, retaining in queue:`, session.startedAt);
            updateRetryCount(session, currentRetries);
          }
        }
      }
      
      this.isSyncingOfflineSessions = false;
      console.info('[SessionService] Offline sync complete.');
    } catch (e) {
      this.isSyncingOfflineSessions = false;
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

    const isUuid = (str?: string | null) => 
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const subjectUuid = await getSubjectUuid(state.subjectId);
    const chapterUuid = await getChapterUuid(state.chapterId);
    const topicUuid = await getTopicUuid(state.sectionId);

    const { error } = await supabase
      .from("user_resume_state")
      .upsert({
        user_id: user.id,
        subject_id: subjectUuid || null,
        chapter_id: chapterUuid || null,
        section_id: topicUuid || null,
        activity_type: state.activityType || null,
        current_tab: state.currentTab || null,
        scroll_position: state.scrollPosition || 0,
        study_timer_seconds: state.studyTimerSeconds || 0,
        planner_event_id: isUuid(state.plannerEventId) ? state.plannerEventId : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("[SessionService] Error syncing resume state:", error.message || error.details || error.code || error);
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
