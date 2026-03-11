import type { MoodType } from "./moods";

export interface RecommendedItem {
  type: "frequency" | "sound";
  id: number | string;
}

export const moodRecommendations: Record<MoodType, RecommendedItem[]> = {
  happy: [
    { type: "frequency", id: 528 },
    { type: "frequency", id: 432 },
    { type: "sound", id: "peaceful-bird-chirp" },
    { type: "sound", id: "peaceful-light-wind" },
  ],
  tired: [
    { type: "frequency", id: 174 },
    { type: "frequency", id: 285 },
    { type: "sound", id: "white-noise" },
    { type: "sound", id: "womb-sound" },
    { type: "sound", id: "peaceful-slow-breath" },
  ],
  tense: [
    { type: "frequency", id: 396 },
    { type: "frequency", id: 417 },
    { type: "sound", id: "peaceful-stream-waterfall" },
    { type: "sound", id: "light-rain" },
    { type: "sound", id: "peaceful-light-rain" },
  ],
  calm: [
    { type: "frequency", id: 639 },
    { type: "frequency", id: 432 },
    { type: "sound", id: "ocean-waves" },
    { type: "sound", id: "peaceful-wave-sea" },
    { type: "sound", id: "peaceful-forest-ambiance" },
  ],
  stressed: [
    { type: "frequency", id: 174 },
    { type: "frequency", id: 396 },
    { type: "frequency", id: 528 },
    { type: "sound", id: "pink-noise" },
    { type: "sound", id: "peaceful-pink-noise" },
    { type: "sound", id: "peaceful-gong-tibetan" },
  ],
  focused: [
    { type: "frequency", id: 111 },
    { type: "frequency", id: 741 },
    { type: "frequency", id: 852 },
    { type: "sound", id: "peaceful-ambient-piano" },
    { type: "sound", id: "peaceful-rhythmic-drum" },
  ],
  relaxed: [
    { type: "frequency", id: 174 },
    { type: "frequency", id: 528 },
    { type: "sound", id: "peaceful-fireplace" },
    { type: "sound", id: "forest-night" },
    { type: "sound", id: "peaceful-leaf-rustle" },
  ],
};
