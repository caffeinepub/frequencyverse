import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type AmbianceType,
  useBackgroundAmbiance,
} from "../hooks/useBackgroundAmbiance";
import { useLanguage } from "../hooks/useLanguage";
import { useVisualTheme } from "../hooks/useTheme";

interface BackgroundAmbianceSelectorPopupProps {
  onClose: () => void;
}

export default function BackgroundAmbianceSelectorPopup({
  onClose,
}: BackgroundAmbianceSelectorPopupProps) {
  const { currentAmbiance, setAmbiance } = useBackgroundAmbiance();
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    maxHeight: number;
  }>({
    left: 0,
    maxHeight: 600,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Calculate optimal position to ensure popup opens downward and stays within viewport
    const calculatePosition = () => {
      if (!popupRef.current) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 16; // 1rem margin from viewport edges

      // Find the background sounds button in the header - search for all possible labels across languages
      const ambianceButton = document.querySelector(
        'button[aria-label*="Background Sounds"], button[aria-label*="Arka Plan Sesleri"], button[aria-label*="Sonidos de Fondo"], button[aria-label*="Sons de Fond"], button[aria-label*="Hintergrundgeräusche"], button[aria-label*="Suoni di Sottofondo"], button[aria-label*="Фоновые Звуки"], button[aria-label*="أصوات الخلفية"], button[aria-label*="背景音"], button[aria-label*="背景声音"], button[aria-label*="Sons de Fundo"]',
      );

      if (ambianceButton) {
        const buttonRect = ambianceButton.getBoundingClientRect();
        const popupWidth = 448; // max-w-md = 28rem = 448px
        const actualPopupWidth = Math.min(
          popupWidth,
          viewportWidth - margin * 2,
        );

        // Calculate left position (center popup under button)
        let left =
          buttonRect.left + buttonRect.width / 2 - actualPopupWidth / 2;

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
        const actualPopupWidth = Math.min(
          popupWidth,
          viewportWidth - margin * 2,
        );
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
    window.addEventListener("resize", calculatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePosition);
    };
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case "aurora-glow":
        return {
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]",
          border: "border-purple-400/40",
          text: "text-purple-200",
          hoverBg: "hover:bg-purple-500/30",
          activeBg: "bg-purple-500/40",
        };
      case "celestial-calm":
        return {
          glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
          border: "border-blue-400/40",
          text: "text-blue-200",
          hoverBg: "hover:bg-blue-500/30",
          activeBg: "bg-blue-500/40",
        };
      case "sacred-lotus":
        return {
          glow: "shadow-[0_0_30px_rgba(236,72,153,0.5)]",
          border: "border-pink-400/40",
          text: "text-pink-200",
          hoverBg: "hover:bg-pink-500/30",
          activeBg: "bg-pink-500/40",
        };
      case "ethereal-waves":
        return {
          glow: "shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          border: "border-cyan-400/40",
          text: "text-cyan-200",
          hoverBg: "hover:bg-cyan-500/30",
          activeBg: "bg-cyan-500/40",
        };
      case "zen-garden":
        return {
          glow: "shadow-[0_0_30px_rgba(34,197,94,0.5)]",
          border: "border-green-400/40",
          text: "text-green-200",
          hoverBg: "hover:bg-green-500/30",
          activeBg: "bg-green-500/40",
        };
      default:
        return {
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]",
          border: "border-purple-400/40",
          text: "text-purple-200",
          hoverBg: "hover:bg-purple-500/30",
          activeBg: "bg-purple-500/40",
        };
    }
  };

  const colors = getThemeColors();

  const getTitle = (): string => {
    const titles: Record<string, string> = {
      tr: "Arka Plan Sesleri",
      en: "Background Sounds",
      es: "Sonidos de Fondo",
      fr: "Sons de Fond",
      de: "Hintergrundgeräusche",
      it: "Suoni di Sottofondo",
      ru: "Фоновые Звуки",
      ar: "أصوات الخلفية",
      ja: "背景音",
      zh: "背景声音",
      pt: "Sons de Fundo",
    };

    const lang = t.subtitle.includes("frekans")
      ? "tr"
      : t.subtitle.includes("Discover")
        ? "en"
        : t.subtitle.includes("Descubre")
          ? "es"
          : t.subtitle.includes("Découvrez")
            ? "fr"
            : t.subtitle.includes("Entdecken")
              ? "de"
              : t.subtitle.includes("Scopri")
                ? "it"
                : t.subtitle.includes("Откройте")
                  ? "ru"
                  : t.subtitle.includes("اكتشف")
                    ? "ar"
                    : t.subtitle.includes("発見")
                      ? "ja"
                      : t.subtitle.includes("发现")
                        ? "zh"
                        : t.subtitle.includes("Descubra")
                          ? "pt"
                          : "tr";

    return titles[lang] || "Arka Plan Sesleri";
  };

  const getAmbianceName = (type: AmbianceType | null): string => {
    if (!type) {
      const offLabels: Record<string, string> = {
        tr: "Kapalı",
        en: "Off",
        es: "Apagado",
        fr: "Désactivé",
        de: "Aus",
        it: "Spento",
        ru: "Выкл",
        ar: "إيقاف",
        ja: "オフ",
        zh: "关闭",
        pt: "Desligado",
      };

      const lang = t.subtitle.includes("frekans")
        ? "tr"
        : t.subtitle.includes("Discover")
          ? "en"
          : t.subtitle.includes("Descubre")
            ? "es"
            : t.subtitle.includes("Découvrez")
              ? "fr"
              : t.subtitle.includes("Entdecken")
                ? "de"
                : t.subtitle.includes("Scopri")
                  ? "it"
                  : t.subtitle.includes("Откройте")
                    ? "ru"
                    : t.subtitle.includes("اكتشف")
                      ? "ar"
                      : t.subtitle.includes("発見")
                        ? "ja"
                        : t.subtitle.includes("发现")
                          ? "zh"
                          : t.subtitle.includes("Descubra")
                            ? "pt"
                            : "tr";

      return offLabels[lang] || "Kapalı";
    }

    const names: Record<string, Record<string, string>> = {
      "soft-wind": {
        tr: "Yumuşak Rüzgar",
        en: "Soft Wind",
        es: "Viento Suave",
        fr: "Vent Doux",
        de: "Sanfter Wind",
        it: "Vento Morbido",
        ru: "Мягкий Ветер",
        ar: "رياح ناعمة",
        ja: "柔らかい風",
        zh: "柔和的风",
        pt: "Vento Suave",
      },
      "ocean-waves": {
        tr: "Okyanus Dalgaları",
        en: "Ocean Waves",
        es: "Olas del Océano",
        fr: "Vagues de l'Océan",
        de: "Meereswellen",
        it: "Onde dell'Oceano",
        ru: "Океанские Волны",
        ar: "أمواج المحيط",
        ja: "海の波",
        zh: "海浪",
        pt: "Ondas do Oceano",
      },
      "gentle-rain": {
        tr: "Hafif Yağmur",
        en: "Gentle Rain",
        es: "Lluvia Suave",
        fr: "Pluie Douce",
        de: "Sanfter Regen",
        it: "Pioggia Delicata",
        ru: "Нежный Дождь",
        ar: "مطر لطيف",
        ja: "優しい雨",
        zh: "温柔的雨",
        pt: "Chuva Suave",
      },
      "distant-fire": {
        tr: "Uzak Şömine",
        en: "Distant Fire Crackle",
        es: "Crepitar de Fuego Distante",
        fr: "Crépitement de Feu Lointain",
        de: "Fernes Feuerknistern",
        it: "Crepitio di Fuoco Distante",
        ru: "Далекий Треск Огня",
        ar: "طقطقة نار بعيدة",
        ja: "遠くの火のパチパチ音",
        zh: "远处的火焰噼啪声",
        pt: "Crepitar de Fogo Distante",
      },
      "ambient-pad": {
        tr: "Ambient Pad",
        en: "Ambient Pad",
        es: "Pad Ambiental",
        fr: "Pad Ambiant",
        de: "Ambient Pad",
        it: "Pad Ambientale",
        ru: "Эмбиент Пад",
        ar: "باد محيط",
        ja: "アンビエントパッド",
        zh: "环境音垫",
        pt: "Pad Ambiental",
      },
    };

    const lang = t.subtitle.includes("frekans")
      ? "tr"
      : t.subtitle.includes("Discover")
        ? "en"
        : t.subtitle.includes("Descubre")
          ? "es"
          : t.subtitle.includes("Découvrez")
            ? "fr"
            : t.subtitle.includes("Entdecken")
              ? "de"
              : t.subtitle.includes("Scopri")
                ? "it"
                : t.subtitle.includes("Откройте")
                  ? "ru"
                  : t.subtitle.includes("اكتشف")
                    ? "ar"
                    : t.subtitle.includes("発見")
                      ? "ja"
                      : t.subtitle.includes("发现")
                        ? "zh"
                        : t.subtitle.includes("Descubra")
                          ? "pt"
                          : "tr";

    return names[type]?.[lang] || type;
  };

  const handleSelect = (type: AmbianceType | null) => {
    console.log("🎵 [AMBIANCE POPUP] User selected:", type);
    setAmbiance(type);
    onClose();
  };

  const ambianceOptions: (AmbianceType | null)[] = [
    null,
    "soft-wind",
    "ocean-waves",
    "gentle-rain",
    "distant-fire",
    "ambient-pad",
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      />
      <div
        ref={popupRef}
        className="fixed z-50 w-full max-w-md animate-in slide-in-from-top-2 duration-200"
        style={{
          top: position.top !== undefined ? `${position.top}px` : undefined,
          bottom:
            position.bottom !== undefined ? `${position.bottom}px` : undefined,
          left: `${position.left}px`,
          maxHeight: `${position.maxHeight}px`,
        }}
      >
        <div
          className={`
          backdrop-blur-md bg-black/80 border ${colors.border}
          ${colors.glow} rounded-xl p-4 sm:p-6 mx-4
          flex flex-col h-full
        `}
        >
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
              {getTitle()}
            </h2>
            <button
              type="button"
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
            {ambianceOptions.map((option) => (
              <button
                key={option || "off"}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  p-4 rounded-lg border ${colors.border}
                  ${currentAmbiance === option ? colors.activeBg : "bg-black/20"}
                  ${colors.text} ${colors.hoverBg}
                  transition-all duration-200
                  text-left font-medium min-h-[44px]
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
