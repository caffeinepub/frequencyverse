import { Globe, Settings } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useVisualTheme } from "../hooks/useTheme";
import LanguageSelectorPopup from "./LanguageSelectorPopup";
import SettingsPopup from "./SettingsPopup";

export default function Header() {
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const [openPopup, setOpenPopup] = useState<"language" | "settings" | null>(
    null,
  );

  const getThemeColors = () => {
    switch (theme) {
      case "aurora-glow":
        return {
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
          border: "border-purple-400/30",
          text: "text-purple-200",
          bg: "bg-purple-500/20",
          hoverBg: "hover:bg-purple-500/30",
        };
      case "celestial-calm":
        return {
          glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
          border: "border-blue-400/30",
          text: "text-blue-200",
          bg: "bg-blue-500/20",
          hoverBg: "hover:bg-blue-500/30",
        };
      case "sacred-lotus":
        return {
          glow: "shadow-[0_0_20px_rgba(236,72,153,0.4)]",
          border: "border-pink-400/30",
          text: "text-pink-200",
          bg: "bg-pink-500/20",
          hoverBg: "hover:bg-pink-500/30",
        };
      case "ethereal-waves":
        return {
          glow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
          border: "border-cyan-400/30",
          text: "text-cyan-200",
          bg: "bg-cyan-500/20",
          hoverBg: "hover:bg-cyan-500/30",
        };
      case "zen-garden":
        return {
          glow: "shadow-[0_0_20px_rgba(34,197,94,0.4)]",
          border: "border-green-400/30",
          text: "text-green-200",
          bg: "bg-green-500/20",
          hoverBg: "hover:bg-green-500/30",
        };
      default:
        return {
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
          border: "border-purple-400/30",
          text: "text-purple-200",
          bg: "bg-purple-500/20",
          hoverBg: "hover:bg-purple-500/30",
        };
    }
  };

  const colors = getThemeColors();

  const getButtonLabel = (type: "language" | "settings"): string => {
    const labels: Record<string, Record<string, string>> = {
      language: {
        tr: "Dil",
        en: "Language",
        es: "Idioma",
        fr: "Langue",
        de: "Sprache",
        it: "Lingua",
        ru: "Язык",
        ar: "اللغة",
        ja: "言語",
        zh: "语言",
        pt: "Idioma",
      },
      settings: {
        tr: "Ayarlar",
        en: "Settings",
        es: "Configuración",
        fr: "Paramètres",
        de: "Einstellungen",
        it: "Impostazioni",
        ru: "Настройки",
        ar: "الإعدادات",
        ja: "設定",
        zh: "设置",
        pt: "Configurações",
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

    return labels[type][lang] || labels[type].tr;
  };

  return (
    <header className="relative z-20 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink">
            <img
              src="/assets/generated/frequencyverse-logo-updated.dim_200x200.png"
              alt="FrequencyVerse Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg truncate">
                FrequencyVerse
              </h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow truncate">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Mobile-optimized button layout - always on same row */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() =>
                setOpenPopup(openPopup === "language" ? null : "language")
              }
              className={`
                relative flex items-center justify-center gap-2 
                min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg
                backdrop-blur-sm ${colors.bg} border ${colors.border}
                ${colors.glow} ${colors.text}
                transition-all duration-300 ease-in-out
                ${colors.hoverBg} active:scale-95
                focus:outline-none focus:ring-2 focus:ring-white/30
                text-sm font-medium
              `}
              aria-label={getButtonLabel("language")}
            >
              <Globe className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {getButtonLabel("language")}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setOpenPopup(openPopup === "settings" ? null : "settings")
              }
              className={`
                relative flex items-center justify-center gap-2 
                min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg
                backdrop-blur-sm ${colors.bg} border ${colors.border}
                ${colors.glow} ${colors.text}
                transition-all duration-300 ease-in-out
                ${colors.hoverBg} active:scale-95
                focus:outline-none focus:ring-2 focus:ring-white/30
                text-sm font-medium
              `}
              aria-label={getButtonLabel("settings")}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {getButtonLabel("settings")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {openPopup === "language" && (
        <LanguageSelectorPopup onClose={() => setOpenPopup(null)} />
      )}
      {openPopup === "settings" && (
        <SettingsPopup onClose={() => setOpenPopup(null)} />
      )}
    </header>
  );
}
