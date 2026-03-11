import { Clock, Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useKidsMode } from "../hooks/useKidsMode";
import { useLanguage } from "../hooks/useLanguage";
import { useMainPlayer } from "../hooks/useMainPlayer";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";
import { type VisualTheme, useVisualTheme } from "../hooks/useTheme";
import { useUnifiedPlaylistManager } from "../hooks/useUnifiedPlaylistManager";
import { useUnifiedSessionManager } from "../hooks/useUnifiedSessionManager";
import { kidsSleepSounds } from "../lib/kidsSleepSounds";
import { peacefulSounds } from "../lib/peacefulSounds";
import FrequencyCard from "./FrequencyCard";
import KidsSleepSoundCard from "./KidsSleepSoundCard";
import MoodSpace from "./MoodSpace";
import PeacefulSoundCard from "./PeacefulSoundCard";
import SessionPanel from "./UnifiedSessionPanel";

interface Frequency {
  hz: number;
}

const frequencies: Frequency[] = [
  { hz: 111 },
  { hz: 174 },
  { hz: 285 },
  { hz: 396 },
  { hz: 417 },
  { hz: 432 },
  { hz: 528 },
  { hz: 639 },
  { hz: 741 },
  { hz: 852 },
  { hz: 963 },
];

type Category =
  | "frequencies"
  | "kidsSleepSounds"
  | "peacefulSounds"
  | "moodSpace"
  | "favorites"
  | "recentlyPlayed";

interface ThemeStyles {
  gradient: string;
  glow: string;
  hoverGlow: string;
  border: string;
}

// Time of day suggestion type
interface TimeOfDaySuggestion {
  emoji: string;
  label: string;
  items: Array<
    { type: "frequency"; id: number } | { type: "sound"; id: string }
  >;
}

function getTimeOfDaySuggestion(): TimeOfDaySuggestion {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      emoji: "🌅",
      label: "Sabah Enerjisi",
      items: [
        { type: "frequency", id: 528 },
        { type: "sound", id: "peaceful-bird-chirp" },
      ],
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      emoji: "☀️",
      label: "Öğle Odağı",
      items: [
        { type: "frequency", id: 963 },
        { type: "sound", id: "peaceful-slow-breath" },
      ],
    };
  }
  if (hour >= 18 && hour < 23) {
    return {
      emoji: "🌙",
      label: "Akşam Sakinliği",
      items: [
        { type: "frequency", id: 432 },
        { type: "sound", id: "peaceful-ambient-piano" },
      ],
    };
  }
  return {
    emoji: "⭐",
    label: "Gece Uykusu",
    items: [
      { type: "frequency", id: 174 },
      { type: "sound", id: "peaceful-light-rain" },
    ],
  };
}

