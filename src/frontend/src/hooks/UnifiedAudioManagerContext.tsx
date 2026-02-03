import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAudioManager } from './useUnifiedAudioManager';

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
