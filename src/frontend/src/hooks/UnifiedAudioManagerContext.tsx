import { type ReactNode, createContext, useContext, useEffect } from "react";
import { useMainPlayer } from "./useMainPlayer";
import { useUnifiedAudioManager } from "./useUnifiedAudioManager";

interface UnifiedAudioManagerContextType {
  playFrequency: (hz: number) => void;
  playSound: (soundId: string) => void;
  stop: () => void;
  fadeOutAndStop: () => void;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  currentSoundId: string | null;
  volume: number;
  intensity: number;
}

const UnifiedAudioManagerContext = createContext<
  UnifiedAudioManagerContextType | undefined
>(undefined);

export function UnifiedAudioManagerProvider({
  children,
}: { children: ReactNode }) {
  const audioManager = useUnifiedAudioManager();
  const player = useMainPlayer();

  // Sync player state to audio manager
  useEffect(() => {
    if (!player.isPlaying || player.isPaused) {
      audioManager.stop();
      return;
    }

    if (player.currentFrequency !== null) {
      audioManager.playFrequency(player.currentFrequency);
    } else if (player.currentSoundId !== null) {
      audioManager.playSound(player.currentSoundId);
    }
  }, [
    player.isPlaying,
    player.isPaused,
    player.currentFrequency,
    player.currentSoundId,
    audioManager.playFrequency,
    audioManager.playSound,
    audioManager.stop,
  ]);

  // Listen for sleep timer expire event: play chime then fade out
  useEffect(() => {
    const handleSleepTimerExpire = () => {
      // Play a soft chime/bell using Web Audio API to signal timer end
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();

        const playBell = (
          freq: number,
          startTime: number,
          duration: number,
        ) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        // Two gentle bell tones
        playBell(528, ctx.currentTime, 2.5);
        playBell(396, ctx.currentTime + 0.4, 2.0);

        // Close context after bells finish
        setTimeout(() => {
          ctx.close().catch(() => {});
        }, 3500);
      } catch (_e) {
        // Ignore if Web Audio is unavailable
      }

      audioManager.fadeOutAndStop();
    };

    window.addEventListener("fv:sleeptimer:expire", handleSleepTimerExpire);
    return () => {
      window.removeEventListener(
        "fv:sleeptimer:expire",
        handleSleepTimerExpire,
      );
    };
  }, [audioManager.fadeOutAndStop]);

  return (
    <UnifiedAudioManagerContext.Provider value={audioManager}>
      {children}
    </UnifiedAudioManagerContext.Provider>
  );
}

export function useUnifiedAudioManagerContext() {
  const context = useContext(UnifiedAudioManagerContext);
  if (!context) {
    throw new Error(
      "useUnifiedAudioManagerContext must be used within UnifiedAudioManagerProvider",
    );
  }
  return context;
}
