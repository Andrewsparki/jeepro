"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveStudySession } from "@/features/study/services/progress";

interface StudySessionContextType {
  isActive: boolean;
  elapsedSeconds: number;
  chapterId?: string;
  topicId?: string;
  refreshKey: number;
  triggerRefresh: () => void;
  startSession: (chapterId?: string, topicId?: string) => void;
  endSession: () => Promise<void>;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chapterId, setChapterId] = useState<string | undefined>();
  const [topicId, setTopicId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0); // Incremented when session ends to trigger dashboard reload

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const startSession = (chId?: string, tId?: string) => {
    setChapterId(chId);
    setTopicId(tId);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsActive(true);
  };

  const endSession = async () => {
    if (!isActive || !startTime) return;

    setIsActive(false);
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    // Optimistic reset of UI
    setStartTime(null);
    setElapsedSeconds(0);
    
    if (duration >= 0) {
      await saveStudySession({
        durationSeconds: duration,
        startedAt: new Date(startTime).toISOString(),
        endedAt: new Date(endTime).toISOString(),
        chapterId,
        topicId
      });
      // Trigger a refresh for components listening to refreshKey
      triggerRefresh();
    }

    setChapterId(undefined);
    setTopicId(undefined);
  };

  return (
    <StudySessionContext.Provider
      value={{
        isActive,
        elapsedSeconds,
        chapterId,
        topicId,
        refreshKey,
        triggerRefresh,
        startSession,
        endSession,
      }}
    >
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
