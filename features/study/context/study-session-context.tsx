"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { ActivityType } from "@/features/progress/config/xp-config";
import { SessionService } from "@/features/study-engine/services/session.service";
import { toast } from "sonner";

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

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [chapterId, setChapterId] = useState<string | undefined>();
  const [topicId, setTopicId] = useState<string | undefined>();
  const [activityType, setActivityType] = useState<ActivityType | undefined>();
  
  const [refreshKey, setRefreshKey] = useState(0);

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
    startTime,
    subjectId,
    chapterId,
    topicId,
    activityType,
    refreshKey,
    triggerRefresh,
    startSession,
    endSession,
  }), [isActive, startTime, subjectId, chapterId, topicId, activityType, refreshKey, triggerRefresh, startSession, endSession]);

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
