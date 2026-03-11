import type { AmbianceType } from "../hooks/useBackgroundAmbiance";

/**
 * Centralized mapping from ambiance types to static audio asset URLs.
 * All ambiance audio files are located in /assets/ambiance/ directory.
 */
export const AMBIANCE_ASSETS: Record<NonNullable<AmbianceType>, string> = {
  "soft-wind": "/assets/ambiance/soft-wind.mp3",
  "ocean-waves": "/assets/ambiance/ocean-waves.mp3",
  "gentle-rain": "/assets/ambiance/gentle-rain.mp3",
  "distant-fire": "/assets/ambiance/distant-fire.mp3",
  "ambient-pad": "/assets/ambiance/ambient-pad.mp3",
};

/**
 * Get the audio asset URL for a given ambiance type.
 * Returns undefined if the type is null or not found.
 */
export function getAmbianceAssetUrl(type: AmbianceType): string | undefined {
  if (!type) return undefined;
  return AMBIANCE_ASSETS[type];
}
