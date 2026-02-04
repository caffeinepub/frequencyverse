import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useMainPlayer } from './useMainPlayer';

export type AmbianceType = 'soft-wind' | 'ocean-waves' | 'gentle-rain' | 'distant-fire' | 'ambient-pad' | null;

interface BackgroundAmbianceContextType {
  currentAmbiance: AmbianceType;
  setAmbiance: (ambiance: AmbianceType) => void;
  isPlaying: boolean;
}

const BackgroundAmbianceContext = createContext<BackgroundAmbianceContextType | undefined>(undefined);

const AMBIANCE_STORAGE_KEY = 'frequencyverse-background-ambiance';

export function BackgroundAmbianceProvider({ children }: { children: ReactNode }) {
  const player = useMainPlayer();
  const [currentAmbiance, setCurrentAmbianceState] = useState<AmbianceType>(() => {
    try {
      const stored = localStorage.getItem(AMBIANCE_STORAGE_KEY);
      return (stored as AmbianceType) || null;
    } catch {
      return null;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isFadingRef = useRef(false);
  const audioInitializedRef = useRef(false);

  const setAmbiance = (ambiance: AmbianceType) => {
    setCurrentAmbianceState(ambiance);
    try {
      if (ambiance) {
        localStorage.setItem(AMBIANCE_STORAGE_KEY, ambiance);
      } else {
        localStorage.removeItem(AMBIANCE_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('⚠️ [AMBIANCE] Failed to save to localStorage:', error);
    }
  };

  // Initialize audio context and nodes with error handling
  useEffect(() => {
    if (!currentAmbiance || audioInitializedRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('⚠️ [AMBIANCE] AudioContext not supported');
          return;
        }
        audioContextRef.current = new AudioContextClass();
      }

      const context = audioContextRef.current;

      if (context.state === 'suspended') {
        context.resume().catch(err => {
          console.warn('⚠️ [AMBIANCE] Failed to resume audio context:', err);
        });
      }

      if (!audioRef.current) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0;
        audioRef.current = audio;
      }

      const audio = audioRef.current;
      
      // Set audio source based on ambiance type
      // In production, these would be actual audio files in the raw folder
      // audio.src = `/raw/ambiance/${currentAmbiance}.mp3`;
      
      // Create audio nodes if they don't exist
      if (!sourceNodeRef.current && audio) {
        try {
          sourceNodeRef.current = context.createMediaElementSource(audio);
          gainNodeRef.current = context.createGain();
          
          sourceNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(context.destination);
          
          gainNodeRef.current.gain.setValueAtTime(0, context.currentTime);
          audioInitializedRef.current = true;
        } catch (e) {
          console.warn('⚠️ [AMBIANCE] Audio node creation failed:', e);
        }
      }

      // Start playing if main player is not active
      if (!player.isPlaying && gainNodeRef.current && audioInitializedRef.current) {
        audio.play().catch(e => console.warn('⚠️ [AMBIANCE] Play failed:', e));
        setIsPlaying(true);
        
        // Fade in
        try {
          const currentTime = context.currentTime;
          gainNodeRef.current.gain.setValueAtTime(0.01, currentTime);
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.2, currentTime + 2);
        } catch (e) {
          console.warn('⚠️ [AMBIANCE] Fade in failed:', e);
        }
      }
    } catch (error) {
      console.error('❌ [AMBIANCE] Initialization error:', error);
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current && !currentAmbiance) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [currentAmbiance, player.isPlaying]);

  // Handle fade out/in based on main player state
  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current || !currentAmbiance || !audioInitializedRef.current) return;

    try {
      const context = audioContextRef.current;
      const gainNode = gainNodeRef.current;

      if (player.isPlaying && !isFadingRef.current) {
        // Fade out when main player starts
        isFadingRef.current = true;
        const currentTime = context.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.5);
        
        setTimeout(() => {
          isFadingRef.current = false;
        }, 1500);
      } else if (!player.isPlaying && !isFadingRef.current && audioRef.current) {
        // Fade in when main player stops
        isFadingRef.current = true;
        
        // Ensure audio is playing
        if (audioRef.current.paused) {
          audioRef.current.play().catch(e => console.warn('⚠️ [AMBIANCE] Resume failed:', e));
        }
        
        const currentTime = context.currentTime;
        gainNode.gain.setValueAtTime(0.01, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.2, currentTime + 2);
        
        setTimeout(() => {
          isFadingRef.current = false;
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [AMBIANCE] Fade error:', error);
      isFadingRef.current = false;
    }
  }, [player.isPlaying, currentAmbiance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      audioInitializedRef.current = false;
    };
  }, []);

  return (
    <BackgroundAmbianceContext.Provider value={{ currentAmbiance, setAmbiance, isPlaying }}>
      {children}
    </BackgroundAmbianceContext.Provider>
  );
}

export function useBackgroundAmbiance() {
  const context = useContext(BackgroundAmbianceContext);
  if (context === undefined) {
    throw new Error('useBackgroundAmbiance must be used within a BackgroundAmbianceProvider');
  }
  return context;
}
