export type MoodType =
  | "happy"
  | "tired"
  | "tense"
  | "calm"
  | "stressed"
  | "focused"
  | "relaxed";

export interface Mood {
  id: MoodType;
  icon: string;
  glowColor: string;
}

export const moods: Mood[] = [
  {
    id: "happy",
    icon: "/assets/generated/mood-happy-icon.dim_64x64.png",
    glowColor: "rgba(255, 200, 50, 0.6)",
  },
  {
    id: "tired",
    icon: "/assets/generated/mood-tired-icon.dim_64x64.png",
    glowColor: "rgba(150, 150, 200, 0.5)",
  },
  {
    id: "tense",
    icon: "/assets/generated/mood-tense-icon.dim_64x64.png",
    glowColor: "rgba(255, 100, 100, 0.6)",
  },
  {
    id: "calm",
    icon: "/assets/generated/mood-calm-icon.dim_64x64.png",
    glowColor: "rgba(100, 200, 255, 0.5)",
  },
  {
    id: "stressed",
    icon: "/assets/generated/mood-stressed-icon.dim_64x64.png",
    glowColor: "rgba(255, 150, 50, 0.6)",
  },
  {
    id: "focused",
    icon: "/assets/generated/mood-focused-icon.dim_64x64.png",
    glowColor: "rgba(150, 100, 255, 0.6)",
  },
  {
    id: "relaxed",
    icon: "/assets/generated/mood-relaxed-icon.dim_64x64.png",
    glowColor: "rgba(100, 255, 150, 0.5)",
  },
];
