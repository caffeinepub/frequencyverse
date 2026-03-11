import type { VisualTheme } from "../hooks/useTheme";

export interface ThemeOption {
  value: VisualTheme;
  label: string;
}

export const VISUAL_THEME_OPTIONS: ThemeOption[] = [
  { value: "aurora-glow", label: "Aurora Glow" },
  { value: "celestial-calm", label: "Celestial Calm" },
  { value: "sacred-lotus", label: "Sacred Lotus" },
  { value: "ethereal-waves", label: "Ethereal Waves" },
  { value: "zen-garden", label: "Zen Garden" },
];
