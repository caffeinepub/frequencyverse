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
    const stored = localStorage.getItem(AMBIANCE_STORAGE_KEY);
    return (stored as AmbianceType) || null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isFadingRef = useRef(false);

  const setAmbiance = (ambiance: AmbianceType) => {
    setCurrentAmbianceState(ambiance);
    if (ambiance) {
      localStorage.setItem(AMBIANCE_STORAGE_KEY, ambiance);
    } else {
      localStorage.removeItem(AMBIANCE_STORAGE_KEY);
    }
  };

  // Initialize audio context and nodes
  useEffect(() => {
    if (!currentAmbiance) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;

    if (context.state === 'suspended') {
      context.resume();
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
      } catch (e) {
        console.log('Audio node creation failed:', e);
      }
    }

    // Start playing if main player is not active
    if (!player.isPlaying && gainNodeRef.current) {
      audio.play().catch(e => console.log('Ambiance play failed:', e));
      setIsPlaying(true);
      
      // Fade in
      const currentTime = context.currentTime;
      gainNodeRef.current.gain.setValueAtTime(0.01, currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.2, currentTime + 2);
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current && !currentAmbiance) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentAmbiance]);

  // Handle fade out/in based on main player state
  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current || !currentAmbiance) return;

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
        audioRef.current.play().catch(e => console.log('Ambiance resume failed:', e));
      }
      
      const currentTime = context.currentTime;
      gainNode.gain.setValueAtTime(0.01, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.2, currentTime + 2);
      
      setTimeout(() => {
        isFadingRef.current = false;
      }, 2000);
    }
  }, [player.isPlaying, currentAmbiance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {
          // Ignore
        }
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {
          // Ignore
        }
        gainNodeRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore
        }
        audioContextRef.current = null;
      }
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
