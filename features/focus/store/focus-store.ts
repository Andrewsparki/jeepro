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
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'focus-storage',
      partialize: (state) => ({
        // Don't persist isImmersive so it resets on page reload
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
