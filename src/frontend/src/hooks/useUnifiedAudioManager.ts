import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface to include AndroidAudio
declare global {
  interface Window {
    AndroidAudio?: {
      playSound: (soundId: string) => void;
      stopSound?: () => void;
    };
  }
}

interface AudioState {
  isPlaying: boolean;
  currentSoundId: string | null;
  volume: number;
  intensity: number;
}

export function useUnifiedAudioManager() {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentSoundId: null,
    volume: 0.7,
    intensity: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isUsingNativeAudioRef = useRef<boolean>(false);

  // Initialize Web Audio API context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stop();
    };
  }, []);

  // Monitor audio intensity for visualizations
  const monitorIntensity = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateIntensity = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedIntensity = average / 255;

      setAudioState(prev => ({
        ...prev,
        intensity: normalizedIntensity,
      }));

      animationFrameRef.current = requestAnimationFrame(updateIntensity);
    };

    updateIntensity();
  }, []);

  /**
   * Play frequency using Web Audio oscillator (NEVER uses Android native)
   * This is the ONLY way frequencies should be played
   */
  const playFrequency = useCallback((hz: number) => {
    console.log(`🎵 [FREQUENCY ROUTING] Playing ${hz} Hz via Web Audio oscillator (Android native bypassed)`);
    
    if (!audioContextRef.current || !analyserRef.current) {
      console.error('❌ [FREQUENCY ROUTING] Web Audio context not available');
      return;
    }

    // Stop any existing playback
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Create oscillator for frequency playback
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(hz, audioContextRef.current.currentTime);

    gainNodeRef.current.gain.setValueAtTime(audioState.volume, audioContextRef.current.currentTime);

    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(analyserRef.current);

    oscillatorRef.current.start();

    setAudioState(prev => ({
      ...prev,
      isPlaying: true,
      currentSoundId: `freq-${hz}`,
    }));

    monitorIntensity();
    isUsingNativeAudioRef.current = false;
    
    console.log(`✅ [FREQUENCY ROUTING] ${hz} Hz oscillator started successfully`);
  }, [audioState.volume, monitorIntensity]);

  /**
   * Play non-frequency sound using Android native when available
   * Falls back to Web Audio only if Android native is unavailable
   * NEVER attempts to parse frequency from sound ID
   */
  const playSound = useCallback((soundId: string) => {
    console.log(`🔊 [SOUND ROUTING] Playing sound: ${soundId}`);
    
    // Ensure sound ID has no file extension (Android res/raw requirement)
    const cleanSoundId = soundId.replace(/\.(mp3|wav|ogg)$/i, '');
    
    // Attempt Android native audio playback if available
    if (window.AndroidAudio && typeof window.AndroidAudio.playSound === 'function') {
      try {
        console.log(`📱 [SOUND ROUTING] Using Android native playback for: ${cleanSoundId}`);
        window.AndroidAudio.playSound(cleanSoundId);
        
        // Update state to reflect native playback
        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          currentSoundId: cleanSoundId,
        }));
        
        isUsingNativeAudioRef.current = true;
        console.log(`✅ [SOUND ROUTING] Android native playback started successfully`);
        return;
      } catch (error) {
        console.warn(`⚠️ [SOUND ROUTING] Android native audio failed, falling back to Web Audio:`, error);
        // Fallback continues below
      }
    } else {
      console.log(`🌐 [SOUND ROUTING] Android native not available, using Web Audio fallback`);
    }

    // Web Audio fallback for non-frequency sounds
    // Note: This is a basic fallback - actual sound files would need to be loaded
    console.log(`⚠️ [SOUND ROUTING] Web Audio fallback for sounds not fully implemented - sound may not play`);
    
    setAudioState(prev => ({
      ...prev,
      isPlaying: true,
      currentSoundId: cleanSoundId,
    }));
    
    isUsingNativeAudioRef.current = false;
  }, []);

  /**
   * Stop function with proper cleanup for both native and Web Audio
   */
  const stop = useCallback(() => {
    console.log('🛑 [AUDIO MANAGER] Stopping all audio');
    
    // Handle Android native audio stop if it was being used
    if (isUsingNativeAudioRef.current && window.AndroidAudio) {
      try {
        if (typeof window.AndroidAudio.stopSound === 'function') {
          console.log('📱 [AUDIO MANAGER] Stopping Android native audio');
          window.AndroidAudio.stopSound();
        }
      } catch (error) {
        console.warn('⚠️ [AUDIO MANAGER] Android native audio stop failed:', error);
      }
      isUsingNativeAudioRef.current = false;
    }

    // ALWAYS clean up Web Audio resources (safe even if not in use)
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentSoundId: null,
      intensity: 0,
    }));
    
    console.log('✅ [AUDIO MANAGER] All audio stopped and cleaned up');
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clampedVolume, audioContextRef.current.currentTime);
    }

    setAudioState(prev => ({
      ...prev,
      volume: clampedVolume,
    }));
  }, []);

  return {
    playFrequency,
    playSound,
    stop,
    setVolume,
    isPlaying: audioState.isPlaying,
    currentSoundId: audioState.currentSoundId,
    volume: audioState.volume,
    intensity: audioState.intensity,
  };
}
