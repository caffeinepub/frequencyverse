import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useVisualTheme, VisualTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { VISUAL_THEME_OPTIONS } from '../lib/visualThemes';

interface ThemeSelectorPopupProps {
  onClose: () => void;
}

export default function ThemeSelectorPopup({ onClose }: ThemeSelectorPopupProps) {
  const { theme, setTheme } = useVisualTheme();
  const { t } = useLanguage();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number; maxHeight: number }>({
    left: 0,
    maxHeight: 600,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Calculate optimal position to ensure popup opens downward and stays within viewport
    const calculatePosition = () => {
      if (!popupRef.current) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 16; // 1rem margin from viewport edges
      
      // Find the theme button in the header - search for all possible theme labels across languages
      const themeButton = document.querySelector('button[aria-label*="Theme"], button[aria-label*="Tema"], button[aria-label*="Thème"], button[aria-label*="Thema"], button[aria-label*="Тема"], button[aria-label*="السمة"], button[aria-label*="テーマ"], button[aria-label*="主题"]');
      
      if (themeButton) {
        const buttonRect = themeButton.getBoundingClientRect();
        const popupWidth = 448; // max-w-md = 28rem = 448px
        const actualPopupWidth = Math.min(popupWidth, viewportWidth - margin * 2);
        
        // Calculate left position (center popup under button)
        let left = buttonRect.left + buttonRect.width / 2 - actualPopupWidth / 2;
        
        // Ensure popup doesn't overflow left edge
        if (left < margin) {
          left = margin;
        }
        
        // Ensure popup doesn't overflow right edge
        if (left + actualPopupWidth > viewportWidth - margin) {
          left = viewportWidth - actualPopupWidth - margin;
        }
        
        // Calculate available space below button
        const spaceBelow = viewportHeight - buttonRect.bottom - margin;
        
        // Calculate maximum height for popup
        const maxHeight = Math.max(300, spaceBelow - margin);
        
        // Always position below the button (downward opening)
        setPosition({
          top: buttonRect.bottom + 8, // 8px gap below button
          left,
          maxHeight,
        });
      } else {
        // Fallback: center horizontally, position near top
        const popupWidth = 448;
        const actualPopupWidth = Math.min(popupWidth, viewportWidth - margin * 2);
        const left = (viewportWidth - actualPopupWidth) / 2;
        const maxHeight = viewportHeight - margin * 3;
        
        setPosition({
          top: margin * 2,
          left,
          maxHeight,
        });
      }
    };

    // Calculate position after popup renders
    const timer = setTimeout(calculatePosition, 0);
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
    };
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'aurora-glow':
        return {
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
          border: 'border-purple-400/40',
          text: 'text-purple-200',
          hoverBg: 'hover:bg-purple-500/30',
          activeBg: 'bg-purple-500/40',
        };
      case 'celestial-calm':
        return {
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
          border: 'border-blue-400/40',
          text: 'text-blue-200',
          hoverBg: 'hover:bg-blue-500/30',
          activeBg: 'bg-blue-500/40',
        };
      case 'sacred-lotus':
        return {
          glow: 'shadow-[0_0_30px_rgba(236,72,153,0.5)]',
          border: 'border-pink-400/40',
          text: 'text-pink-200',
          hoverBg: 'hover:bg-pink-500/30',
          activeBg: 'bg-pink-500/40',
        };
      case 'ethereal-waves':
        return {
          glow: 'shadow-[0_0_30px_rgba(34,211,238,0.5)]',
          border: 'border-cyan-400/40',
          text: 'text-cyan-200',
          hoverBg: 'hover:bg-cyan-500/30',
          activeBg: 'bg-cyan-500/40',
        };
      case 'zen-garden':
        return {
          glow: 'shadow-[0_0_30px_rgba(34,197,94,0.5)]',
          border: 'border-green-400/40',
          text: 'text-green-200',
          hoverBg: 'hover:bg-green-500/30',
          activeBg: 'bg-green-500/40',
        };
      default:
        return {
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
          border: 'border-purple-400/40',
          text: 'text-purple-200',
          hoverBg: 'hover:bg-purple-500/30',
          activeBg: 'bg-purple-500/40',
        };
    }
  };

  const colors = getThemeColors();

  const getTitle = (): string => {
    const titles: Record<string, string> = {
      tr: 'Tema Seçin',
      en: 'Select Theme',
      es: 'Seleccionar Tema',
      fr: 'Sélectionner le Thème',
      de: 'Thema Auswählen',
      it: 'Seleziona Tema',
      ru: 'Выберите Тему',
      ar: 'اختر السمة',
      ja: 'テーマを選択',
      zh: '选择主题',
      pt: 'Selecionar Tema',
    };
    
    const lang = t.subtitle.includes('frekans') ? 'tr' : 
                 t.subtitle.includes('Discover') ? 'en' :
                 t.subtitle.includes('Descubre') ? 'es' :
                 t.subtitle.includes('Découvrez') ? 'fr' :
                 t.subtitle.includes('Entdecken') ? 'de' :
                 t.subtitle.includes('Scopri') ? 'it' :
                 t.subtitle.includes('Откройте') ? 'ru' :
                 t.subtitle.includes('اكتشف') ? 'ar' :
                 t.subtitle.includes('発見') ? 'ja' :
                 t.subtitle.includes('发现') ? 'zh' :
                 t.subtitle.includes('Descubra') ? 'pt' : 'tr';
    
    return titles[lang] || 'Tema Seçin';
  };

  const handleSelect = (value: VisualTheme) => {
    setTheme(value);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div 
        ref={popupRef}
        className="fixed z-50 w-full max-w-md animate-in slide-in-from-top-2 duration-200"
        style={{
          top: position.top !== undefined ? `${position.top}px` : undefined,
          bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
          left: `${position.left}px`,
          maxHeight: `${position.maxHeight}px`,
        }}
      >
        <div className={`
          backdrop-blur-md bg-black/80 border ${colors.border}
          ${colors.glow} rounded-xl p-4 sm:p-6 mx-4
          flex flex-col h-full
        `}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg ${colors.text} ${colors.hoverBg}
                transition-colors duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
              `}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3 overflow-y-auto flex-1 pr-1">
            {VISUAL_THEME_OPTIONS.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleSelect(themeOption.value)}
                className={`
                  p-4 rounded-lg border ${colors.border}
                  ${theme === themeOption.value ? colors.activeBg : 'bg-black/20'}
                  ${colors.text} ${colors.hoverBg}
                  transition-all duration-200
                  text-left font-medium min-h-[44px]
                `}
              >
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
