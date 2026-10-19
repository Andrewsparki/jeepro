import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro' | 'custom';
export type AmbientSound = 'rain' | 'library' | 'forest' | 'ocean' | 'brown' | 'white' | 'none';

interface FocusState {
  isImmersive: boolean;
  setIsImmersive: (isImmersive: boolean) => void;
  toggleImmersive: () => void;

  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;

  ambientSound: AmbientSound;
  setAmbientSound: (sound: AmbientSound) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;

  defaultStudyTime: number; // in seconds
  setDefaultStudyTime: (time: number) => void;
  
  defaultBreakTime: number; // in seconds
  setDefaultBreakTime: (time: number) => void;
  
  autoStartBreaks: boolean;
  setAutoStartBreaks: (auto: boolean) => void;
  
  autoStartNextSession: boolean;
  setAutoStartNextSession: (auto: boolean) => void;
  
  pomodoroCycles: number;
  setPomodoroCycles: (cycles: number) => void;

  // Runtime timer execution state (in-memory, survives internal route transitions)
  isActive: boolean;
  phase: 'study' | 'shortBreak' | 'longBreak';
  pomodoroCount: number;
  sessionAccumulated: number; // accumulated seconds in 'study' phase
  phaseAccumulated: number;   // accumulated seconds in current phase
  lastResumeTime: number | null; // epoch timestamp ms
  initialStartTime: string | null; // ISO string for session start
  totalCompletedSittingSeconds: number;
  isCompletionModalOpen: boolean;

  // Actions
  setIsActive: (isActive: boolean) => void;
  setPhase: (phase: 'study' | 'shortBreak' | 'longBreak') => void;
  setPomodoroCount: (count: number | ((prev: number) => number)) => void;
  setSessionAccumulated: (time: number | ((prev: number) => number)) => void;
  setPhaseAccumulated: (time: number | ((prev: number) => number)) => void;
  setLastResumeTime: (time: number | null) => void;
  setInitialStartTime: (iso: string | null) => void;
  setTotalCompletedSittingSeconds: (time: number | ((prev: number) => number)) => void;
  setIsCompletionModalOpen: (open: boolean) => void;
  togglePlayPause: () => void;
  restartTimer: () => void;
  handleTimerComplete: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isImmersive: false,
      setIsImmersive: (isImmersive) => set({ isImmersive }),
      toggleImmersive: () => set((state) => ({ isImmersive: !state.isImmersive })),

      timerMode: 'countdown',
      setTimerMode: (timerMode) => set({ timerMode }),

      ambientSound: 'none',
      setAmbientSound: (ambientSound) => set({ ambientSound }),
      soundVolume: 0.5,
      setSoundVolume: (soundVolume) => set({ soundVolume }),

      defaultStudyTime: 45 * 60, // 45 mins
      setDefaultStudyTime: (defaultStudyTime) => set({ defaultStudyTime }),

      defaultBreakTime: 5 * 60, // 5 mins
      setDefaultBreakTime: (defaultBreakTime) => set({ defaultBreakTime }),

      autoStartBreaks: false,
      setAutoStartBreaks: (autoStartBreaks) => set({ autoStartBreaks }),

      autoStartNextSession: false,
      setAutoStartNextSession: (autoStartNextSession) => set({ autoStartNextSession }),

      pomodoroCycles: 4,
      setPomodoroCycles: (pomodoroCycles) => set({ pomodoroCycles }),

      // Runtime timer defaults
      isActive: false,
      phase: 'study',
      pomodoroCount: 0,
      sessionAccumulated: 0,
      phaseAccumulated: 0,
      lastResumeTime: null,
      initialStartTime: null,
      totalCompletedSittingSeconds: 0,
      isCompletionModalOpen: false,

