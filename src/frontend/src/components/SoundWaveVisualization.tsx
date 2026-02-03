import { useEffect, useRef } from 'react';
import { useVisualTheme } from '../hooks/useTheme';

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
  onClose 
}: SoundWaveVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { theme } = useVisualTheme();
  const fadeRef = useRef<number>(0);

  // Handle screen tap/click to exit full-screen mode
  const handleScreenClick = () => {
    onClose();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Full-screen mystical circular animation configuration
    let config = {
      baseHue: 200,
      secondaryHue: 220,
      ringCount: 5,
      particleCount: 40,
      pulseSpeed: 0.02,
      rotationSpeed: 0.005,
      glowIntensity: 25,
    };

    if (frequency) {
      // Each frequency displays its single dedicated circular aura animation
      if (frequency === 111) {
        // Deep indigo circular patterns with concentration-enhancing violet rings and awareness-boosting light spirals
        config = { baseHue: 260, secondaryHue: 280, ringCount: 7, particleCount: 38, pulseSpeed: 0.018, rotationSpeed: 0.004, glowIntensity: 32 };
      } else if (frequency === 174) {
        // Deep earth-toned circular halos with gentle pulsing rings and warm amber particle glow
        config = { baseHue: 30, secondaryHue: 45, ringCount: 6, particleCount: 35, pulseSpeed: 0.015, rotationSpeed: 0.003, glowIntensity: 30 };
      } else if (frequency === 285) {
        // Organic flowing circular patterns with healing green gradient rings and cellular regeneration light waves
        config = { baseHue: 120, secondaryHue: 140, ringCount: 7, particleCount: 38, pulseSpeed: 0.02, rotationSpeed: 0.006, glowIntensity: 28 };
      } else if (frequency === 396) {
        // Golden spiral circular animations with expanding liberation light rings and radiant energy halos
        config = { baseHue: 45, secondaryHue: 60, ringCount: 8, particleCount: 42, pulseSpeed: 0.025, rotationSpeed: 0.008, glowIntensity: 35 };
      } else if (frequency === 417) {
        // Dynamic circular color-shifting patterns with transformative blue-orange gradient rings and cleansing energy waves
        config = { baseHue: 200, secondaryHue: 30, ringCount: 7, particleCount: 40, pulseSpeed: 0.03, rotationSpeed: 0.007, glowIntensity: 32 };
      } else if (frequency === 432) {
        // Natural harmony circular patterns with earth-tone golden and green flowing rings and universal balance light waves
        config = { baseHue: 50, secondaryHue: 130, ringCount: 8, particleCount: 42, pulseSpeed: 0.019, rotationSpeed: 0.005, glowIntensity: 34 };
      } else if (frequency === 528) {
        // Radiant circular spirals with love-frequency pink and gold pulsing halos, heart-shaped particle effects in circular motion
        config = { baseHue: 330, secondaryHue: 45, ringCount: 9, particleCount: 50, pulseSpeed: 0.022, rotationSpeed: 0.009, glowIntensity: 40 };
      } else if (frequency === 639) {
        // Interconnected circular harmony patterns with warm orange and soft purple gradient rings and relationship energy waves
        config = { baseHue: 25, secondaryHue: 280, ringCount: 8, particleCount: 40, pulseSpeed: 0.02, rotationSpeed: 0.006, glowIntensity: 30 };
      } else if (frequency === 741) {
        // Shimmering crystalline circular patterns with violet-indigo pulsing halos and intuitive clearing light rings
        config = { baseHue: 270, secondaryHue: 250, ringCount: 10, particleCount: 48, pulseSpeed: 0.028, rotationSpeed: 0.01, glowIntensity: 38 };
      } else if (frequency === 852) {
        // Luminous circular orb animations with cosmic blue and white expanding consciousness rings and awareness enhancement halos
        config = { baseHue: 210, secondaryHue: 0, ringCount: 12, particleCount: 55, pulseSpeed: 0.025, rotationSpeed: 0.008, glowIntensity: 45 };
      } else if (frequency === 888) {
        // Balanced energy circular patterns with spiritual harmony silver and gold flowing rings and equilibrium light waves
        config = { baseHue: 40, secondaryHue: 220, ringCount: 9, particleCount: 45, pulseSpeed: 0.021, rotationSpeed: 0.007, glowIntensity: 36 };
      } else if (frequency === 963) {
        // Cosmic consciousness circular animations with transcendent white and violet expanding awareness rings and higher consciousness light spirals
        config = { baseHue: 280, secondaryHue: 0, ringCount: 13, particleCount: 60, pulseSpeed: 0.027, rotationSpeed: 0.009, glowIntensity: 48 };
      }
    } else if (soundId) {
      // Child-friendly circular visuals with soft pastel animations and slow glowing circular effects
      config = { baseHue: 180, secondaryHue: 200, ringCount: 5, particleCount: 25, pulseSpeed: 0.01, rotationSpeed: 0.002, glowIntensity: 20 };
    }

    const particles: Array<{
      angle: number;
      radius: number;
      speed: number;
      size: number;
      hue: number;
      alpha: number;
      orbitRadius: number;
    }> = [];

    // Initialize particles in circular motion for full-screen display
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / config.particleCount,
        radius: 100 + Math.random() * 150,
        speed: 0.008 + Math.random() * 0.015,
        size: Math.random() * 3 + 1.5,
        hue: Math.random() > 0.5 ? config.baseHue : config.secondaryHue,
        alpha: Math.random() * 0.4 + 0.5,
        orbitRadius: 10 + Math.random() * 20,
      });
    }

    let time = 0;
    fadeRef.current = 0;

    const animate = () => {
      // Smooth fade-in transition when entering full-screen
      if (fadeRef.current < 1) {
        fadeRef.current = Math.min(1, fadeRef.current + 0.05);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += config.pulseSpeed;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw large mystical circular rings with pulsing halos that expand to fill the center
      for (let i = 0; i < config.ringCount; i++) {
        const baseRadius = 80 + i * 40;
        const ringRadius = baseRadius + Math.sin(time + i * 0.5) * 25 * (visualIntensity + 0.3);
        const ringAlpha = (0.4 - i * 0.03) * (0.5 + visualIntensity * 0.5) * fadeRef.current;
        
        // Outer glow halo with soft light diffusion
        const gradient = ctx.createRadialGradient(centerX, centerY, ringRadius - 10, centerX, centerY, ringRadius + 15);
        gradient.addColorStop(0, `hsla(${config.baseHue + i * 10}, 75%, 65%, 0)`);
        gradient.addColorStop(0.5, `hsla(${config.baseHue + i * 10}, 75%, 65%, ${ringAlpha})`);
        gradient.addColorStop(1, `hsla(${config.baseHue + i * 10}, 75%, 65%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner flowing light ring with rotation
        ctx.strokeStyle = `hsla(${config.secondaryHue + i * 10}, 85%, 75%, ${ringAlpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, time + i, time + i + Math.PI * 1.5);
        ctx.stroke();

        // Additional pulsing ring layer
        const pulseRadius = ringRadius + Math.sin(time * 2 + i) * 8;
        ctx.strokeStyle = `hsla(${config.baseHue + i * 15}, 80%, 70%, ${ringAlpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw energy wave patterns with circular motion
      const waveCount = 5;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
          const waveRadius = 120 + w * 50 + Math.sin(angle * 4 + time * 2 + w) * 20 * (visualIntensity + 0.3);
          const x = centerX + Math.cos(angle) * waveRadius;
          const y = centerY + Math.sin(angle) * waveRadius;
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        
        const waveAlpha = (0.3 - w * 0.04) * (0.5 + visualIntensity * 0.5) * fadeRef.current;
        ctx.strokeStyle = `hsla(${config.baseHue + w * 20}, 80%, 70%, ${waveAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw central pulsing aura that expands and pulses in sync with sound intensity
      const centralRadius = 50 + Math.sin(time * 3) * 20 * (visualIntensity + 0.5);
      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralRadius);
      centralGradient.addColorStop(0, `hsla(${config.baseHue}, 90%, 80%, ${0.6 * fadeRef.current})`);
      centralGradient.addColorStop(0.5, `hsla(${config.secondaryHue}, 85%, 75%, ${0.4 * fadeRef.current})`);
      centralGradient.addColorStop(1, `hsla(${config.baseHue}, 80%, 70%, 0)`);
      
      ctx.fillStyle = centralGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centralRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles in circular motion with enhanced glow effects
      particles.forEach((particle, index) => {
        particle.angle += particle.speed * (0.5 + visualIntensity * 0.5) + config.rotationSpeed;
        
        const pulseRadius = particle.radius + Math.sin(time * 2 + index * 0.3) * particle.orbitRadius * (visualIntensity + 0.3);
        const x = centerX + Math.cos(particle.angle) * pulseRadius;
        const y = centerY + Math.sin(particle.angle) * pulseRadius;

        // Enhanced particle glow effect for full-screen
        const particleAlpha = particle.alpha * (0.6 + visualIntensity * 0.4) * fadeRef.current;
        ctx.shadowBlur = config.glowIntensity * fadeRef.current;
        ctx.shadowColor = `hsla(${particle.hue}, 85%, 75%, ${particleAlpha})`;
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 85%, 75%, ${particleAlpha})`;
        ctx.fill();

        // Add trailing glow for 528 Hz (love frequency) with heart-shaped particle effects
        if (frequency === 528 && index % 5 === 0) {
          ctx.shadowBlur = config.glowIntensity * 1.5 * fadeRef.current;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 90%, 80%, ${particleAlpha * 0.5})`;
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [visualIntensity, frequency, soundId, theme]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      ref={containerRef}
      onClick={handleScreenClick}
      className="fixed inset-0 z-[100] bg-black cursor-pointer animate-in fade-in duration-500"
      style={{ touchAction: 'manipulation' }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/30 text-sm animate-pulse">
          Çıkmak için ekrana dokunun
        </div>
      </div>
    </div>
  );
}
