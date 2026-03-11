/**
 * Centralized meditation animation mapping system
 * Maps soundId/frequency to specific animation types with safe defaults
 */

export type AnimationType =
  | "frequency-healing"
  | "ocean-waves"
  | "rain-drops"
  | "forest-ambient"
  | "fire-glow"
  | "wind-flow"
  | "white-noise"
  | "pink-noise"
  | "brown-noise"
  | "heartbeat-pulse"
  | "lullaby-gentle"
  | "space-cosmic"
  | "night-stars"
  | "breath-calm"
  | "default-meditation";

interface AnimationConfig {
  type: AnimationType;
  baseHue: number;
  secondaryHue: number;
  ringCount: number;
  particleCount: number;
  pulseSpeed: number;
  rotationSpeed: number;
  glowIntensity: number;
}

/**
 * Get animation type for a given frequency
 */
export function getAnimationForFrequency(_frequency: number): AnimationType {
  // All frequencies use the same healing meditation style
  return "frequency-healing";
}

/**
 * Get animation type for a given sound ID
 */
export function getAnimationForSound(soundId: string): AnimationType {
  // Ocean/water sounds
  if (
    soundId.includes("ocean") ||
    soundId.includes("wave") ||
    soundId.includes("sea") ||
    soundId.includes("deniz")
  ) {
    return "ocean-waves";
  }

  // Rain sounds
  if (soundId.includes("rain") || soundId.includes("yagmur")) {
    return "rain-drops";
  }

  // Forest/nature sounds
  if (
    soundId.includes("forest") ||
    soundId.includes("orman") ||
    soundId.includes("leaf") ||
    soundId.includes("yaprak") ||
    soundId.includes("bird") ||
    soundId.includes("kus")
  ) {
    return "forest-ambient";
  }

  // Fire sounds
  if (
    soundId.includes("fire") ||
    soundId.includes("ates") ||
    soundId.includes("campfire") ||
    soundId.includes("kamp")
  ) {
    return "fire-glow";
  }

  // Wind sounds
  if (soundId.includes("wind") || soundId.includes("ruzgar")) {
    return "wind-flow";
  }

  // White noise
  if (
    soundId.includes("white-noise") ||
    soundId.includes("beyaz-gurultu") ||
    soundId.includes("beyaz_gurultu")
  ) {
    return "white-noise";
  }

  // Pink noise
  if (
    soundId.includes("pink-noise") ||
    soundId.includes("pembe-gurultu") ||
    soundId.includes("pembe_gurultu")
  ) {
    return "pink-noise";
  }

  // Brown noise
  if (
    soundId.includes("brown-noise") ||
    soundId.includes("kahverengi-gurultu") ||
    soundId.includes("kahverengi_gurultu")
  ) {
    return "brown-noise";
  }

  // Heartbeat sounds
  if (
    soundId.includes("heartbeat") ||
    soundId.includes("kalp") ||
    soundId.includes("womb") ||
    soundId.includes("anne")
  ) {
    return "heartbeat-pulse";
  }

  // Lullaby/music box sounds
  if (
    soundId.includes("lullaby") ||
    soundId.includes("ninni") ||
    soundId.includes("music-box") ||
    soundId.includes("muzik") ||
    soundId.includes("harp") ||
    soundId.includes("kalimba") ||
    soundId.includes("piano")
  ) {
    return "lullaby-gentle";
  }

  // Space/cosmic sounds
  if (
    soundId.includes("space") ||
    soundId.includes("uzay") ||
    soundId.includes("cosmic")
  ) {
    return "space-cosmic";
  }

  // Night/starry sounds
  if (
    soundId.includes("night") ||
    soundId.includes("gece") ||
    soundId.includes("starry") ||
    soundId.includes("yildiz")
  ) {
    return "night-stars";
  }

  // Breath sounds
  if (soundId.includes("breath") || soundId.includes("nefes")) {
    return "breath-calm";
  }

  // Default meditation animation for unknown sounds
  return "default-meditation";
}

/**
 * Get animation configuration for a specific animation type
 */
