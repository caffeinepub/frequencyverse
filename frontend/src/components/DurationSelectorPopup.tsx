import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '../hooks/useLanguage';
import { useVisualTheme } from '../hooks/useTheme';

interface DurationSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentDuration: number;
  onDurationChange: (duration: number) => void;
}

export default function DurationSelectorPopup({
  isOpen,
  onClose,
  currentDuration,
  onDurationChange,
}: DurationSelectorPopupProps) {
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const [localDuration, setLocalDuration] = useState(currentDuration);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalDuration(currentDuration);
  }, [currentDuration]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSliderChange = (value: number[]) => {
    setLocalDuration(value[0]);
    onDurationChange(value[0]);
  };

  // Tick marks for the duration slider (showing key minute values)
  const tickMarks = [1, 15, 30, 60, 90, 120, 150, 180];

  // Theme-adaptive gradient backgrounds and glow colors
  const getThemeStyles = () => {
    switch (theme) {
      case 'aurora-glow':
        return {
          gradient: 'from-purple-900/95 via-indigo-900/95 to-blue-900/95',
          glow: 'shadow-[0_0_40px_rgba(139,92,246,0.5)]',
          border: 'border-purple-500/50',
        };
      case 'celestial-calm':
        return {
          gradient: 'from-indigo-950/95 via-blue-950/95 to-slate-900/95',
          glow: 'shadow-[0_0_40px_rgba(99,102,241,0.5)]',
          border: 'border-indigo-500/50',
        };
      case 'sacred-lotus':
        return {
          gradient: 'from-teal-900/95 via-emerald-900/95 to-green-900/95',
          glow: 'shadow-[0_0_40px_rgba(20,184,166,0.5)]',
          border: 'border-teal-500/50',
        };
      case 'ethereal-waves':
        return {
          gradient: 'from-violet-900/95 via-fuchsia-900/95 to-pink-900/95',
          glow: 'shadow-[0_0_40px_rgba(192,132,252,0.5)]',
          border: 'border-violet-500/50',
        };
      case 'zen-garden':
        return {
          gradient: 'from-slate-800/95 via-gray-800/95 to-stone-800/95',
          glow: 'shadow-[0_0_40px_rgba(148,163,184,0.5)]',
          border: 'border-slate-500/50',
        };
      default:
        return {
          gradient: 'from-purple-900/95 via-indigo-900/95 to-blue-900/95',
          glow: 'shadow-[0_0_40px_rgba(139,92,246,0.5)]',
          border: 'border-purple-500/50',
        };
    }
  };

  const themeStyles = getThemeStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-3 sm:p-4">
      <div
        ref={popupRef}
        className={`relative w-full max-w-md bg-gradient-to-br ${themeStyles.gradient} backdrop-blur-xl border ${themeStyles.border} ${themeStyles.glow} rounded-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200`}
      >
        {/* Close Button - Mobile optimized */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 min-h-[44px] min-w-[44px]"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-5 sm:mb-6 drop-shadow-lg pr-12">
          Süre Seçimi
        </h3>

        {/* Duration Display - Mobile optimized */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
            {localDuration}
          </div>
          <div className="text-base sm:text-lg text-white/80 mt-2 drop-shadow-md">
            {t.durationUnit}
          </div>
        </div>

        {/* Slider - Mobile optimized with larger touch area */}
        <div className="mb-5 sm:mb-6 px-1">
          <Slider
            value={[localDuration]}
            onValueChange={handleSliderChange}
            min={1}
            max={180}
            step={0.5}
            className="w-full touch-manipulation"
          />
          
          {/* Tick marks - Responsive */}
          <div className="flex justify-between mt-3 px-1">
            {tickMarks.map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className="w-px h-2 bg-white/40" />
                <span className="text-[10px] sm:text-xs text-white/70 mt-1 drop-shadow-sm">{tick}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Text - Mobile optimized */}
        <p className="text-xs sm:text-sm text-white/70 text-center drop-shadow-md leading-relaxed">
          Seçilen süre dolduğunda çalma otomatik olarak duracaktır
        </p>
      </div>
    </div>
  );
}
