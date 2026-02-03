import { useEffect, useRef } from 'react';
import { useMainPlayer } from './useMainPlayer';
import { useUnifiedAudioManagerContext } from './UnifiedAudioManagerContext';

/**
 * Bridge hook that synchronizes MainPlayer state to actual audio playback
 * This ensures the shared audio manager plays/stops based on MainPlayer state
 */
export function useMainPlayerAudioSync() {
  const player = useMainPlayer();
  const audioManager = useUnifiedAudioManagerContext();
  const lastPlayedRef = useRef<{ type: 'frequency' | 'sound'; id: number | string } | null>(null);

  useEffect(() => {
    console.log('🔄 [PLAYER SYNC] MainPlayer state changed:', {
      isPlaying: player.isPlaying,
      isPaused: player.isPaused,
      currentFrequency: player.currentFrequency,
      currentSoundId: player.currentSoundId,
    });

    // Handle stop
    if (!player.isPlaying && !player.isPaused) {
      console.log('🛑 [PLAYER SYNC] Stopping audio (player stopped)');
      audioManager.stop();
      lastPlayedRef.current = null;
      return;
    }

    // Handle pause
    if (player.isPaused) {
      console.log('⏸️ [PLAYER SYNC] Pausing audio');
      audioManager.stop();
      return;
    }

    // Handle play/resume
    if (player.isPlaying && !player.isPaused) {
      // Play frequency
      if (player.currentFrequency !== null) {
        const currentItem = { type: 'frequency' as const, id: player.currentFrequency };
        
        // Only play if it's a different frequency or resuming from pause
        if (!lastPlayedRef.current || 
            lastPlayedRef.current.type !== 'frequency' || 
            lastPlayedRef.current.id !== player.currentFrequency) {
          console.log(`▶️ [PLAYER SYNC] Playing frequency: ${player.currentFrequency} Hz`);
          audioManager.playFrequency(player.currentFrequency);
          lastPlayedRef.current = currentItem;
        }
      }
      // Play sound
      else if (player.currentSoundId !== null) {
        const currentItem = { type: 'sound' as const, id: player.currentSoundId };
        
        // Only play if it's a different sound or resuming from pause
        if (!lastPlayedRef.current || 
            lastPlayedRef.current.type !== 'sound' || 
            lastPlayedRef.current.id !== player.currentSoundId) {
          console.log(`▶️ [PLAYER SYNC] Playing sound: ${player.currentSoundId}`);
          audioManager.playSound(player.currentSoundId);
          lastPlayedRef.current = currentItem;
        }
      }
    }
  }, [
    player.isPlaying,
    player.isPaused,
    player.currentFrequency,
    player.currentSoundId,
    audioManager,
  ]);
}
