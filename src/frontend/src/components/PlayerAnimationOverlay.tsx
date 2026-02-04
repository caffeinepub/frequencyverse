import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../hooks/useLanguage';
import { selectMeditationAnimation } from '../lib/meditationAnimationMapping';

interface PlayerAnimationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrequency: number | null;
  currentSoundId: string | null;
  visualIntensity: number;
}

export default function PlayerAnimationOverlay({
  isOpen,
  onClose,
  currentFrequency,
  currentSoundId,
  visualIntensity,
}: PlayerAnimationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get animation configuration based on current audio
    const config = selectMeditationAnimation(currentFrequency, currentSoundId);

    // Resize canvas with device pixel ratio for sharp rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();

    // Initialize particles
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
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      time += config.pulseSpeed;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Draw mystical circular rings with pulsing halos
      for (let i = 0; i < config.ringCount; i++) {
        const baseRadius = 80 + i * 40;
        const ringRadius = baseRadius + Math.sin(time + i * 0.5) * 20 * (visualIntensity + 0.3);
        const ringAlpha = (0.35 - i * 0.025) * (0.5 + visualIntensity * 0.5);
        
        const gradient = ctx.createRadialGradient(centerX, centerY, ringRadius - 10, centerX, centerY, ringRadius + 15);
        gradient.addColorStop(0, `hsla(${config.baseHue + i * 10}, 70%, 60%, 0)`);
        gradient.addColorStop(0.5, `hsla(${config.baseHue + i * 10}, 70%, 60%, ${ringAlpha})`);
        gradient.addColorStop(1, `hsla(${config.baseHue + i * 10}, 70%, 60%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `hsla(${config.secondaryHue + i * 10}, 80%, 70%, ${ringAlpha * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, time + i, time + i + Math.PI * 1.5);
        ctx.stroke();
      }

      // Draw central pulsing aura
      const centralRadius = 45 + Math.sin(time * 2.5) * 18 * (visualIntensity + 0.5);
      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralRadius);
      centralGradient.addColorStop(0, `hsla(${config.baseHue}, 85%, 75%, 0.5)`);
      centralGradient.addColorStop(0.5, `hsla(${config.secondaryHue}, 80%, 70%, 0.35)`);
      centralGradient.addColorStop(1, `hsla(${config.baseHue}, 75%, 65%, 0)`);
      
      ctx.fillStyle = centralGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centralRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles
      particles.forEach((particle) => {
        particle.angle += particle.speed * (0.5 + visualIntensity * 0.5) + config.rotationSpeed;
        
        const pulseRadius = particle.radius + Math.sin(time * 1.8) * particle.orbitRadius * (visualIntensity + 0.3);
        const x = centerX + Math.cos(particle.angle) * pulseRadius;
        const y = centerY + Math.sin(particle.angle) * pulseRadius;

        const particleAlpha = particle.alpha * (0.6 + visualIntensity * 0.4);
        ctx.shadowBlur = config.glowIntensity * 0.8;
        ctx.shadowColor = `hsla(${particle.hue}, 80%, 70%, ${particleAlpha})`;
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particleAlpha})`;
        ctx.fill();
      });

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

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isOpen, visualIntensity, currentFrequency, currentSoundId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleBodyScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    document.body.addEventListener('touchmove', handleBodyScroll, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.removeEventListener('touchmove', handleBodyScroll);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-[100] bg-black"
      style={{ 
        touchAction: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 z-10"
        style={{ 
          marginTop: 'env(safe-area-inset-top)',
          minHeight: '44px',
          minWidth: '44px',
        }}
        aria-label={t.visualizationToggle}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Exit hint */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="text-white/40 text-sm animate-pulse px-4 text-center">
          {t.visualizationExitHint || 'Tap anywhere or press ESC to exit'}
        </div>
      </div>
    </div>
  );
}
