"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { ActivityType } from "@/features/progress/config/xp-config";
import { SessionService } from "@/features/study-engine/services/session.service";
import { toast } from "sonner";
import { useSettings } from "@/providers/settings-provider";
import { trackEvent } from "@/features/analytics/services/telemetry.service";



interface StudySessionContextType {
  isActive: boolean;
  startTime: number | null;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  activityType?: ActivityType;
  refreshKey: number;
  triggerRefresh: () => void;
  startSession: (subjectId?: string, chapterId?: string, topicId?: string, activityType?: ActivityType) => void;
  endSession: (completionPercentage?: number) => Promise<void>;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

interface ActiveSession {
  startTime: number;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  activityType?: ActivityType;
}

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const { playSound } = useSettings();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Attempt to sync offline sessions on mount
  useEffect(() => {
    SessionService.syncOfflineSessions();
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const startSession = useCallback((subjectId?: string, chapterId?: string, topicId?: string, activityType?: ActivityType) => {
    playSound("pop-up");
    setSession({
      startTime: Date.now(),
      subjectId,
      chapterId,
      topicId,
      activityType,
    });

    SessionService.syncResumeState({
      subjectId,
      chapterId,
      sectionId: topicId,
      activityType,
      studyTimerSeconds: 0,
    });

    void trackEvent("study_start", "/study", {
      feature: "Study Workspace",
      metadata: {
        subjectId,
        chapterId,
        topicId,
        activityType,
      },
    });
  }, [playSound]);

  const isSavingRef = useRef(false);

  const endSession = useCallback(async (completionPercentage: number = 0) => {
    if (!session || isSavingRef.current) return;

    playSound("pop-down");
    isSavingRef.current = true;
    const currentSession = session;
    setSession(null);

    try {
      const endTime = Date.now();
      const duration = Math.floor((endTime - currentSession.startTime) / 1000);

      if (duration >= 0) {
        try {
          await SessionService.endSession({
            durationSeconds: duration,
            startedAt: new Date(currentSession.startTime).toISOString(),
            endedAt: new Date(endTime).toISOString(),
            subjectId: currentSession.subjectId,
            chapterId: currentSession.chapterId,
            sectionId: currentSession.topicId,
            activityType: currentSession.activityType,
            completionPercentage,
          });
          toast.success("Study session saved successfully!");
        } catch {
          toast.warning("Network issue: Session saved offline", {
            description: "We'll sync it automatically when you reconnect.",
          });
        }

        void trackEvent("study_complete", "/study", {
          feature: "Study Workspace",
          durationSeconds: duration,
          metadata: {
            completionPercentage,
            subjectId: currentSession.subjectId,
            chapterId: currentSession.chapterId,
            activityType: currentSession.activityType,
          },
        });

        triggerRefresh();
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [session, triggerRefresh, playSound]);

  const contextValue = React.useMemo(() => ({
    isActive: Boolean(session),
    startTime: session?.startTime ?? null,
    subjectId: session?.subjectId,
    chapterId: session?.chapterId,
    topicId: session?.topicId,
    activityType: session?.activityType,
    refreshKey,
    triggerRefresh,
    startSession,
    endSession,
  }), [session, refreshKey, triggerRefresh, startSession, endSession]);

  return (
    <StudySessionContext.Provider value={contextValue}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error("useStudySession must be used within a StudySessionProvider");
  }
  return context;
}

export function useStudyTimer() {
  const { isActive, startTime } = useStudySession();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive || !startTime) return;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  if (!isActive || !startTime) return 0;
  return Math.floor((now - startTime) / 1000);
}
