import { AndroidAudioBridge } from "@/lib/androidAudioBridge";
import { toNativeSoundId } from "@/lib/androidNativeSoundId";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const lastNativeSoundIdRef = useRef<string | null>(null);
  const isFadingOutRef = useRef<boolean>(false);

  // Initialize Web Audio API context
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      } catch (error) {
        console.warn(
          "[AudioManager] Failed to initialize AudioContext:",
          error,
        );
        return;
      }
    }

    if (!analyserRef.current && audioContextRef.current) {
      try {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.warn("[AudioManager] Failed to create analyser:", error);
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAudioContext();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stop();
    };
  }, [initializeAudioContext]);

  // Monitor audio intensity for visualizations
  const monitorIntensity = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateIntensity = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedIntensity = average / 255;

      setAudioState((prev) => ({
        ...prev,
        intensity: normalizedIntensity,
      }));

      animationFrameRef.current = requestAnimationFrame(updateIntensity);
    };

    updateIntensity();
  }, []);

  const playFrequency = useCallback(
    (hz: number) => {
      if (!audioContextRef.current || !analyserRef.current) {
        initializeAudioContext();
      }

      if (!audioContextRef.current || !analyserRef.current) {
        console.warn(
          "[AudioManager] Cannot play frequency: AudioContext not available",
        );
        return;
      }

      // Stop any existing native playback before starting frequency
      if (isUsingNativeAudioRef.current && lastNativeSoundIdRef.current) {
        AndroidAudioBridge.stop(lastNativeSoundIdRef.current);
        isUsingNativeAudioRef.current = false;
        lastNativeSoundIdRef.current = null;
      }

      // Stop any existing oscillator playback immediately (no fade, new sound takes over)
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (_e) {
          // Ignore errors if already stopped
        }
        oscillatorRef.current = null;
      }

      // Resume audio context if suspended
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch((err) => {
          console.warn("[AudioManager] Failed to resume AudioContext:", err);
        });
      }

      try {
        // Create oscillator for frequency playback
        oscillatorRef.current = audioContextRef.current.createOscillator();
        gainNodeRef.current = audioContextRef.current.createGain();

        oscillatorRef.current.type = "sine";
        oscillatorRef.current.frequency.setValueAtTime(
          hz,
          audioContextRef.current.currentTime,
        );

        // Fade in: start at 0, ramp to target volume over 0.3s
        gainNodeRef.current.gain.setValueAtTime(
          0,
          audioContextRef.current.currentTime,
        );
        gainNodeRef.current.gain.linearRampToValueAtTime(
          audioState.volume,
          audioContextRef.current.currentTime + 0.3,
        );

        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(analyserRef.current);

        oscillatorRef.current.start();

        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          currentSoundId: `freq-${hz}`,
        }));

        monitorIntensity();
        isUsingNativeAudioRef.current = false;
        lastNativeSoundIdRef.current = null;
      } catch (error) {
        console.error("[AudioManager] Failed to play frequency:", error);
      }
    },
    [audioState.volume, monitorIntensity, initializeAudioContext],
  );

  const playSound = useCallback((soundId: string) => {
    // Stop any existing native playback before starting new sound
    if (isUsingNativeAudioRef.current && lastNativeSoundIdRef.current) {
      AndroidAudioBridge.stop(lastNativeSoundIdRef.current);
      isUsingNativeAudioRef.current = false;
      lastNativeSoundIdRef.current = null;
    }

    // Stop any existing oscillator playback
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (_e) {
        // Ignore errors if already stopped
      }
      oscillatorRef.current = null;
    }

    // Map web sound ID to Android native ID
    const { nativeId, hadExplicitMapping } = toNativeSoundId(soundId);

    // Log mapping decision
    if (!hadExplicitMapping) {
      console.warn(
        `[AudioManager] No explicit mapping for sound ID "${soundId}". Using normalized fallback: "${nativeId}". If native playback fails, add explicit mapping to androidNativeSoundId.ts`,
      );
    }

    // Attempt Android native audio playback via defensive bridge
    const usedNative = AndroidAudioBridge.play(nativeId);

    // Log native routing decision
    if (AndroidAudioBridge.isAvailable()) {
      console.log(
        `[AudioManager] Native routing: webId="${soundId}", nativeId="${nativeId}", ` +
          `explicitMapping=${hadExplicitMapping}, bridgeSuccess=${usedNative}`,
      );
    }

    if (usedNative) {
      // Keep original web soundId in state for UI/playlist/session identity
      setAudioState((prev) => ({
        ...prev,
        isPlaying: true,
        currentSoundId: soundId,
      }));

      isUsingNativeAudioRef.current = true;
      lastNativeSoundIdRef.current = nativeId; // Store native ID for stop
      return;
    }

    // Web Audio fallback for non-frequency sounds
    // (Currently no web implementation for sound files, just update state)
    console.log(`[AudioManager] Fallback to web audio for sound: ${soundId}`);
    setAudioState((prev) => ({
      ...prev,
      isPlaying: true,
      currentSoundId: soundId,
    }));

    isUsingNativeAudioRef.current = false;
    lastNativeSoundIdRef.current = null;
  }, []);

  const stop = useCallback(() => {
    // Handle Android native audio stop only if native was actually used
    if (isUsingNativeAudioRef.current && lastNativeSoundIdRef.current) {
      const stopped = AndroidAudioBridge.stop(lastNativeSoundIdRef.current);
      console.log(
        `[AudioManager] Native stop: soundId="${lastNativeSoundIdRef.current}", success=${stopped}`,
      );
      isUsingNativeAudioRef.current = false;
      lastNativeSoundIdRef.current = null;
    }

    // Clean up Web Audio resources with fade out
    if (
      oscillatorRef.current &&
      gainNodeRef.current &&
      audioContextRef.current
    ) {
      const osc = oscillatorRef.current;
      const gain = gainNodeRef.current;
      const now = audioContextRef.current.currentTime;

      try {
        // Fade out over 0.3s, then stop
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);

        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_e) {
            // Already stopped
          }
          try {
            gain.disconnect();
          } catch (_e) {
            // Already disconnected
          }
        }, 320);
      } catch (_e) {
        // If ramp fails, stop immediately
        try {
          osc.stop();
          osc.disconnect();
        } catch (_e2) {
          // Ignore
        }
        try {
          gain.disconnect();
        } catch (_e2) {
          // Ignore
        }
      }

      oscillatorRef.current = null;
      gainNodeRef.current = null;
    } else {
      // No oscillator, just clean up gain if any
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (_e) {
          // Ignore
        }
        gainNodeRef.current = null;
      }
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      currentSoundId: null,
      intensity: 0,
    }));
  }, []);

  const fadeOutAndStop = useCallback(() => {
    // Prevent double-fade calls
    if (isFadingOutRef.current) return;
    isFadingOutRef.current = true;

    // For native Android audio: stop immediately (Android handles its own fade)
    if (isUsingNativeAudioRef.current && lastNativeSoundIdRef.current) {
      AndroidAudioBridge.stop(lastNativeSoundIdRef.current);
      isUsingNativeAudioRef.current = false;
      lastNativeSoundIdRef.current = null;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        currentSoundId: null,
        intensity: 0,
      }));

      isFadingOutRef.current = false;
      return;
    }

    // For oscillator audio: ramp gain to 0 over 3 seconds
    if (
      oscillatorRef.current &&
      gainNodeRef.current &&
      audioContextRef.current
    ) {
      const osc = oscillatorRef.current;
      const gain = gainNodeRef.current;
      const now = audioContextRef.current.currentTime;

      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 3);

        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_e) {
            // Already stopped
          }
          try {
            gain.disconnect();
          } catch (_e) {
            // Already disconnected
          }
          isFadingOutRef.current = false;
        }, 3200);
      } catch (_e) {
        // If ramp fails, stop immediately
        try {
          osc.stop();
          osc.disconnect();
        } catch (_e2) {
          // ignore
        }
        try {
          gain.disconnect();
        } catch (_e2) {
          // ignore
        }
        isFadingOutRef.current = false;
      }

      oscillatorRef.current = null;
      gainNodeRef.current = null;
    } else {
      isFadingOutRef.current = false;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      currentSoundId: null,
      intensity: 0,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (gainNodeRef.current && audioContextRef.current) {
      try {
        gainNodeRef.current.gain.setValueAtTime(
          clampedVolume,
          audioContextRef.current.currentTime,
        );
      } catch (error) {
        console.warn("[AudioManager] Failed to set volume:", error);
      }
    }

    setAudioState((prev) => ({
      ...prev,
      volume: clampedVolume,
    }));
  }, []);

  return {
    playFrequency,
    playSound,
    stop,
    fadeOutAndStop,
    setVolume,
    isPlaying: audioState.isPlaying,
    currentSoundId: audioState.currentSoundId,
    volume: audioState.volume,
    intensity: audioState.intensity,
  };
}
