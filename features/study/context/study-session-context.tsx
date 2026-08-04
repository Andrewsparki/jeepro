"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { ActivityType } from "@/features/progress/config/xp-config";
import { SessionService } from "@/features/study-engine/services/session.service";
import { toast } from "sonner";

interface StudySessionContextType {
  isActive: boolean;
  elapsedSeconds: number;
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

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [chapterId, setChapterId] = useState<string | undefined>();
  const [topicId, setTopicId] = useState<string | undefined>();
  const [activityType, setActivityType] = useState<ActivityType | undefined>();
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Attempt to sync offline sessions on mount
  useEffect(() => {
    SessionService.syncOfflineSessions();
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const startSession = useCallback((subId?: string, chId?: string, tId?: string, actType?: ActivityType) => {
    setSubjectId(subId);
    setChapterId(chId);
    setTopicId(tId);
    setActivityType(actType);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsActive(true);

    // Save resume state when starting a session
    SessionService.syncResumeState({
      subjectId: subId,
      chapterId: chId,
      sectionId: tId,
      activityType: actType,
      studyTimerSeconds: 0
    });
  }, []);

  const isSavingRef = useRef(false);

  const endSession = useCallback(async (completionPercentage: number = 0) => {
    if (!isActive || !startTime || isSavingRef.current) return;

    isSavingRef.current = true;
    setIsActive(false);

    try {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      
      setStartTime(null);
      setElapsedSeconds(0);
      
      if (duration >= 0) {
        try {
          await SessionService.endSession({
            durationSeconds: duration,
            startedAt: new Date(startTime).toISOString(),
            endedAt: new Date(endTime).toISOString(),
            subjectId,
            chapterId,
            sectionId: topicId,
            activityType,
            completionPercentage
          });
          toast.success("Study session saved successfully!");
        } catch {
          toast.warning("Network issue: Session saved offline", {
            description: "We'll sync it automatically when you reconnect."
          });
        }
        triggerRefresh();
      }

      setSubjectId(undefined);
      setChapterId(undefined);
      setTopicId(undefined);
      setActivityType(undefined);
    } finally {
      isSavingRef.current = false;
    }
  }, [isActive, startTime, subjectId, chapterId, topicId, activityType, triggerRefresh]);

  const contextValue = React.useMemo(() => ({
    isActive,
    elapsedSeconds,
    subjectId,
    chapterId,
    topicId,
    activityType,
    refreshKey,
    triggerRefresh,
    startSession,
    endSession,
  }), [isActive, elapsedSeconds, subjectId, chapterId, topicId, activityType, refreshKey, triggerRefresh, startSession, endSession]);

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
