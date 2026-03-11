import { useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { selectMeditationAnimation } from "../lib/meditationAnimationMapping";

interface SoundWaveVisualizationProps {
  visualIntensity: number;
  frequency: number | null;
  soundId: string | null;
  onClose: () => void;
}

export default function SoundWaveVisualization({
  visualIntensity,
  frequency,
  soundId,
  onClose,
}: SoundWaveVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { t } = useLanguage();

  const handleScreenClick = () => {
    onClose();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get animation configuration based on current audio
    const config = selectMeditationAnimation(frequency, soundId);

    // Resize canvas with device pixel ratio for sharp rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();

    const particles: Array<{
      angle: number;
      radius: number;
      speed: number;
      size: number;
      hue: number;
      alpha: number;
      orbitRadius: number;
    }> = [];

    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / config.particleCount,
        radius: 100 + Math.random() * 150,
        speed: 0.006 + Math.random() * 0.012,
        size: Math.random() * 2.5 + 1.2,
        hue: Math.random() > 0.5 ? config.baseHue : config.secondaryHue,
        alpha: Math.random() * 0.3 + 0.4,
        orbitRadius: 10 + Math.random() * 20,
      });
    }

    let time = 0;

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      time += config.pulseSpeed;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Draw mystical circular rings with pulsing halos
      for (let i = 0; i < config.ringCount; i++) {
        const baseRadius = 80 + i * 40;
        const ringRadius =
          baseRadius + Math.sin(time + i * 0.5) * 20 * (visualIntensity + 0.3);
        const ringAlpha = (0.35 - i * 0.025) * (0.5 + visualIntensity * 0.5);

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          ringRadius - 10,
          centerX,
          centerY,
          ringRadius + 15,
        );
        gradient.addColorStop(
          0,
          `hsla(${config.baseHue + i * 10}, 70%, 60%, 0)`,
        );
        gradient.addColorStop(
          0.5,
          `hsla(${config.baseHue + i * 10}, 70%, 60%, ${ringAlpha})`,
        );
        gradient.addColorStop(
          1,
          `hsla(${config.baseHue + i * 10}, 70%, 60%, 0)`,
        );

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `hsla(${config.secondaryHue + i * 10}, 80%, 70%, ${ringAlpha * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          ringRadius,
          time + i,
          time + i + Math.PI * 1.5,
        );
        ctx.stroke();
      }

      // Draw central pulsing aura
      const centralRadius =
        45 + Math.sin(time * 2.5) * 18 * (visualIntensity + 0.5);
      const centralGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        centralRadius,
      );
      centralGradient.addColorStop(0, `hsla(${config.baseHue}, 85%, 75%, 0.5)`);
      centralGradient.addColorStop(
        0.5,
        `hsla(${config.secondaryHue}, 80%, 70%, 0.35)`,
      );
      centralGradient.addColorStop(1, `hsla(${config.baseHue}, 75%, 65%, 0)`);

      ctx.fillStyle = centralGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centralRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles
      for (const particle of particles) {
        particle.angle +=
          particle.speed * (0.5 + visualIntensity * 0.5) + config.rotationSpeed;

        const pulseRadius =
          particle.radius +
          Math.sin(time * 1.8) * particle.orbitRadius * (visualIntensity + 0.3);
        const x = centerX + Math.cos(particle.angle) * pulseRadius;
        const y = centerY + Math.sin(particle.angle) * pulseRadius;

        const particleAlpha = particle.alpha * (0.6 + visualIntensity * 0.4);
        ctx.shadowBlur = config.glowIntensity * 0.8;
        ctx.shadowColor = `hsla(${particle.hue}, 80%, 70%, ${particleAlpha})`;

        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particleAlpha})`;
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    const handleOrientationChange = () => {
      setTimeout(resizeCanvas, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [visualIntensity, frequency, soundId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      onClick={handleScreenClick}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") handleScreenClick();
      }}
      role="presentation"
      className="fixed inset-0 z-[100] bg-black cursor-pointer"
      style={{
        touchAction: "manipulation",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/40 text-sm animate-pulse">
          {t.visualizationExitHint || "Tap anywhere or press ESC to exit"}
        </div>
      </div>
    </div>
  );
}