function getTodayKey() {
  const d = new Date();
  return `fv_tod_dismissed_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getRelativeTime(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return "Az önce";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} dakika önce`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} saat önce`;
  return `${Math.floor(diffSeconds / 86400)} gün önce`;
}

export default function UnifiedFrequencyList() {
  const [activeCategory, setActiveCategory] = useState<Category>("frequencies");
  const [searchQuery, setSearchQuery] = useState("");
  const player = useMainPlayer();
  const { t } = useLanguage();
  const { theme } = useVisualTheme();
  const { kidsMode } = useKidsMode();
  const { favorites } = useFavorites();
  const { recentItems, addRecentItem, clearRecentItems } = useRecentlyPlayed();

  const sessionManager = useUnifiedSessionManager();
  const playlistManager = useUnifiedPlaylistManager();

  // Time of day banner dismissal
  const todKey = getTodayKey();
  const [todDismissed, setTodDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(todKey) === "true";
    } catch {
      return false;
    }
  });

  const dismissTod = useCallback(() => {
    setTodDismissed(true);
    try {
      localStorage.setItem(todKey, "true");
    } catch {
      // ignore
    }
  }, [todKey]);

  const todSuggestion = getTimeOfDaySuggestion();

  const handleToggle = (hz: number) => {
    if (sessionManager.activeSession) {
      sessionManager.stopSession();
    }
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (
      player.currentFrequency === hz &&
      player.playMode === "single" &&
      !player.currentSoundId
    ) {
      player.stop();
    } else {
      player.playFrequency(hz, "single");
      addRecentItem(`freq-${hz}`);
    }
  };

  const handleSoundToggle = (soundId: string) => {
    if (sessionManager.activeSession) {
      sessionManager.stopSession();
    }
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (player.currentSoundId === soundId && player.playMode === "single") {
      player.stop();
    } else {
      player.playSound(soundId, "single");
      addRecentItem(soundId);
    }
  };

  const isFrequencyPlaying = (hz: number) => {
    return (
      player.currentFrequency === hz &&
      player.isPlaying &&
      !player.currentSoundId
    );
  };

  const isSoundPlaying = (soundId: string) => {
    return player.currentSoundId === soundId && player.isPlaying;
  };

  const whiteNoiseSounds = kidsSleepSounds.filter(
    (s) => s.category === "whiteNoise",
  );
  const natureSounds = kidsSleepSounds.filter(
    (s) => s.category === "natureSounds",
  );
  const lullabies = kidsSleepSounds.filter((s) => s.category === "lullabies");
  const fairyTaleSounds = kidsSleepSounds.filter(
    (s) => s.category === "fairyTale",
  );

  // Theme-specific gradient and glow colors with defensive fallback
  const getThemeStyles = (isActive: boolean): ThemeStyles => {
    const themeConfig: Record<VisualTheme, ThemeStyles> = {
      "aurora-glow": {
        gradient: isActive
          ? "from-purple-600/80 via-blue-600/70 to-teal-600/80"
          : "from-purple-500/30 via-blue-500/25 to-teal-500/30",
        glow: isActive
          ? "shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(59,130,246,0.4)]"
          : "shadow-[0_0_15px_rgba(168,85,247,0.3),0_0_30px_rgba(59,130,246,0.2)]",
        hoverGlow:
          "hover:shadow-[0_0_40px_rgba(168,85,247,0.7),0_0_80px_rgba(59,130,246,0.5)]",
        border: isActive ? "border-purple-400/60" : "border-purple-400/30",
      },
      "celestial-calm": {
        gradient: isActive
          ? "from-indigo-600/80 via-blue-700/70 to-purple-600/80"
          : "from-indigo-500/30 via-blue-600/25 to-purple-500/30",
        glow: isActive
          ? "shadow-[0_0_30px_rgba(99,102,241,0.6),0_0_60px_rgba(147,51,234,0.4)]"
          : "shadow-[0_0_15px_rgba(99,102,241,0.3),0_0_30px_rgba(147,51,234,0.2)]",
        hoverGlow:
          "hover:shadow-[0_0_40px_rgba(99,102,241,0.7),0_0_80px_rgba(147,51,234,0.5)]",
        border: isActive ? "border-indigo-400/60" : "border-indigo-400/30",
      },
      "sacred-lotus": {
        gradient: isActive
          ? "from-pink-600/80 via-rose-600/70 to-purple-600/80"
          : "from-pink-500/30 via-rose-500/25 to-purple-500/30",
        glow: isActive
          ? "shadow-[0_0_30px_rgba(236,72,153,0.6),0_0_60px_rgba(244,114,182,0.4)]"
          : "shadow-[0_0_15px_rgba(236,72,153,0.3),0_0_30px_rgba(244,114,182,0.2)]",
        hoverGlow:
          "hover:shadow-[0_0_40px_rgba(236,72,153,0.7),0_0_80px_rgba(244,114,182,0.5)]",
        border: isActive ? "border-pink-400/60" : "border-pink-400/30",
      },
      "ethereal-waves": {
        gradient: isActive
          ? "from-cyan-600/80 via-teal-600/70 to-emerald-600/80"
          : "from-cyan-500/30 via-teal-500/25 to-emerald-500/30",
        glow: isActive
          ? "shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(20,184,166,0.4)]"
          : "shadow-[0_0_15px_rgba(6,182,212,0.3),0_0_30px_rgba(20,184,166,0.2)]",
        hoverGlow:
          "hover:shadow-[0_0_40px_rgba(6,182,212,0.7),0_0_80px_rgba(20,184,166,0.5)]",
        border: isActive ? "border-cyan-400/60" : "border-cyan-400/30",
      },
      "zen-garden": {
        gradient: isActive
          ? "from-green-600/80 via-emerald-600/70 to-teal-600/80"
          : "from-green-500/30 via-emerald-500/25 to-teal-500/30",
        glow: isActive
          ? "shadow-[0_0_30px_rgba(34,197,94,0.6),0_0_60px_rgba(16,185,129,0.4)]"
          : "shadow-[0_0_15px_rgba(34,197,94,0.3),0_0_30px_rgba(16,185,129,0.2)]",
        hoverGlow:
          "hover:shadow-[0_0_40px_rgba(34,197,94,0.7),0_0_80px_rgba(16,185,129,0.5)]",
        border: isActive ? "border-green-400/60" : "border-green-400/30",
      },
    };

    // Defensive fallback: if theme is not in config, use aurora-glow
    return themeConfig[theme] || themeConfig["aurora-glow"];
  };

  const CategoryButton = ({
    category,
    label,
  }: { category: Category; label: string }) => {
    const isActive = activeCategory === category;
    const styles = getThemeStyles(isActive);

    return (
      <button
        type="button"
        onClick={() => setActiveCategory(category)}
        data-ocid={`nav.${category}.tab`}
        className={`
          relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
          bg-gradient-to-br ${styles.gradient}
          backdrop-blur-md border-2 ${styles.border}
          ${styles.glow} ${styles.hoverGlow}
          transition-all duration-500 ease-out
          active:scale-95 sm:hover:scale-105
          ${isActive ? "text-white" : "text-white/90 hover:text-white"}
          overflow-hidden
          group
          min-h-[44px]
        `}
      >
        {/* Animated background overlay on hover */}
        <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Text content */}
        <span className="relative z-10 drop-shadow-lg">{label}</span>

        {/* Subtle pulse animation for active state */}
        {isActive && (
          <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
        )}
      </button>
    );
  };

  // Resolve favorites list to renderable cards
  const renderFavoriteItems = () => {
    if (favorites.length === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-white/50"
          data-ocid="favorites.empty_state"
        >
          <div className="text-5xl mb-4">🤍</div>
          <p className="text-lg font-medium">Henüz favori yok</p>
          <p className="text-sm mt-1 text-white/30">
            Seslerin yanındaki kalp ikonuna tıklayarak favorilere ekleyebilirsin
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {favorites.map((favId, index) => {
          // freq-528 → FrequencyCard
          if (favId.startsWith("freq-")) {
            const hz = Number.parseInt(favId.replace("freq-", ""), 10);
            const freq = frequencies.find((f) => f.hz === hz);
            if (!freq) return null;
            return (
              <FrequencyCard
                key={favId}
                frequency={{
                  hz: freq.hz,
                  title: `${freq.hz} Hz`,
                  description: t.frequencies[freq.hz] || "",
                }}
                isPlaying={isFrequencyPlaying(freq.hz)}
                onToggle={() => handleToggle(freq.hz)}
                isInPlaylist={playlistManager.isFrequencyInPlaylist(freq.hz)}
                onAddToPlaylist={() =>
                  playlistManager.addFrequencyToPlaylist(freq.hz)
                }
                isDisabled={
                  sessionManager.activeSession !== null ||
                  playlistManager.isPlaylistActive
                }
              />
            );
          }

          // Check peaceful sounds
          const peacefulSound = peacefulSounds.find((s) => s.id === favId);
          if (peacefulSound) {
            return (
              <div key={favId} data-ocid={`favorites.item.${index + 1}`}>
                <PeacefulSoundCard
                  sound={peacefulSound}
                  isPlaying={isSoundPlaying(peacefulSound.id)}
                  onToggle={() => handleSoundToggle(peacefulSound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(
                    peacefulSound.id,
                  )}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(peacefulSound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              </div>
            );
          }

          // Check kids sleep sounds
          const kidsSound = kidsSleepSounds.find((s) => s.id === favId);
          if (kidsSound) {
            return (
              <div key={favId} data-ocid={`favorites.item.${index + 1}`}>
                <KidsSleepSoundCard
                  sound={kidsSound}
                  isPlaying={isSoundPlaying(kidsSound.id)}
                  onToggle={() => handleSoundToggle(kidsSound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(kidsSound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(kidsSound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // Resolve recently played list to renderable cards
  const renderRecentItems = () => {
    if (recentItems.length === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-white/50"
          data-ocid="recent.empty_state"
        >
          <Clock className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Henüz dinlenen ses yok</p>
          <p className="text-sm mt-1 text-white/30">
            Bir ses veya frekans çaldığında burada görünecek
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {recentItems.map((item, index) => {
          const relTime = getRelativeTime(item.timestamp);

          if (item.id.startsWith("freq-")) {
            const hz = Number.parseInt(item.id.replace("freq-", ""), 10);
            const freq = frequencies.find((f) => f.hz === hz);
            if (!freq) return null;
            return (
              <div
                key={`${item.id}-${item.timestamp}`}
                data-ocid={`recent.item.${index + 1}`}
                className="relative"
              >
                <span className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {relTime}
                </span>
                <FrequencyCard
                  frequency={{
                    hz: freq.hz,
                    title: `${freq.hz} Hz`,
                    description: t.frequencies[freq.hz] || "",
                  }}
                  isPlaying={isFrequencyPlaying(freq.hz)}
                  onToggle={() => handleToggle(freq.hz)}
                  isInPlaylist={playlistManager.isFrequencyInPlaylist(freq.hz)}
                  onAddToPlaylist={() =>
                    playlistManager.addFrequencyToPlaylist(freq.hz)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              </div>
            );
          }

          const peacefulSound = peacefulSounds.find((s) => s.id === item.id);
          if (peacefulSound) {
            return (
              <div
                key={`${item.id}-${item.timestamp}`}
                data-ocid={`recent.item.${index + 1}`}
                className="relative"
              >
                <span className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {relTime}
                </span>
                <PeacefulSoundCard
                  sound={peacefulSound}
                  isPlaying={isSoundPlaying(peacefulSound.id)}
                  onToggle={() => handleSoundToggle(peacefulSound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(
                    peacefulSound.id,
                  )}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(peacefulSound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              </div>
            );
          }

          const kidsSound = kidsSleepSounds.find((s) => s.id === item.id);
          if (kidsSound) {
            return (
              <div
                key={`${item.id}-${item.timestamp}`}
                data-ocid={`recent.item.${index + 1}`}
                className="relative"
              >
                <span className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {relTime}
                </span>
                <KidsSleepSoundCard
                  sound={kidsSound}
                  isPlaying={isSoundPlaying(kidsSound.id)}
                  onToggle={() => handleSoundToggle(kidsSound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(kidsSound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(kidsSound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // Render search results across all sounds and frequencies
  const renderSearchResults = () => {
    const query = searchQuery.toLowerCase().trim();

    const matchingFrequencies = frequencies.filter((freq) =>
      `${freq.hz} hz`.includes(query),
    );
    const matchingPeaceful = peacefulSounds.filter((sound) => {
      const name = t.peacefulSounds[sound.title] || sound.title;
      return name.toLowerCase().includes(query);
    });
    const matchingKids = kidsSleepSounds.filter((sound) => {
      const catSection =
        sound.category === "whiteNoise"
          ? t.kidsSleepSounds.whiteNoise
          : sound.category === "natureSounds"
            ? t.kidsSleepSounds.natureSounds
            : sound.category === "lullabies"
              ? t.kidsSleepSounds.lullabies
              : t.kidsSleepSounds.fairyTale;
      const name =
        (catSection as Record<string, string>)[sound.title] || sound.title;
      return name.toLowerCase().includes(query);
    });

    const totalCount =
      matchingFrequencies.length +
      matchingPeaceful.length +
      matchingKids.length;

    if (totalCount === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-white/50"
          data-ocid="search.empty_state"
        >
          <Search className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Sonuç bulunamadı</p>
          <p className="text-sm mt-1 text-white/30">
            &quot;{searchQuery}&quot; için eşleşen ses bulunamadı
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <p className="text-white/50 text-sm text-center">
          {totalCount} sonuç bulundu
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {matchingFrequencies.map((freq) => (
            <FrequencyCard
              key={freq.hz}
              frequency={{
                hz: freq.hz,
                title: `${freq.hz} Hz`,
                description: t.frequencies[freq.hz] || "",
              }}
              isPlaying={isFrequencyPlaying(freq.hz)}
              onToggle={() => handleToggle(freq.hz)}
              isInPlaylist={playlistManager.isFrequencyInPlaylist(freq.hz)}
              onAddToPlaylist={() =>
                playlistManager.addFrequencyToPlaylist(freq.hz)
              }
              isDisabled={
                sessionManager.activeSession !== null ||
                playlistManager.isPlaylistActive
              }
            />
          ))}
          {matchingPeaceful.map((sound) => (
            <PeacefulSoundCard
              key={sound.id}
              sound={sound}
              isPlaying={isSoundPlaying(sound.id)}
              onToggle={() => handleSoundToggle(sound.id)}
              isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
              onAddToPlaylist={() =>
                playlistManager.addSoundToPlaylist(sound.id)
              }
              isDisabled={
                sessionManager.activeSession !== null ||
                playlistManager.isPlaylistActive
              }
            />
          ))}
          {matchingKids.map((sound) => (
            <KidsSleepSoundCard
              key={sound.id}
              sound={sound}
              isPlaying={isSoundPlaying(sound.id)}
              onToggle={() => handleSoundToggle(sound.id)}
              isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
              onAddToPlaylist={() =>
                playlistManager.addSoundToPlaylist(sound.id)
              }
              isDisabled={
                sessionManager.activeSession !== null ||
                playlistManager.isPlaylistActive
              }
            />
          ))}
        </div>
      </div>
    );
  };

  // Mood shortcut handler
  const handleMoodShortcut = (
    items: Array<
      { type: "frequency"; id: number } | { type: "sound"; id: string }
    >,
    name: string,
  ) => {
    player.playQueue(items, "playlist", name);
  };

  const moodShortcuts = [
    {
      label: "🧠 Odaklanma",
      name: "Odaklanma",
      items: [
        { type: "frequency" as const, id: 528 },
        { type: "frequency" as const, id: 963 },
        { type: "sound" as const, id: "peaceful-slow-breath" },
      ],
    },
    {
      label: "😴 Uyku",
      name: "Uyku",
      items: [
        { type: "sound" as const, id: "white-noise" },
        { type: "frequency" as const, id: 174 },
        { type: "sound" as const, id: "peaceful-light-rain" },
      ],
    },
    {
      label: "🌊 Stres",
      name: "Stres",
      items: [
        { type: "frequency" as const, id: 432 },
        { type: "sound" as const, id: "peaceful-wave-sea" },
        { type: "sound" as const, id: "peaceful-light-heartbeat" },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 pb-32 px-3 sm:px-4">
      <SessionPanel sessionManager={sessionManager} />

      {/* Kids Mode Badge */}
      {kidsMode && (
        <div className="flex justify-center">
          <div className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-200 text-sm font-semibold flex items-center gap-2">
            <span>🧒</span>
            <span>Çocuk Modu Aktif</span>
          </div>
        </div>
      )}

      {/* Mood Shortcuts — hidden in kids mode */}
      {!kidsMode && (
        <div className="flex justify-center gap-2 flex-wrap">
          {moodShortcuts.map((mood) => (
            <button
              key={mood.name}
              type="button"
              onClick={() => handleMoodShortcut(mood.items, mood.name)}
              data-ocid={`mood.${mood.name.toLowerCase()}.button`}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 active:scale-95 min-h-[36px]"
            >
              {mood.label}
            </button>
          ))}
        </div>
      )}

      {/* Time of Day Banner — hidden in kids mode */}
      {!kidsMode && !todDismissed && (
        <div className="relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
          <button
            type="button"
            onClick={() =>
              handleMoodShortcut(todSuggestion.items, todSuggestion.label)
            }
            data-ocid="tod.primary_button"
            className="flex-1 flex items-center gap-3 text-left min-h-[44px]"
          >
            <span className="text-2xl">{todSuggestion.emoji}</span>
            <div>
              <p className="text-white font-semibold text-sm">
                {todSuggestion.label}
              </p>
              <p className="text-white/50 text-xs">
                Şu an için önerilen playlist
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={dismissTod}
            data-ocid="tod.close_button"
            className="flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Input — hidden in kids mode */}
      {!kidsMode && (
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ses veya frekans ara..."
            data-ocid="search.input"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              data-ocid="search.clear_button"
              className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white/70 transition-colors min-w-[36px] justify-center"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Category Navigation — in kids mode, only show kidsSleepSounds */}
      {kidsMode ? (
        <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <CategoryButton
            category="kidsSleepSounds"
            label={t.categories.kidsSleepSounds}
          />
        </div>
      ) : (
        <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <CategoryButton
            category="frequencies"
            label={t.categories.frequencies}
          />
          <CategoryButton
            category="kidsSleepSounds"
            label={t.categories.kidsSleepSounds}
          />
          <CategoryButton
            category="peacefulSounds"
            label={t.categories.peacefulSounds}
          />
          <CategoryButton category="moodSpace" label={t.categories.moodSpace} />
          <CategoryButton category="favorites" label="❤️ Favoriler" />
          <CategoryButton
            category="recentlyPlayed"
            label="🕐 Son Dinlenenler"
          />
        </div>
      )}

      {/* Search Results — shown when search query is non-empty (non-kids mode) */}
      {!kidsMode && searchQuery.trim() && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
            🔍 Arama Sonuçları
          </h2>
          {renderSearchResults()}
        </div>
      )}

      {/* Recently Played Category */}
      {activeCategory === "recentlyPlayed" &&
        !kidsMode &&
        !searchQuery.trim() && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                🕐 Son Dinlenenler
              </h2>
              {recentItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentItems}
                  data-ocid="recent.delete_button"
                  className="text-xs text-white/50 hover:text-white/80 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 min-h-[36px]"
                >
                  Geçmişi Temizle
                </button>
              )}
            </div>
            {renderRecentItems()}
          </div>
        )}

      {/* Favorites Category */}
      {activeCategory === "favorites" && !kidsMode && !searchQuery.trim() && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
            ❤️ Favoriler
          </h2>
          {renderFavoriteItems()}
        </div>
      )}

      {/* Mood Space Category */}
      {activeCategory === "moodSpace" && !kidsMode && !searchQuery.trim() && (
        <MoodSpace />
      )}

      {/* Frequencies Category */}
      {activeCategory === "frequencies" && !kidsMode && !searchQuery.trim() && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
            {t.categories.frequencies}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {frequencies.map((freq) => (
              <FrequencyCard
                key={freq.hz}
                frequency={{
                  hz: freq.hz,
                  title: `${freq.hz} Hz`,
                  description: t.frequencies[freq.hz] || "",
                }}
                isPlaying={isFrequencyPlaying(freq.hz)}
                onToggle={() => handleToggle(freq.hz)}
                isInPlaylist={playlistManager.isFrequencyInPlaylist(freq.hz)}
                onAddToPlaylist={() =>
                  playlistManager.addFrequencyToPlaylist(freq.hz)
                }
                isDisabled={
                  sessionManager.activeSession !== null ||
                  playlistManager.isPlaylistActive
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Kids Sleep Sounds Category */}
      {activeCategory === "kidsSleepSounds" && !searchQuery.trim() && (
        <div className="space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
            {t.kidsSleepSounds.categoryTitle}
          </h2>

          {/* White & Steady Noises */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-lg">
              {t.kidsSleepSounds.whiteNoise.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {whiteNoiseSounds.map((sound) => (
                <KidsSleepSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={isSoundPlaying(sound.id)}
                  onToggle={() => handleSoundToggle(sound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(sound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              ))}
            </div>
          </div>

          {/* Nature Sounds */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-lg">
              {t.kidsSleepSounds.natureSounds.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {natureSounds.map((sound) => (
                <KidsSleepSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={isSoundPlaying(sound.id)}
                  onToggle={() => handleSoundToggle(sound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(sound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              ))}
            </div>
          </div>

          {/* Lullabies & Musical */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-lg">
              {t.kidsSleepSounds.lullabies.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {lullabies.map((sound) => (
                <KidsSleepSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={isSoundPlaying(sound.id)}
                  onToggle={() => handleSoundToggle(sound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(sound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              ))}
            </div>
          </div>

          {/* Fairy-tale & Ambient */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-lg">
              {t.kidsSleepSounds.fairyTale.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {fairyTaleSounds.map((sound) => (
                <KidsSleepSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={isSoundPlaying(sound.id)}
                  onToggle={() => handleSoundToggle(sound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(sound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Peaceful Sounds Category */}
      {activeCategory === "peacefulSounds" &&
        !kidsMode &&
        !searchQuery.trim() && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
              {t.categories.peacefulSounds}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {peacefulSounds.map((sound) => (
                <PeacefulSoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={isSoundPlaying(sound.id)}
                  onToggle={() => handleSoundToggle(sound.id)}
                  isInPlaylist={playlistManager.isSoundInPlaylist(sound.id)}
                  onAddToPlaylist={() =>
                    playlistManager.addSoundToPlaylist(sound.id)
                  }
                  isDisabled={
                    sessionManager.activeSession !== null ||
                    playlistManager.isPlaylistActive
                  }
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
