import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useBackgroundAmbiance, AmbianceType } from '../hooks/useBackgroundAmbiance';
import { useLanguage } from '../hooks/useLanguage';
import { useVisualTheme } from '../hooks/useTheme';

interface BackgroundAmbianceSelectorPopupProps {
  onClose: () => void;
}

export default function BackgroundAmbianceSelectorPopup({ onClose }: BackgroundAmbianceSelectorPopupProps) {
  const { currentAmbiance, setAmbiance } = useBackgroundAmbiance();
  const { t } = useLanguage();
  const { theme } = useVisualTheme();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
      tr: 'Arka Plan Sesleri',
      en: 'Background Sounds',
      es: 'Sonidos de Fondo',
      fr: 'Sons de Fond',
      de: 'Hintergrundgeräusche',
      it: 'Suoni di Sottofondo',
      ru: 'Фоновые Звуки',
      ar: 'أصوات الخلفية',
      ja: '背景音',
      zh: '背景声音',
      pt: 'Sons de Fundo',
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
    
    return titles[lang] || 'Arka Plan Sesleri';
  };

  const getAmbianceName = (type: AmbianceType | null): string => {
    if (!type) {
      const offLabels: Record<string, string> = {
        tr: 'Kapalı',
        en: 'Off',
        es: 'Apagado',
        fr: 'Désactivé',
        de: 'Aus',
        it: 'Spento',
        ru: 'Выкл',
        ar: 'إيقاف',
        ja: 'オフ',
        zh: '关闭',
        pt: 'Desligado',
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
      
      return offLabels[lang] || 'Kapalı';
    }

    const names: Record<string, Record<string, string>> = {
      'soft-wind': {
        tr: 'Yumuşak Rüzgar',
        en: 'Soft Wind',
        es: 'Viento Suave',
        fr: 'Vent Doux',
        de: 'Sanfter Wind',
        it: 'Vento Morbido',
        ru: 'Мягкий Ветер',
        ar: 'رياح ناعمة',
        ja: '柔らかい風',
        zh: '柔和的风',
        pt: 'Vento Suave',
      },
      'ocean-waves': {
        tr: 'Okyanus Dalgaları',
        en: 'Ocean Waves',
        es: 'Olas del Océano',
        fr: 'Vagues de l\'Océan',
        de: 'Meereswellen',
        it: 'Onde dell\'Oceano',
        ru: 'Океанские Волны',
        ar: 'أمواج المحيط',
        ja: '海の波',
        zh: '海浪',
        pt: 'Ondas do Oceano',
      },
      'gentle-rain': {
        tr: 'Hafif Yağmur',
        en: 'Gentle Rain',
        es: 'Lluvia Suave',
        fr: 'Pluie Douce',
        de: 'Sanfter Regen',
        it: 'Pioggia Delicata',
        ru: 'Нежный Дождь',
        ar: 'مطر لطيف',
        ja: '優しい雨',
        zh: '温柔的雨',
        pt: 'Chuva Suave',
      },
      'distant-fire': {
        tr: 'Uzak Şömine',
        en: 'Distant Fire Crackle',
        es: 'Crepitar de Fuego Distante',
        fr: 'Crépitement de Feu Lointain',
        de: 'Fernes Feuerknistern',
        it: 'Crepitio di Fuoco Distante',
        ru: 'Далекий Треск Огня',
        ar: 'طقطقة نار بعيدة',
        ja: '遠くの火のパチパチ音',
        zh: '远处的火焰噼啪声',
        pt: 'Crepitar de Fogo Distante',
      },
      'ambient-pad': {
        tr: 'Ambient Pad',
        en: 'Ambient Pad',
        es: 'Pad Ambiental',
        fr: 'Pad Ambiant',
        de: 'Ambient Pad',
        it: 'Pad Ambientale',
        ru: 'Эмбиент Пад',
        ar: 'باد محيط',
        ja: 'アンビエントパッド',
        zh: '环境音垫',
        pt: 'Pad Ambiental',
      },
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
    
    return names[type]?.[lang] || type;
  };

  const handleSelect = (type: AmbianceType | null) => {
    setAmbiance(type);
    onClose();
  };

  const ambianceOptions: (AmbianceType | null)[] = [
    null,
    'soft-wind',
    'ocean-waves',
    'gentle-rain',
    'distant-fire',
    'ambient-pad',
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className={`
          backdrop-blur-md bg-black/80 border ${colors.border}
          ${colors.glow} rounded-xl p-6 mx-4
        `}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${colors.text}`}>
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg ${colors.text} ${colors.hoverBg}
                transition-colors duration-200
              `}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {ambianceOptions.map((option) => (
              <button
                key={option || 'off'}
                onClick={() => handleSelect(option)}
                className={`
                  p-4 rounded-lg border ${colors.border}
                  ${currentAmbiance === option ? colors.activeBg : 'bg-black/20'}
                  ${colors.text} ${colors.hoverBg}
                  transition-all duration-200
                  text-left font-medium
                `}
              >
                {getAmbianceName(option)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
