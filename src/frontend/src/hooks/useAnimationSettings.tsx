import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { detectDevicePerformance } from "../lib/devicePerformance";

export type AnimationIntensity = "low" | "medium" | "high";

interface AnimationSettingsContextType {
  animationIntensity: AnimationIntensity;
  setAnimationIntensity: (v: AnimationIntensity) => void;
  isAutoDetected: boolean;
}

const AnimationSettingsContext = createContext<
  AnimationSettingsContextType | undefined
>(undefined);

export function AnimationSettingsProvider({
  children,
}: { children: ReactNode }) {
  const [animationIntensity, setAnimationIntensityState] =
    useState<AnimationIntensity>(() => {
      try {
        const stored = localStorage.getItem("fv_anim_intensity");
        if (stored === "low" || stored === "medium" || stored === "high")
          return stored;
      } catch {
        // ignore
      }
      return "medium";
    });

  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fv_anim_intensity_manual") !== "true";
    } catch {
      return true;
    }
  });

  // Auto-detect device performance on mount if user hasn't manually set it
  useEffect(() => {
    const hasManualOverride =
      localStorage.getItem("fv_anim_intensity_manual") === "true";
    if (hasManualOverride) return;

    detectDevicePerformance()
      .then((detected) => {
        setAnimationIntensityState(detected);
        try {
          localStorage.setItem("fv_anim_intensity", detected);
        } catch {
          // ignore
        }
        setIsAutoDetected(true);
      })
      .catch(() => {
        // On error, keep default "medium"
      });
  }, []);

  const setAnimationIntensity = (v: AnimationIntensity) => {
    setAnimationIntensityState(v);
    setIsAutoDetected(false);
    try {
      localStorage.setItem("fv_anim_intensity", v);
      localStorage.setItem("fv_anim_intensity_manual", "true");
    } catch {
      // ignore
    }
  };

  return (
    <AnimationSettingsContext.Provider
      value={{ animationIntensity, setAnimationIntensity, isAutoDetected }}
    >
      {children}
    </AnimationSettingsContext.Provider>
  );
}

export function useAnimationSettings() {
  const ctx = useContext(AnimationSettingsContext);
  if (!ctx)
    throw new Error(
      "useAnimationSettings must be within AnimationSettingsProvider",
    );
  return ctx;
}