export function getAnimationConfig(
  animationType: AnimationType,
  frequency?: number,
): AnimationConfig {
  switch (animationType) {
    case "frequency-healing":
      // Frequency-specific configurations
      if (frequency === 111) {
        return {
          type: animationType,
          baseHue: 260,
          secondaryHue: 280,
          ringCount: 7,
          particleCount: 38,
          pulseSpeed: 0.015,
          rotationSpeed: 0.003,
          glowIntensity: 28,
        };
      }
      if (frequency === 174) {
        return {
          type: animationType,
          baseHue: 30,
          secondaryHue: 45,
          ringCount: 6,
          particleCount: 35,
          pulseSpeed: 0.012,
          rotationSpeed: 0.002,
          glowIntensity: 26,
        };
      }
      if (frequency === 285) {
        return {
          type: animationType,
          baseHue: 120,
          secondaryHue: 140,
          ringCount: 7,
          particleCount: 38,
          pulseSpeed: 0.016,
          rotationSpeed: 0.004,
          glowIntensity: 24,
        };
      }
      if (frequency === 396) {
        return {
          type: animationType,
          baseHue: 45,
          secondaryHue: 60,
          ringCount: 8,
          particleCount: 42,
          pulseSpeed: 0.02,
          rotationSpeed: 0.006,
          glowIntensity: 30,
        };
      }
      if (frequency === 417) {
        return {
          type: animationType,
          baseHue: 200,
          secondaryHue: 30,
          ringCount: 7,
          particleCount: 40,
          pulseSpeed: 0.024,
          rotationSpeed: 0.005,
          glowIntensity: 28,
        };
      }
      if (frequency === 432) {
        return {
          type: animationType,
          baseHue: 50,
          secondaryHue: 130,
          ringCount: 8,
          particleCount: 42,
          pulseSpeed: 0.015,
          rotationSpeed: 0.004,
          glowIntensity: 30,
        };
      }
      if (frequency === 528) {
        return {
          type: animationType,
          baseHue: 330,
          secondaryHue: 45,
          ringCount: 9,
          particleCount: 50,
          pulseSpeed: 0.018,
          rotationSpeed: 0.007,
          glowIntensity: 35,
        };
      }
      if (frequency === 639) {
        return {
          type: animationType,
          baseHue: 25,
          secondaryHue: 280,
          ringCount: 8,
          particleCount: 40,
          pulseSpeed: 0.016,
          rotationSpeed: 0.005,
          glowIntensity: 26,
        };
      }
      if (frequency === 741) {
        return {
          type: animationType,
          baseHue: 270,
          secondaryHue: 250,
          ringCount: 10,
          particleCount: 48,
          pulseSpeed: 0.022,
          rotationSpeed: 0.008,
          glowIntensity: 33,
        };
      }
      if (frequency === 852) {
        return {
          type: animationType,
          baseHue: 210,
          secondaryHue: 0,
          ringCount: 12,
          particleCount: 55,
          pulseSpeed: 0.02,
          rotationSpeed: 0.006,
          glowIntensity: 38,
        };
      }
      if (frequency === 963) {
        return {
          type: animationType,
          baseHue: 280,
          secondaryHue: 0,
          ringCount: 13,
          particleCount: 60,
          pulseSpeed: 0.022,
          rotationSpeed: 0.007,
          glowIntensity: 42,
        };
      }
      // Default frequency animation
      return {
        type: animationType,
        baseHue: 200,
        secondaryHue: 220,
        ringCount: 7,
        particleCount: 40,
        pulseSpeed: 0.016,
        rotationSpeed: 0.004,
        glowIntensity: 28,
      };

    case "ocean-waves":
      return {
        type: animationType,
        baseHue: 200,
        secondaryHue: 210,
        ringCount: 6,
        particleCount: 30,
        pulseSpeed: 0.01,
        rotationSpeed: 0.002,
        glowIntensity: 22,
      };

    case "rain-drops":
      return {
        type: animationType,
        baseHue: 210,
        secondaryHue: 220,
        ringCount: 8,
        particleCount: 45,
        pulseSpeed: 0.014,
        rotationSpeed: 0.003,
        glowIntensity: 20,
      };

    case "forest-ambient":
      return {
        type: animationType,
        baseHue: 120,
        secondaryHue: 140,
        ringCount: 7,
        particleCount: 35,
        pulseSpeed: 0.012,
        rotationSpeed: 0.002,
        glowIntensity: 24,
      };

    case "fire-glow":
      return {
        type: animationType,
        baseHue: 20,
        secondaryHue: 40,
        ringCount: 6,
        particleCount: 32,
        pulseSpeed: 0.018,
        rotationSpeed: 0.004,
        glowIntensity: 32,
      };

    case "wind-flow":
      return {
        type: animationType,
        baseHue: 180,
        secondaryHue: 200,
        ringCount: 9,
        particleCount: 50,
        pulseSpeed: 0.02,
        rotationSpeed: 0.006,
        glowIntensity: 18,
      };

    case "white-noise":
      return {
        type: animationType,
        baseHue: 0,
        secondaryHue: 0,
        ringCount: 5,
        particleCount: 25,
        pulseSpeed: 0.008,
        rotationSpeed: 0.001,
        glowIntensity: 16,
      };

    case "pink-noise":
      return {
        type: animationType,
        baseHue: 330,
        secondaryHue: 340,
        ringCount: 5,
        particleCount: 25,
        pulseSpeed: 0.008,
        rotationSpeed: 0.001,
        glowIntensity: 18,
      };

    case "brown-noise":
      return {
        type: animationType,
        baseHue: 30,
        secondaryHue: 40,
        ringCount: 5,
        particleCount: 25,
        pulseSpeed: 0.008,
        rotationSpeed: 0.001,
        glowIntensity: 20,
      };

    case "heartbeat-pulse":
      return {
        type: animationType,
        baseHue: 0,
        secondaryHue: 20,
        ringCount: 4,
        particleCount: 20,
        pulseSpeed: 0.024,
        rotationSpeed: 0.001,
        glowIntensity: 26,
      };

    case "lullaby-gentle":
      return {
        type: animationType,
        baseHue: 280,
        secondaryHue: 300,
        ringCount: 6,
        particleCount: 28,
        pulseSpeed: 0.01,
        rotationSpeed: 0.002,
        glowIntensity: 22,
      };

    case "space-cosmic":
      return {
        type: animationType,
        baseHue: 260,
        secondaryHue: 280,
        ringCount: 10,
        particleCount: 55,
        pulseSpeed: 0.014,
        rotationSpeed: 0.005,
        glowIntensity: 30,
      };

    case "night-stars":
      return {
        type: animationType,
        baseHue: 240,
        secondaryHue: 260,
        ringCount: 8,
        particleCount: 40,
        pulseSpeed: 0.012,
        rotationSpeed: 0.003,
        glowIntensity: 28,
      };

    case "breath-calm":
      return {
        type: animationType,
        baseHue: 180,
        secondaryHue: 200,
        ringCount: 5,
        particleCount: 22,
        pulseSpeed: 0.008,
        rotationSpeed: 0.001,
        glowIntensity: 20,
      };

    default:
      return {
        type: animationType,
        baseHue: 200,
        secondaryHue: 220,
        ringCount: 6,
        particleCount: 30,
        pulseSpeed: 0.014,
        rotationSpeed: 0.003,
        glowIntensity: 24,
      };
  }
}

/**
 * Main selector function that always returns a valid animation configuration
 */
export function selectMeditationAnimation(
  currentFrequency: number | null,
  currentSoundId: string | null,
): AnimationConfig {
  if (currentFrequency !== null) {
    const animationType = getAnimationForFrequency(currentFrequency);
    return getAnimationConfig(animationType, currentFrequency);
  }

  if (currentSoundId !== null) {
    const animationType = getAnimationForSound(currentSoundId);
    return getAnimationConfig(animationType);
  }

  // Safe fallback for unknown state
  return getAnimationConfig("default-meditation");
}
