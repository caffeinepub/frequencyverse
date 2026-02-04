/**
 * Centralized Android native soundId mapping/normalization utility.
 * Converts web catalog IDs into Android res/raw IDs (no extension).
 * Used only for native bridge playback attempts.
 */

/**
 * Explicit mapping table for known web sound IDs to Android res/raw IDs.
 * This is the single source of truth for ID translation.
 */
const EXPLICIT_MAPPING: Record<string, string> = {
  // Kids Sleep Sounds - White Noise
  'white-noise': 'white_noise',
  'pink-noise': 'pink_noise',
  'brown-noise': 'brown_noise',
  'womb-sound': 'womb_sound',
  'heartbeat': 'heartbeat',
  'fan-ac': 'fan_ac',
  
  // Kids Sleep Sounds - Nature Sounds
  'light-rain': 'light_rain',
  'ocean-waves': 'ocean_waves',
  'forest-night': 'forest_night',
  'wind-leaves': 'wind_leaves',
  'stream-water': 'stream_water',
  'distant-thunder': 'distant_thunder',
  
  // Kids Sleep Sounds - Lullabies
  'kalimba-lullaby': 'kalimba_lullaby',
  'harp-lullaby': 'harp_lullaby',
  'music-box': 'music_box',
  'slow-instrumental': 'slow_instrumental',
  
  // Kids Sleep Sounds - Fairy Tale
  'starry-night': 'starry_night',
  'space-ambience': 'space_ambience',
  'calm-campfire': 'calm_campfire',
  'night-train': 'night_train',
  
  // Peaceful Sounds
  'peaceful-light-rain': 'peaceful_light_rain',
  'peaceful-wave-sea': 'peaceful_wave_sea',
  'peaceful-leaf-rustle': 'peaceful_leaf_rustle',
  'peaceful-forest-ambiance': 'peaceful_forest_ambiance',
  'peaceful-stream-waterfall': 'peaceful_stream_waterfall',
  'peaceful-light-wind': 'peaceful_light_wind',
  'peaceful-pink-noise': 'peaceful_pink_noise',
  'peaceful-white-noise-light': 'peaceful_white_noise_light',
  'peaceful-gong-tibetan': 'peaceful_gong_tibetan',
  'peaceful-ambient-piano': 'peaceful_ambient_piano',
  'peaceful-slow-breath': 'peaceful_slow_breath',
  'peaceful-light-heartbeat': 'peaceful_light_heartbeat',
  'peaceful-rhythmic-drum': 'peaceful_rhythmic_drum',
  'peaceful-bird-chirp': 'peaceful_bird_chirp',
  'peaceful-fireplace': 'peaceful_fireplace',
};

export interface NativeSoundIdResult {
  nativeId: string;
  hadExplicitMapping: boolean;
}

/**
 * Normalize a web sound ID to Android res/raw format.
 * Deterministic fallback: lowercase + hyphen-to-underscore + strip extension/invalid chars.
 */
function normalizeToNativeId(webId: string): string {
  return webId
    .toLowerCase()
    .replace(/\.(mp3|wav|ogg)$/i, '') // Remove file extensions
    .replace(/-/g, '_') // Replace hyphens with underscores
    .replace(/[^a-z0-9_]/g, ''); // Remove invalid characters
}

/**
 * Convert a web sound ID to Android native res/raw ID.
 * Returns both the native ID and whether an explicit mapping existed.
 * 
 * @param webSoundId - The original web catalog sound ID
 * @returns Object with nativeId and hadExplicitMapping flag
 */
export function toNativeSoundId(webSoundId: string): NativeSoundIdResult {
  // Check explicit mapping first
  if (EXPLICIT_MAPPING[webSoundId]) {
    return {
      nativeId: EXPLICIT_MAPPING[webSoundId],
      hadExplicitMapping: true,
    };
  }
  
  // Fallback to normalized ID
  return {
    nativeId: normalizeToNativeId(webSoundId),
    hadExplicitMapping: false,
  };
}
