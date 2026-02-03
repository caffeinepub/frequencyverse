import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';

interface AudioActivationContextType {
  isAudioActivated: boolean;
  activateAudio: () => void;
  showActivationIndicator: boolean;
}

const AudioActivationContext = createContext<AudioActivationContextType | undefined>(undefined);

export function AudioActivationProvider({ children }: { children: ReactNode }) {
  const [isAudioActivated, setIsAudioActivated] = useState(false);
  const [showActivationIndicator, setShowActivationIndicator] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState({ x: 0, y: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);

  const activateAudio = useCallback((event?: TouchEvent | MouseEvent) => {
    if (isAudioActivated) return;

    // Capture touch/click position for visual indicator
    if (event) {
      const x = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
      setIndicatorPosition({ x, y });
    }

    // Create and unlock Web Audio API context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;

    // Resume context if suspended
    if (context.state === 'suspended') {
      context.resume();
    }

    // Play ultra-short silent audio to unlock audio playback
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.frequency.setValueAtTime(440, context.currentTime);
    gainNode.gain.setValueAtTime(0.001, context.currentTime); // Nearly silent

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.01); // 10ms duration

    // Clean up
    setTimeout(() => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
    }, 100);

    // Show visual indicator
    setShowActivationIndicator(true);
    setTimeout(() => {
      setShowActivationIndicator(false);
    }, 800);

    setIsAudioActivated(true);

    // Store activation state in localStorage
    try {
      localStorage.setItem('audioActivated', 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [isAudioActivated]);

  // Check if audio was previously activated
  useEffect(() => {
    try {
      const wasActivated = localStorage.getItem('audioActivated') === 'true';
      if (wasActivated) {
        setIsAudioActivated(true);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Add global touch/click listener for first interaction
  useEffect(() => {
    if (isAudioActivated) return;

    const handleFirstInteraction = (event: TouchEvent | MouseEvent) => {
      activateAudio(event);
    };

    // Listen for both touch and click events
    document.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [isAudioActivated, activateAudio]);

  return (
    <AudioActivationContext.Provider value={{ isAudioActivated, activateAudio, showActivationIndicator }}>
      {children}
      {/* Visual activation indicator */}
      {showActivationIndicator && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${indicatorPosition.x}px`,
            top: `${indicatorPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative w-16 h-16">
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/40 to-pink-400/40 animate-pulse" />
            {/* Center glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/60 shadow-lg shadow-purple-500/50" />
            </div>
          </div>
        </div>
      )}
    </AudioActivationContext.Provider>
  );
}

export function useAudioActivation() {
  const context = useContext(AudioActivationContext);
  if (!context) {
    throw new Error('useAudioActivation must be used within AudioActivationProvider');
  }
  return context;
}
