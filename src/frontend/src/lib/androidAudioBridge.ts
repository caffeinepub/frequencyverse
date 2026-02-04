/**
 * Defensive wrapper for AndroidAudio JavaScript bridge.
 * Ensures bridge calls never crash React effects or render cycles.
 * All methods are optional to handle missing WebView bridge gracefully.
 */

declare global {
  interface Window {
    AndroidAudio?: {
      playSound?: (name: string) => void;
      stopSound?: (name: string) => void;
    };
  }
}

/**
 * Check if AndroidAudio bridge is available and functional
 */
export function isAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.AndroidAudio === 'object' &&
    window.AndroidAudio !== null &&
    typeof window.AndroidAudio.playSound === 'function'
  );
}

/**
 * Safely call AndroidAudio.playSound with error handling.
 * Returns true if native playback was successfully initiated, false otherwise.
 */
export function play(soundId: string): boolean {
  if (!isAvailable()) {
    return false;
  }

  try {
    window.AndroidAudio!.playSound!(soundId);
    return true;
  } catch (error) {
    console.warn('[AndroidAudioBridge] play failed, fallback to web:', error);
    return false;
  }
}

/**
 * Safely call AndroidAudio.stopSound with error handling.
 * Returns true if native stop was successfully called, false otherwise.
 * Never throws even if stopSound method is missing or has mismatched signature.
 */
export function stop(soundId: string): boolean {
  // Check if bridge exists and stopSound method is available
  if (
    typeof window === 'undefined' ||
    !window.AndroidAudio ||
    typeof window.AndroidAudio.stopSound !== 'function'
  ) {
    return false;
  }

  try {
    window.AndroidAudio.stopSound(soundId);
    return true;
  } catch (error) {
    // Catch any runtime errors (method signature mismatch, etc.)
    // Never let this crash the React app
    console.warn('[AndroidAudioBridge] stop failed, ignored:', error);
    return false;
  }
}

export const AndroidAudioBridge = {
  isAvailable,
  play,
  stop,
};
