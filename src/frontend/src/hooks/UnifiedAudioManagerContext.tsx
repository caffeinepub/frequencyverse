import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUnifiedAudioManager } from './useUnifiedAudioManager';
import { useMainPlayer } from './useMainPlayer';

interface UnifiedAudioManagerContextType {
  playFrequency: (hz: number) => void;
  playSound: (soundId: string) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  currentSoundId: string | null;
  volume: number;
  intensity: number;
}

const UnifiedAudioManagerContext = createContext<UnifiedAudioManagerContextType | undefined>(undefined);

export function UnifiedAudioManagerProvider({ children }: { children: ReactNode }) {
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
  }, [player.isPlaying, player.isPaused, player.currentFrequency, player.currentSoundId]);

  return (
    <UnifiedAudioManagerContext.Provider value={audioManager}>
      {children}
    </UnifiedAudioManagerContext.Provider>
  );
}

export function useUnifiedAudioManagerContext() {
  const context = useContext(UnifiedAudioManagerContext);
  if (!context) {
    throw new Error('useUnifiedAudioManagerContext must be used within UnifiedAudioManagerProvider');
  }
  return context;
}
