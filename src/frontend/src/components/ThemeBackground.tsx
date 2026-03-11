import { useEffect, useState } from "react";
import { useUnifiedAudioManagerContext } from "../hooks/UnifiedAudioManagerContext";
import { useVisualTheme } from "../hooks/useTheme";

export default function ThemeBackground() {
  const { theme } = useVisualTheme();
  const { intensity } = useUnifiedAudioManagerContext();
  const [pulseOpacity, setPulseOpacity] = useState(0);

  useEffect(() => {
    if (intensity > 0) {
      // Create pulsing effect based on visual intensity
      const interval = setInterval(() => {
        setPulseOpacity((prev) => {
          const target = 0.2 + intensity * 0.3;
          return prev + (target - prev) * 0.1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
    setPulseOpacity(0);
  }, [intensity]);

  const getBackgroundImage = () => {
    switch (theme) {
      case "aurora-glow":
        return "/assets/generated/aurora-glow-bg.dim_1024x768.png";
      case "celestial-calm":
        return "/assets/generated/celestial-calm-bg.dim_1024x768.png";
      case "sacred-lotus":
        return "/assets/generated/sacred-lotus-bg.dim_1024x768.png";
      case "ethereal-waves":
        return "/assets/generated/ethereal-waves-bg.dim_1024x768.png";
      case "zen-garden":
        return "/assets/generated/zen-garden-bg.dim_1024x768.png";
      default:
        return "/assets/generated/aurora-glow-bg.dim_1024x768.png";
    }
  };

  const getOverlayGradient = () => {
    switch (theme) {
      case "aurora-glow":
        return "from-indigo-900/40 via-purple-900/30 to-teal-900/40";
      case "celestial-calm":
        return "from-indigo-950/50 via-blue-950/40 to-purple-950/50";
      case "sacred-lotus":
        return "from-emerald-900/40 via-teal-900/30 to-cyan-900/40";
      case "ethereal-waves":
        return "from-violet-900/40 via-fuchsia-900/30 to-pink-900/40";
      case "zen-garden":
        return "from-stone-900/40 via-green-900/30 to-emerald-900/40";
      default:
        return "from-indigo-900/40 via-purple-900/30 to-teal-900/40";
    }
  };

  const getAnimationClass = () => {
    switch (theme) {
      case "aurora-glow":
        return "animate-aurora";
      case "celestial-calm":
        return "animate-twinkle";
      case "sacred-lotus":
        return "animate-ripple";
      case "ethereal-waves":
        return "animate-flow";
      case "zen-garden":
        return "animate-sway";
      default:
        return "";
    }
  };

  const getPulseColor = () => {
    switch (theme) {
      case "aurora-glow":
        return "from-purple-500/30 via-pink-500/20 to-teal-500/30";
      case "celestial-calm":
        return "from-blue-500/30 via-indigo-500/20 to-purple-500/30";
      case "sacred-lotus":
        return "from-emerald-500/30 via-teal-500/20 to-cyan-500/30";
      case "ethereal-waves":
        return "from-violet-500/30 via-fuchsia-500/20 to-pink-500/30";
      case "zen-garden":
        return "from-green-500/30 via-emerald-500/20 to-teal-500/30";
      default:
        return "from-purple-500/30 via-pink-500/20 to-teal-500/30";
    }
  };

  return (
    <>
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
        }}
      />

      {/* Animated Overlay Gradient */}
      <div
        className={`fixed inset-0 z-0 bg-gradient-to-br ${getOverlayGradient()} ${getAnimationClass()} transition-all duration-1000`}
      />

      {/* Visual Synchronization Pulse Layer */}
      {intensity > 0 && (
        <div
          className={`fixed inset-0 z-0 bg-gradient-to-br ${getPulseColor()} transition-opacity duration-300`}
          style={{
            opacity: pulseOpacity,
          }}
        />
      )}

      {/* Subtle Noise Texture for Depth */}
      <div className="fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-noise" />
    </>
  );
}
