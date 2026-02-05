import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useMainPlayer } from './useMainPlayer';
import { useAudioActivation } from './useAudioActivation';
import { getAmbianceAssetUrl } from '../lib/ambianceAssets';

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
  const { isAudioActivated } = useAudioActivation();
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
  const pendingPlayRef = useRef(false);
  const wasInterruptedByMainPlayerRef = useRef(false);

  const setAmbiance = (ambiance: AmbianceType) => {
    console.log('🎵 [AMBIANCE] Setting ambiance to:', ambiance);
    
    // Stop and cleanup previous audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.warn('⚠️ [AMBIANCE] Failed to stop previous audio:', e);
      }
    }

    setCurrentAmbianceState(ambiance);
    setIsPlaying(false);
    pendingPlayRef.current = false;
    wasInterruptedByMainPlayerRef.current = false;
    
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

  // Initialize and play ambiance audio
  useEffect(() => {
    if (!currentAmbiance) {
      // Clean up when ambiance is turned off
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
        } catch (e) {
          console.warn('⚠️ [AMBIANCE] Cleanup error:', e);
        }
      }
      setIsPlaying(false);
      pendingPlayRef.current = false;
      wasInterruptedByMainPlayerRef.current = false;
      return;
    }

    const assetUrl = getAmbianceAssetUrl(currentAmbiance);
    if (!assetUrl) {
      console.warn('⚠️ [AMBIANCE] No asset URL for:', currentAmbiance);
      return;
    }

    console.log('🎵 [AMBIANCE] Initializing audio for:', currentAmbiance, 'URL:', assetUrl);

    try {
      // Initialize AudioContext
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('⚠️ [AMBIANCE] AudioContext not supported');
          return;
        }
        audioContextRef.current = new AudioContextClass();
      }

      const context = audioContextRef.current;

      // Resume context if suspended
      if (context.state === 'suspended') {
        context.resume().catch(err => {
          console.warn('⚠️ [AMBIANCE] Failed to resume audio context:', err);
        });
      }

      // Create or update audio element
      if (!audioRef.current) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 1.0; // Full volume, we'll control via gain node
        audio.preload = 'auto';
        audioRef.current = audio;

        // Add error handler
        audio.addEventListener('error', (e) => {
          console.error('❌ [AMBIANCE] Audio load error:', e, 'URL:', assetUrl);
        });

        // Add loaded handler
        audio.addEventListener('canplaythrough', () => {
          console.log('✅ [AMBIANCE] Audio loaded successfully:', assetUrl);
        });
      }

      const audio = audioRef.current;
      
      // Set the audio source
      if (audio.src !== assetUrl) {
        audio.src = assetUrl;
        console.log('🎵 [AMBIANCE] Audio source set to:', assetUrl);
      }
      
      // Create audio nodes if they don't exist
      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current = context.createMediaElementSource(audio);
          gainNodeRef.current = context.createGain();
          
          sourceNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(context.destination);
          
          gainNodeRef.current.gain.setValueAtTime(0.2, context.currentTime);
          console.log('✅ [AMBIANCE] Audio nodes created and connected');
        } catch (e) {
          console.warn('⚠️ [AMBIANCE] Audio node creation failed:', e);
          return;
        }
      }

      // Attempt to play
      const attemptPlay = () => {
        if (!audio || !gainNodeRef.current) return;

        // Only play if main player is not active
        if (player.isPlaying) {
          console.log('🎵 [AMBIANCE] Main player active, keeping ambiance silent');
          pendingPlayRef.current = true;
          wasInterruptedByMainPlayerRef.current = true;
          return;
        }

        audio.play()
          .then(() => {
            console.log('✅ [AMBIANCE] Playback started successfully');
            setIsPlaying(true);
            pendingPlayRef.current = false;
            
            // Set volume
            if (gainNodeRef.current && audioContextRef.current) {
              try {
                const currentTime = audioContextRef.current.currentTime;
                gainNodeRef.current.gain.setValueAtTime(0.2, currentTime);
              } catch (e) {
                console.warn('⚠️ [AMBIANCE] Volume set failed:', e);
              }
            }
          })
          .catch(e => {
            console.warn('⚠️ [AMBIANCE] Play failed (may need user interaction):', e.message);
            pendingPlayRef.current = true;
          });
      };

      // If audio is already activated, play immediately
      if (isAudioActivated) {
        attemptPlay();
      } else {
        // Mark as pending, will play after first user interaction
        pendingPlayRef.current = true;
        console.log('🎵 [AMBIANCE] Waiting for audio activation...');
      }

    } catch (error) {
      console.error('❌ [AMBIANCE] Initialization error:', error);
    }
  }, [currentAmbiance, isAudioActivated]);

  // Handle pending play after audio activation
  useEffect(() => {
    if (isAudioActivated && pendingPlayRef.current && currentAmbiance && audioRef.current && !player.isPlaying) {
      console.log('🎵 [AMBIANCE] Audio activated, starting pending playback');
      
      audioRef.current.play()
        .then(() => {
          console.log('✅ [AMBIANCE] Pending playback started');
          setIsPlaying(true);
          pendingPlayRef.current = false;
          
          // Set volume
          if (gainNodeRef.current && audioContextRef.current) {
            try {
              const currentTime = audioContextRef.current.currentTime;
              gainNodeRef.current.gain.setValueAtTime(0.2, currentTime);
            } catch (e) {
              console.warn('⚠️ [AMBIANCE] Volume set failed:', e);
            }
          }
        })
        .catch(e => {
          console.warn('⚠️ [AMBIANCE] Pending play failed:', e.message);
        });
    }
  }, [isAudioActivated, currentAmbiance, player.isPlaying]);

  // Handle stop/resume based on main player state
  useEffect(() => {
    if (!audioRef.current || !gainNodeRef.current || !audioContextRef.current || !currentAmbiance) return;

    const audio = audioRef.current;
    const gainNode = gainNodeRef.current;
    const context = audioContextRef.current;

    if (player.isPlaying) {
      // Stop ambiance when main player starts
      if (!audio.paused) {
        console.log('🎵 [AMBIANCE] Main player started, stopping ambiance');
        try {
          audio.pause();
          gainNode.gain.setValueAtTime(0, context.currentTime);
          setIsPlaying(false);
          wasInterruptedByMainPlayerRef.current = true;
        } catch (e) {
          console.warn('⚠️ [AMBIANCE] Stop failed:', e);
        }
      }
    } else {
      // Resume ambiance when main player stops (if it was interrupted and audio is activated)
      if (wasInterruptedByMainPlayerRef.current && isAudioActivated && audio.paused) {
        console.log('🎵 [AMBIANCE] Main player stopped, resuming ambiance');
        
        audio.play()
          .then(() => {
            console.log('✅ [AMBIANCE] Ambiance resumed successfully');
            setIsPlaying(true);
            wasInterruptedByMainPlayerRef.current = false;
            
            try {
              const currentTime = context.currentTime;
              gainNode.gain.setValueAtTime(0.2, currentTime);
            } catch (e) {
              console.warn('⚠️ [AMBIANCE] Volume set failed:', e);
            }
          })
          .catch(e => {
            console.warn('⚠️ [AMBIANCE] Resume failed:', e.message);
            // Keep the flag so we can try again
          });
      }
    }
  }, [player.isPlaying, currentAmbiance, isAudioActivated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
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
