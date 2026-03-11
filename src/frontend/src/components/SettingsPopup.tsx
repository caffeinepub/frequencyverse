import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAnimationSettings } from "../hooks/useAnimationSettings";
import { useKidsMode } from "../hooks/useKidsMode";
import { useLanguage } from "../hooks/useLanguage";
import { useMainPlayer } from "../hooks/useMainPlayer";
import { useVisualTheme } from "../hooks/useTheme";
import type { Language } from "../lib/translations";
import { VISUAL_THEME_OPTIONS } from "../lib/visualThemes";

interface SettingsPopupProps {
  onClose: () => void;
}

// Settings-specific labels for all supported languages
const SETTINGS_LABELS: Record<
  Language,
  {
    title: string;
    theme: string;
    animationIntensity: string;
    low: string;
    medium: string;
    high: string;
    auto: string;
    defaultDuration: string;
    kidsMode: string;
    kidsModeActive: string;
    enableKidsMode: string;
    kidsModeDesc: string;
    privacyPolicy: string;
    aboutDesc: string;
  }
> = {
  tr: {
    title: "Ayarlar",
    theme: "Tema",
    animationIntensity: "Animasyon Yoğunluğu",
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    auto: "(Otomatik)",
    defaultDuration: "Varsayılan Süre",
    kidsMode: "Çocuk Modu",
    kidsModeActive: "🧒 Çocuk Modu Aktif",
    enableKidsMode: "Çocuk Modunu Etkinleştir",
    kidsModeDesc: "Sadece çocuk sesleri gösteriliyor",
    privacyPolicy: "Gizlilik Politikası",
    aboutDesc: "Rahatlama ve huzur için frekanslar ve ambiyans sesleri.",
  },
  en: {
    title: "Settings",
    theme: "Theme",
    animationIntensity: "Animation Intensity",
    low: "Low",
    medium: "Medium",
    high: "High",
    auto: "(Auto)",
    defaultDuration: "Default Duration",
    kidsMode: "Kids Mode",
    kidsModeActive: "🧒 Kids Mode Active",
    enableKidsMode: "Enable Kids Mode",
    kidsModeDesc: "Showing only kids sounds",
    privacyPolicy: "Privacy Policy",
    aboutDesc: "Frequencies and ambient sounds for relaxation and peace.",
  },
  es: {
    title: "Configuración",
    theme: "Tema",
    animationIntensity: "Intensidad de Animación",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    auto: "(Auto)",
    defaultDuration: "Duración Predeterminada",
    kidsMode: "Modo Niños",
    kidsModeActive: "🧒 Modo Niños Activo",
    enableKidsMode: "Activar Modo Niños",
    kidsModeDesc: "Mostrando solo sonidos para niños",
    privacyPolicy: "Política de Privacidad",
    aboutDesc: "Frecuencias y sonidos ambientales para relajación y paz.",
  },
  fr: {
    title: "Paramètres",
    theme: "Thème",
    animationIntensity: "Intensité Animation",
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    auto: "(Auto)",
    defaultDuration: "Durée par Défaut",
    kidsMode: "Mode Enfants",
    kidsModeActive: "🧒 Mode Enfants Actif",
    enableKidsMode: "Activer Mode Enfants",
    kidsModeDesc: "Affichage des sons enfants uniquement",
    privacyPolicy: "Politique de Confidentialité",
    aboutDesc: "Fréquences et sons ambiants pour la relaxation et la paix.",
  },
  de: {
    title: "Einstellungen",
    theme: "Thema",
    animationIntensity: "Animationsintensität",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    auto: "(Auto)",
    defaultDuration: "Standarddauer",
    kidsMode: "Kindermodus",
    kidsModeActive: "🧒 Kindermodus Aktiv",
    enableKidsMode: "Kindermodus Aktivieren",
    kidsModeDesc: "Nur Kinderklänge werden angezeigt",
    privacyPolicy: "Datenschutzerklärung",
    aboutDesc: "Frequenzen und Umgebungsgeräusche für Entspannung und Frieden.",
  },
  it: {
    title: "Impostazioni",
    theme: "Tema",
    animationIntensity: "Intensità Animazione",
    low: "Basso",
    medium: "Medio",
    high: "Alto",
    auto: "(Auto)",
    defaultDuration: "Durata Predefinita",
    kidsMode: "Modalità Bambini",
    kidsModeActive: "🧒 Modalità Bambini Attiva",
    enableKidsMode: "Abilita Modalità Bambini",
    kidsModeDesc: "Mostrando solo suoni per bambini",
    privacyPolicy: "Informativa sulla Privacy",
    aboutDesc: "Frequenze e suoni ambientali per relax e pace.",
  },
  ru: {
    title: "Настройки",
    theme: "Тема",
    animationIntensity: "Интенсивность Анимации",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    auto: "(Авто)",
    defaultDuration: "Длительность по Умолчанию",
    kidsMode: "Детский Режим",
    kidsModeActive: "🧒 Детский Режим Активен",
    enableKidsMode: "Включить Детский Режим",
    kidsModeDesc: "Показываются только детские звуки",
    privacyPolicy: "Политика Конфиденциальности",
    aboutDesc: "Частоты и атмосферные звуки для расслабления и покоя.",
  },
  ar: {
    title: "الإعدادات",
    theme: "السمة",
    animationIntensity: "شدة الرسوم المتحركة",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    auto: "(تلقائي)",
    defaultDuration: "المدة الافتراضية",
    kidsMode: "وضع الأطفال",
    kidsModeActive: "🧒 وضع الأطفال نشط",
    enableKidsMode: "تفعيل وضع الأطفال",
    kidsModeDesc: "عرض أصوات الأطفال فقط",
    privacyPolicy: "سياسة الخصوصية",
    aboutDesc: "ترددات وأصوات محيطة للاسترخاء والسلام.",
  },
  ja: {
    title: "設定",
    theme: "テーマ",
    animationIntensity: "アニメーション強度",
    low: "低",
    medium: "中",
    high: "高",
    auto: "(自動)",
    defaultDuration: "デフォルト時間",
    kidsMode: "キッズモード",
    kidsModeActive: "🧒 キッズモード有効",
    enableKidsMode: "キッズモードを有効にする",
    kidsModeDesc: "子供向けサウンドのみ表示中",
    privacyPolicy: "プライバシーポリシー",
    aboutDesc: "リラクゼーションと平和のための周波数と環境音。",
  },
  zh: {
    title: "设置",
    theme: "主题",
    animationIntensity: "动画强度",
    low: "低",
    medium: "中",
    high: "高",
    auto: "(自动)",
    defaultDuration: "默认时长",
    kidsMode: "儿童模式",
    kidsModeActive: "🧒 儿童模式已激活",
    enableKidsMode: "启用儿童模式",
    kidsModeDesc: "仅显示儿童声音",
    privacyPolicy: "隐私政策",
    aboutDesc: "用于放松和宁静的频率和环境声音。",
  },
  pt: {
    title: "Configurações",
    theme: "Tema",
    animationIntensity: "Intensidade da Animação",
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    auto: "(Auto)",
    defaultDuration: "Duração Padrão",
    kidsMode: "Modo Infantil",
    kidsModeActive: "🧒 Modo Infantil Ativo",
    enableKidsMode: "Ativar Modo Infantil",
    kidsModeDesc: "Mostrando apenas sons infantis",
    privacyPolicy: "Política de Privacidade",
    aboutDesc: "Frequências e sons ambientes para relaxamento e paz.",
  },
};

