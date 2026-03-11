import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type PlayMode = "single" | "session" | "playlist";
export type RepeatMode = "off" | "one" | "all";

interface MainPlayerState {
  currentFrequency: number | null;
  currentSoundId: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  playMode: PlayMode;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  queue: Array<
    { type: "frequency"; id: number } | { type: "sound"; id: string }
  >;
  currentIndex: number;
  timeRemaining: number;
  totalDuration: number;
  sessionName?: string;
  selectedDuration: number; // in minutes
}

interface MainPlayerContextType extends MainPlayerState {
  playFrequency: (hz: number, mode?: PlayMode) => void;
  playSound: (soundId: string, mode?: PlayMode) => void;
  playQueue: (
    items: Array<
      { type: "frequency"; id: number } | { type: "sound"; id: string }
    >,
    mode: PlayMode,
    sessionName?: string,
  ) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setTimeRemaining: (
    timeOrUpdater: number | ((prev: number) => number),
  ) => void;
  setTotalDuration: (duration: number) => void;
  updateCurrentIndex: (index: number) => void;
  setSelectedDuration: (duration: number) => void;
}

const MainPlayerContext = createContext<MainPlayerContextType | undefined>(
  undefined,
);

export function MainPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MainPlayerState>({
    currentFrequency: null,
    currentSoundId: null,
    isPlaying: false,
    isPaused: false,
    playMode: "single",
    repeatMode: "off",
    shuffleEnabled: false,
    queue: [],
    currentIndex: 0,
    timeRemaining: 0,
    totalDuration: 0,
    selectedDuration: (() => {
      try {
        const stored = localStorage.getItem("fv_default_duration");
        if (stored) {
          const parsed = Number.parseInt(stored, 10);
          if (!Number.isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch {
        // ignore
      }
      return 15;
    })(),
  });

  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerStartRef = useRef<number>(0);
  const sleepTimerElapsedRef = useRef<number>(0);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    sleepTimerStartRef.current = 0;
    sleepTimerElapsedRef.current = 0;
  }, []);

  const startSleepTimer = useCallback(() => {
    clearSleepTimer();

    const durationMs = state.selectedDuration * 60 * 1000;
    sleepTimerStartRef.current = Date.now();
    sleepTimerElapsedRef.current = 0;

    // Initialize timeRemaining immediately
    setState((prev) => ({ ...prev, timeRemaining: durationMs }));

    sleepTimerRef.current = setInterval(() => {
      const elapsed =
        sleepTimerElapsedRef.current +
        (Date.now() - sleepTimerStartRef.current);

      const remaining = Math.max(0, durationMs - elapsed);

      if (elapsed >= durationMs) {
        // Fire fade-out event before resetting state
        window.dispatchEvent(new CustomEvent("fv:sleeptimer:expire"));
        // Time expired - delay state reset by 3.2s to allow fade out
        clearSleepTimer();
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentFrequency: null,
            currentSoundId: null,
            isPlaying: false,
            isPaused: false,
            queue: [],
            currentIndex: 0,
            timeRemaining: 0,
            totalDuration: 0,
            sessionName: undefined,
          }));
        }, 3200);
      } else {
        // Update countdown
        setState((prev) => ({ ...prev, timeRemaining: remaining }));
      }
    }, 1000);
  }, [state.selectedDuration, clearSleepTimer]);

  const pauseSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      sleepTimerElapsedRef.current += Date.now() - sleepTimerStartRef.current;
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  }, []);

  const resumeSleepTimer = useCallback(() => {
    if (sleepTimerElapsedRef.current > 0) {
      sleepTimerStartRef.current = Date.now();
      const durationMs = state.selectedDuration * 60 * 1000;

      sleepTimerRef.current = setInterval(() => {
        const elapsed =
          sleepTimerElapsedRef.current +
          (Date.now() - sleepTimerStartRef.current);

        const remaining = Math.max(0, durationMs - elapsed);

        if (elapsed >= durationMs) {
          // Fire fade-out event before resetting state
          window.dispatchEvent(new CustomEvent("fv:sleeptimer:expire"));
          // Time expired - delay state reset by 3.2s to allow fade out
          clearSleepTimer();
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              currentFrequency: null,
              currentSoundId: null,
              isPlaying: false,
              isPaused: false,
              queue: [],
              currentIndex: 0,
              timeRemaining: 0,
              totalDuration: 0,
              sessionName: undefined,
            }));
          }, 3200);
        } else {
          setState((prev) => ({ ...prev, timeRemaining: remaining }));
        }
      }, 1000);
    }
  }, [state.selectedDuration, clearSleepTimer]);

  const playFrequency = useCallback(
    (hz: number, mode: PlayMode = "single") => {
      setState((prev) => ({
        ...prev,
        currentFrequency: hz,
        currentSoundId: null,
        isPlaying: true,
        isPaused: false,
        playMode: mode,
        queue: mode === "single" ? [{ type: "frequency", id: hz }] : prev.queue,
        currentIndex: mode === "single" ? 0 : prev.currentIndex,
      }));
      startSleepTimer();
    },
    [startSleepTimer],
  );

  const playSound = useCallback(
    (soundId: string, mode: PlayMode = "single") => {
      setState((prev) => ({
        ...prev,
        currentFrequency: null,
        currentSoundId: soundId,
        isPlaying: true,
        isPaused: false,
        playMode: mode,
        queue:
          mode === "single" ? [{ type: "sound", id: soundId }] : prev.queue,
        currentIndex: mode === "single" ? 0 : prev.currentIndex,
      }));
      startSleepTimer();
    },
    [startSleepTimer],
  );

  const playQueue = useCallback(
    (
      items: Array<
        { type: "frequency"; id: number } | { type: "sound"; id: string }
      >,
      mode: PlayMode,
      sessionName?: string,
    ) => {
      const firstItem = items[0];
      setState((prev) => ({
        ...prev,
        currentFrequency: firstItem.type === "frequency" ? firstItem.id : null,
        currentSoundId: firstItem.type === "sound" ? firstItem.id : null,
        isPlaying: true,
        isPaused: false,
        playMode: mode,
        queue: items,
        currentIndex: 0,
        sessionName,
      }));
      startSleepTimer();
    },
    [startSleepTimer],
  );

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
    pauseSleepTimer();
  }, [pauseSleepTimer]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
    resumeSleepTimer();
  }, [resumeSleepTimer]);

  const stop = useCallback(() => {
    clearSleepTimer();
    setState((prev) => ({
      ...prev,
      currentFrequency: null,
      currentSoundId: null,
      isPlaying: false,
      isPaused: false,
      queue: [],
      currentIndex: 0,
      timeRemaining: 0,
      totalDuration: 0,
      sessionName: undefined,
    }));
  }, [clearSleepTimer]);

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;

      // Repeat one: stay on current item
      if (prev.repeatMode === "one") {
        return prev;
      }

      let nextIndex: number;

      if (prev.shuffleEnabled && prev.queue.length > 1) {
        // Pick a random index different from current
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * prev.queue.length);
        } while (randomIndex === prev.currentIndex);
        nextIndex = randomIndex;
      } else {
        nextIndex = prev.currentIndex + 1;
      }

      if (nextIndex >= prev.queue.length) {
        if (prev.repeatMode === "all") {
          nextIndex = 0;
        } else {
          return { ...prev, isPlaying: false, isPaused: false };
        }
      }

      const nextItem = prev.queue[nextIndex];
      return {
        ...prev,
        currentIndex: nextIndex,
        currentFrequency: nextItem.type === "frequency" ? nextItem.id : null,
        currentSoundId: nextItem.type === "sound" ? nextItem.id : null,
      };
    });
  }, []);

  const previous = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;

      let prevIndex = prev.currentIndex - 1;

      if (prevIndex < 0) {
        prevIndex = prev.queue.length - 1;
      }

      const prevItem = prev.queue[prevIndex];
      return {
        ...prev,
        currentIndex: prevIndex,
        currentFrequency: prevItem.type === "frequency" ? prevItem.id : null,
        currentSoundId: prevItem.type === "sound" ? prevItem.id : null,
      };
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      repeatMode:
        prev.repeatMode === "off"
          ? "all"
          : prev.repeatMode === "all"
            ? "one"
            : "off",
    }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffleEnabled: !prev.shuffleEnabled }));
  }, []);

  const setTimeRemaining = useCallback(
    (timeOrUpdater: number | ((prev: number) => number)) => {
      setState((prev) => ({
        ...prev,
        timeRemaining:
          typeof timeOrUpdater === "function"
            ? timeOrUpdater(prev.timeRemaining)
            : timeOrUpdater,
      }));
    },
    [],
  );

  const setTotalDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, totalDuration: duration }));
  }, []);

  const updateCurrentIndex = useCallback((index: number) => {
    setState((prev) => {
      const item = prev.queue[index];
      if (!item) return prev;

      return {
        ...prev,
        currentIndex: index,
        currentFrequency: item.type === "frequency" ? item.id : null,
        currentSoundId: item.type === "sound" ? item.id : null,
      };
    });
  }, []);

  const setSelectedDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, selectedDuration: duration }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSleepTimer();
    };
  }, [clearSleepTimer]);

  return (
    <MainPlayerContext.Provider
      value={{
        ...state,
        playFrequency,
        playSound,
        playQueue,
        pause,
        resume,
        stop,
        next,
        previous,
        toggleRepeat,
        toggleShuffle,
        setTimeRemaining,
        setTotalDuration,
        updateCurrentIndex,
        setSelectedDuration,
      }}
    >
      {children}
    </MainPlayerContext.Provider>
  );
}

export function useMainPlayer() {
  const context = useContext(MainPlayerContext);
  if (!context) {
    throw new Error("useMainPlayer must be used within MainPlayerProvider");
  }
  return context;
}
