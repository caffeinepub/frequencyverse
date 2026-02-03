import { useState, useCallback, useRef, useEffect } from 'react';
import { useMainPlayer } from './useMainPlayer';

export interface MeditationSession {
  id: string;
  nameKey: string;
  frequencies: number[];
  durationPerFrequency: number;
}

export const predefinedSessions: MeditationSession[] = [
  {
    id: 'healing',
    nameKey: 'healing',
    frequencies: [174, 285, 528],
    durationPerFrequency: 180
  },
  {
    id: 'chakra',
    nameKey: 'chakra',
    frequencies: [396, 417, 528, 639, 741, 852],
    durationPerFrequency: 120
  },
  {
    id: 'deep-meditation',
    nameKey: 'deepMeditation',
    frequencies: [174, 528, 852],
    durationPerFrequency: 240
  },
  {
    id: 'quick-relax',
    nameKey: 'quickRelax',
    frequencies: [174, 528],
    durationPerFrequency: 300
  }
];

export function useUnifiedSessionManager() {
  const player = useMainPlayer();
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    player.stop();
    setActiveSession(null);
  }, [player]);

  const startSession = useCallback((session: MeditationSession) => {
    stopSession();
    
    // Use duration from main player
    const totalSeconds = player.selectedDuration * 60;
    const durationPerFreq = Math.floor(totalSeconds / session.frequencies.length);
    
    setActiveSession(session);
    
    // Convert frequencies array to queue items format
    const queueItems = session.frequencies.map(freq => ({
      type: 'frequency' as const,
      id: freq
    }));
    
    player.playQueue(queueItems, 'session', session.nameKey);
    player.setTotalDuration(totalSeconds);
    player.setTimeRemaining(totalSeconds);
    
    timerRef.current = setInterval(() => {
      player.setTimeRemaining(prev => {
        const newRemaining = prev - 1;
        
        if (newRemaining <= 0) {
          stopSession();
          return 0;
        }
        
        const elapsed = totalSeconds - newRemaining;
        const newIndex = Math.floor(elapsed / durationPerFreq);
        
        if (newIndex !== player.currentIndex && newIndex < session.frequencies.length) {
          player.updateCurrentIndex(newIndex);
        }
        
        return newRemaining;
      });
    }, 1000);
  }, [player, stopSession]);

  const pauseSession = useCallback(() => {
    if (!activeSession) return;
    player.pause();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [activeSession, player]);

  const resumeSession = useCallback(() => {
    if (!activeSession) return;
    player.resume();
    
    const totalSeconds = player.totalDuration;
    const durationPerFreq = Math.floor(totalSeconds / activeSession.frequencies.length);
    
    timerRef.current = setInterval(() => {
      player.setTimeRemaining(prev => {
        const newRemaining = prev - 1;
        
        if (newRemaining <= 0) {
          stopSession();
          return 0;
        }
        
        const elapsed = totalSeconds - newRemaining;
        const newIndex = Math.floor(elapsed / durationPerFreq);
        
        if (newIndex !== player.currentIndex && newIndex < activeSession.frequencies.length) {
          player.updateCurrentIndex(newIndex);
        }
        
        return newRemaining;
      });
    }, 1000);
  }, [activeSession, player, stopSession]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    activeSession,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
  };
}