export default function SettingsPopup({ onClose }: SettingsPopupProps) {
  const { theme, setTheme } = useVisualTheme();
  const { language } = useLanguage();
  const { animationIntensity, setAnimationIntensity, isAutoDetected } =
    useAnimationSettings();
  const { kidsMode, setKidsMode } = useKidsMode();
  const { selectedDuration, setSelectedDuration } = useMainPlayer();
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

  const sl = SETTINGS_LABELS[language] || SETTINGS_LABELS.tr;

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
    const calculatePosition = () => {
      if (!popupRef.current) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 16;

      const settingsButton = document.querySelector(
        '[data-ocid="header.settings.button"]',
      ) as HTMLElement | null;

      if (settingsButton) {
        const buttonRect = settingsButton.getBoundingClientRect();
        const popupWidth = 448;
        const actualPopupWidth = Math.min(
          popupWidth,
          viewportWidth - margin * 2,
        );

        let left =
          buttonRect.left + buttonRect.width / 2 - actualPopupWidth / 2;

        if (left < margin) left = margin;
        if (left + actualPopupWidth > viewportWidth - margin) {
          left = viewportWidth - actualPopupWidth - margin;
        }

        const spaceBelow = viewportHeight - buttonRect.bottom - margin;
        const maxHeight = Math.max(300, spaceBelow - margin);

        setPosition({
          top: buttonRect.bottom + 8,
          left,
          maxHeight,
        });
      } else {
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

    const timer = setTimeout(calculatePosition, 0);
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
          linkHover: "hover:bg-purple-500/20",
          activeBg: "bg-purple-500/40",
        };
      case "celestial-calm":
        return {
          glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
          border: "border-blue-400/40",
          text: "text-blue-200",
          hoverBg: "hover:bg-blue-500/30",
          linkHover: "hover:bg-blue-500/20",
          activeBg: "bg-blue-500/40",
        };
      case "sacred-lotus":
        return {
          glow: "shadow-[0_0_30px_rgba(236,72,153,0.5)]",
          border: "border-pink-400/40",
          text: "text-pink-200",
          hoverBg: "hover:bg-pink-500/30",
          linkHover: "hover:bg-pink-500/20",
          activeBg: "bg-pink-500/40",
        };
      case "ethereal-waves":
        return {
          glow: "shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          border: "border-cyan-400/40",
          text: "text-cyan-200",
          hoverBg: "hover:bg-cyan-500/30",
          linkHover: "hover:bg-cyan-500/20",
          activeBg: "bg-cyan-500/40",
        };
      case "zen-garden":
        return {
          glow: "shadow-[0_0_30px_rgba(34,197,94,0.5)]",
          border: "border-green-400/40",
          text: "text-green-200",
          hoverBg: "hover:bg-green-500/30",
          linkHover: "hover:bg-green-500/20",
          activeBg: "bg-green-500/40",
        };
      default:
        return {
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]",
          border: "border-purple-400/40",
          text: "text-purple-200",
          hoverBg: "hover:bg-purple-500/30",
          linkHover: "hover:bg-purple-500/20",
          activeBg: "bg-purple-500/40",
        };
    }
  };

  const colors = getThemeColors();

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
              {sl.title}
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

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Theme Selection Section */}
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${colors.text} px-1`}>
                {sl.theme}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {VISUAL_THEME_OPTIONS.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    type="button"
                    onClick={() => setTheme(themeOption.value)}
                    className={`
                      p-3 rounded-lg border ${colors.border}
                      ${theme === themeOption.value ? colors.activeBg : "bg-black/20"}
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

            {/* Animation Intensity Section */}
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${colors.text} px-1`}>
                {sl.animationIntensity}
              </h3>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((level) => {
                  const levelLabels = {
                    low: sl.low,
                    medium: sl.medium,
                    high: sl.high,
                  };
                  const isActive = animationIntensity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setAnimationIntensity(level)}
                      data-ocid={`settings.anim_${level}.button`}
                      className={`
                        flex-1 py-2 px-3 rounded-lg border ${colors.border} text-sm font-medium
                        ${isActive ? colors.activeBg : "bg-black/20"}
                        ${colors.text} ${colors.hoverBg}
                        transition-all duration-200 min-h-[40px]
                        flex flex-col items-center gap-0.5
                      `}
                    >
                      <span>{levelLabels[level]}</span>
                      {isActive && isAutoDetected && (
                        <span className="text-white/40 text-[10px] font-normal leading-tight">
                          {sl.auto}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Duration Section */}
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${colors.text} px-1`}>
                {sl.defaultDuration}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setSelectedDuration(mins);
                      try {
                        localStorage.setItem(
                          "fv_default_duration",
                          String(mins),
                        );
                      } catch {
                        /* ignore */
                      }
                    }}
                    data-ocid={`settings.duration_${mins}.button`}
                    className={`
                      py-2 px-4 rounded-lg border ${colors.border} text-sm font-medium
                      ${selectedDuration === mins ? colors.activeBg : "bg-black/20"}
                      ${colors.text} ${colors.hoverBg}
                      transition-all duration-200 min-h-[40px]
                    `}
                  >
                    {mins} dk
                  </button>
                ))}
              </div>
            </div>

            {/* Kids Mode Section */}
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${colors.text} px-1`}>
                {sl.kidsMode}
              </h3>
              <div
                className={`
                flex items-center justify-between gap-3 p-3 rounded-lg border ${colors.border} bg-black/20
              `}
              >
                <div>
                  <Label
                    htmlFor="kids-mode-switch"
                    className={`${colors.text} font-medium text-sm cursor-pointer`}
                  >
                    {kidsMode ? sl.kidsModeActive : sl.enableKidsMode}
                  </Label>
                  {kidsMode && (
                    <p className="text-xs text-white/40 mt-0.5">
                      {sl.kidsModeDesc}
                    </p>
                  )}
                </div>
                <Switch
                  id="kids-mode-switch"
                  checked={kidsMode}
                  onCheckedChange={setKidsMode}
                  data-ocid="settings.kidsmode.switch"
                />
              </div>
            </div>

            {/* Privacy Policy Link */}
            <a
              href="https://sites.google.com/view/frequencyverseapp/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center justify-between gap-3
                p-4 rounded-lg border ${colors.border}
                bg-black/20 ${colors.text} ${colors.linkHover}
                transition-all duration-200
                min-h-[44px] group
              `}
            >
              <span className="font-medium">{sl.privacyPolicy}</span>
              <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* About Section */}
            <div
              className={`
              p-4 rounded-lg border ${colors.border} bg-black/20 space-y-1
            `}
            >
              <p className={`text-sm font-semibold ${colors.text}`}>
                FrequencyVerse v1.0
              </p>
              <p className="text-xs text-white/40">{sl.aboutDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