      setIsActive: (isActive) => set({ isActive }),
      setPhase: (phase) => set({ phase }),
      setPomodoroCount: (count) =>
        set((state) => ({
          pomodoroCount: typeof count === 'function' ? count(state.pomodoroCount) : count,
        })),
      setSessionAccumulated: (time) =>
        set((state) => ({
          sessionAccumulated:
            typeof time === 'function' ? time(state.sessionAccumulated) : time,
        })),
      setPhaseAccumulated: (time) =>
        set((state) => ({
          phaseAccumulated:
            typeof time === 'function' ? time(state.phaseAccumulated) : time,
        })),
      setLastResumeTime: (lastResumeTime) => set({ lastResumeTime }),
      setInitialStartTime: (initialStartTime) => set({ initialStartTime }),
      setTotalCompletedSittingSeconds: (time) =>
        set((state) => ({
          totalCompletedSittingSeconds:
            typeof time === 'function' ? time(state.totalCompletedSittingSeconds) : time,
        })),
      setIsCompletionModalOpen: (isCompletionModalOpen) => set({ isCompletionModalOpen }),

      togglePlayPause: () => {
        const state = get();
        const now = Date.now();
        if (!state.isActive) {
          const updates: Partial<FocusState> = {
            isActive: true,
            lastResumeTime: now,
          };
          if (state.phase === 'study' && state.sessionAccumulated === 0 && !state.initialStartTime) {
            updates.initialStartTime = new Date(now).toISOString();
          }
          set(updates);
        } else {
          const lrt = state.lastResumeTime || now;
          const delta = (now - lrt) / 1000;
          set({
            isActive: false,
            lastResumeTime: null,
            sessionAccumulated:
              state.phase === 'study' ? state.sessionAccumulated + delta : state.sessionAccumulated,
            phaseAccumulated: state.phaseAccumulated + delta,
          });
        }
      },

      restartTimer: () => {
        set({
          isActive: false,
          sessionAccumulated: 0,
          phaseAccumulated: 0,
          lastResumeTime: null,
          initialStartTime: null,
          phase: 'study',
          totalCompletedSittingSeconds: 0,
        });
      },

      handleTimerComplete: () => {
        const state = get();
        const now = Date.now();
        const lrt = state.lastResumeTime || now;
        const delta = state.isActive ? (now - lrt) / 1000 : 0;
        const currentStudySeconds =
          state.phase === 'study' ? state.sessionAccumulated + delta : state.sessionAccumulated;

        if (state.timerMode === 'pomodoro') {
          if (state.phase === 'study') {
            const nextCount = state.pomodoroCount + 1;
            const nextPhase = nextCount % state.pomodoroCycles === 0 ? 'longBreak' : 'shortBreak';
            set({
              isActive: false,
              lastResumeTime: null,
              phaseAccumulated: 0,
              sessionAccumulated: 0,
              initialStartTime: null,
              pomodoroCount: nextCount,
              phase: nextPhase,
              totalCompletedSittingSeconds:
                state.totalCompletedSittingSeconds + (currentStudySeconds >= 60 ? currentStudySeconds : 0),
            });
          } else {
            set({
              isActive: false,
              lastResumeTime: null,
              phaseAccumulated: 0,
              phase: 'study',
            });
          }
        } else {
          // Countdown complete
          set({
            isActive: false,
            lastResumeTime: null,
            phaseAccumulated: 0,
            sessionAccumulated: currentStudySeconds,
            isCompletionModalOpen: currentStudySeconds >= 60,
          });
        }
      },
    }),
    {
      name: 'focus-storage',
      partialize: (state) => ({
        // Don't persist runtime timer state or isImmersive so a browser restart starts fresh
        timerMode: state.timerMode,
        ambientSound: state.ambientSound,
        soundVolume: state.soundVolume,
        defaultStudyTime: state.defaultStudyTime,
        defaultBreakTime: state.defaultBreakTime,
        autoStartBreaks: state.autoStartBreaks,
        autoStartNextSession: state.autoStartNextSession,
        pomodoroCycles: state.pomodoroCycles,
      }),
    }
  )
);
