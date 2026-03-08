import { useState } from 'react';
import FrequencyCard from './FrequencyCard';
import KidsSleepSoundCard from './KidsSleepSoundCard';
import PeacefulSoundCard from './PeacefulSoundCard';
import SessionPanel from './UnifiedSessionPanel';
import MoodSpace from './MoodSpace';
import { useMainPlayer } from '../hooks/useMainPlayer';
import { useUnifiedAudioManagerContext } from '../hooks/UnifiedAudioManagerContext';
import { useUnifiedSessionManager } from '../hooks/useUnifiedSessionManager';
import { useUnifiedPlaylistManager } from '../hooks/useUnifiedPlaylistManager';
import { useLanguage } from '../hooks/useLanguage';
import { useVisualTheme, VisualTheme } from '../hooks/useTheme';
import { kidsSleepSounds } from '../lib/kidsSleepSounds';
import { peacefulSounds } from '../lib/peacefulSounds';

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

type Category = 'frequencies' | 'kidsSleepSounds' | 'peacefulSounds' | 'moodSpace';

interface ThemeStyles {
  gradient: string;
  glow: string;
  hoverGlow: string;
  border: string;
}

export default function UnifiedFrequencyList() {
  const [activeCategory, setActiveCategory] = useState<Category>('frequencies');
  const player = useMainPlayer();
  const { intensity } = useUnifiedAudioManagerContext();
  const { t } = useLanguage();
  const { theme } = useVisualTheme();

  const sessionManager = useUnifiedSessionManager();
  const playlistManager = useUnifiedPlaylistManager();

  const handleToggle = (hz: number) => {
    if (sessionManager.activeSession) {
      sessionManager.stopSession();
    }
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (player.currentFrequency === hz && player.playMode === 'single' && !player.currentSoundId) {
      player.stop();
    } else {
      player.playFrequency(hz, 'single');
    }
  };

  const handleSoundToggle = (soundId: string) => {
    if (sessionManager.activeSession) {
      sessionManager.stopSession();
    }
    if (playlistManager.isPlaylistActive) {
      playlistManager.stopPlaylist();
    }

    if (player.currentSoundId === soundId && player.playMode === 'single') {
      player.stop();
    } else {
      player.playSound(soundId, 'single');
    }
  };

  const isFrequencyPlaying = (hz: number) => {
    return player.currentFrequency === hz && player.isPlaying && !player.currentSoundId;
  };

  const isSoundPlaying = (soundId: string) => {
    return player.currentSoundId === soundId && player.isPlaying;
  };

  const whiteNoiseSounds = kidsSleepSounds.filter(s => s.category === 'whiteNoise');
  const natureSounds = kidsSleepSounds.filter(s => s.category === 'natureSounds');
  const lullabies = kidsSleepSounds.filter(s => s.category === 'lullabies');
  const fairyTaleSounds = kidsSleepSounds.filter(s => s.category === 'fairyTale');

  // Theme-specific gradient and glow colors with defensive fallback
  const getThemeStyles = (isActive: boolean): ThemeStyles => {
    const themeConfig: Record<VisualTheme, ThemeStyles> = {
      'aurora-glow': {
        gradient: isActive 
          ? 'from-purple-600/80 via-blue-600/70 to-teal-600/80' 
          : 'from-purple-500/30 via-blue-500/25 to-teal-500/30',
        glow: isActive 
          ? 'shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(59,130,246,0.4)]' 
          : 'shadow-[0_0_15px_rgba(168,85,247,0.3),0_0_30px_rgba(59,130,246,0.2)]',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.7),0_0_80px_rgba(59,130,246,0.5)]',
        border: isActive ? 'border-purple-400/60' : 'border-purple-400/30',
      },
      'celestial-calm': {
        gradient: isActive 
          ? 'from-indigo-600/80 via-blue-700/70 to-purple-600/80' 
          : 'from-indigo-500/30 via-blue-600/25 to-purple-500/30',
        glow: isActive 
          ? 'shadow-[0_0_30px_rgba(99,102,241,0.6),0_0_60px_rgba(147,51,234,0.4)]' 
          : 'shadow-[0_0_15px_rgba(99,102,241,0.3),0_0_30px_rgba(147,51,234,0.2)]',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.7),0_0_80px_rgba(147,51,234,0.5)]',
        border: isActive ? 'border-indigo-400/60' : 'border-indigo-400/30',
      },
      'sacred-lotus': {
        gradient: isActive 
          ? 'from-pink-600/80 via-rose-600/70 to-purple-600/80' 
          : 'from-pink-500/30 via-rose-500/25 to-purple-500/30',
        glow: isActive 
          ? 'shadow-[0_0_30px_rgba(236,72,153,0.6),0_0_60px_rgba(244,114,182,0.4)]' 
          : 'shadow-[0_0_15px_rgba(236,72,153,0.3),0_0_30px_rgba(244,114,182,0.2)]',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.7),0_0_80px_rgba(244,114,182,0.5)]',
        border: isActive ? 'border-pink-400/60' : 'border-pink-400/30',
      },
      'ethereal-waves': {
        gradient: isActive 
          ? 'from-cyan-600/80 via-teal-600/70 to-emerald-600/80' 
          : 'from-cyan-500/30 via-teal-500/25 to-emerald-500/30',
        glow: isActive 
          ? 'shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(20,184,166,0.4)]' 
          : 'shadow-[0_0_15px_rgba(6,182,212,0.3),0_0_30px_rgba(20,184,166,0.2)]',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.7),0_0_80px_rgba(20,184,166,0.5)]',
        border: isActive ? 'border-cyan-400/60' : 'border-cyan-400/30',
      },
      'zen-garden': {
        gradient: isActive 
          ? 'from-green-600/80 via-emerald-600/70 to-teal-600/80' 
          : 'from-green-500/30 via-emerald-500/25 to-teal-500/30',
        glow: isActive 
          ? 'shadow-[0_0_30px_rgba(34,197,94,0.6),0_0_60px_rgba(16,185,129,0.4)]' 
          : 'shadow-[0_0_15px_rgba(34,197,94,0.3),0_0_30px_rgba(16,185,129,0.2)]',
        hoverGlow: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.7),0_0_80px_rgba(16,185,129,0.5)]',
        border: isActive ? 'border-green-400/60' : 'border-green-400/30',
      },
    };

    // Defensive fallback: if theme is not in config, use aurora-glow
    return themeConfig[theme] || themeConfig['aurora-glow'];
  };

  const CategoryButton = ({ category, label }: { category: Category; label: string }) => {
    const isActive = activeCategory === category;
    const styles = getThemeStyles(isActive);

    return (
      <button
        onClick={() => setActiveCategory(category)}
        className={`
          relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
          bg-gradient-to-br ${styles.gradient}
          backdrop-blur-md border-2 ${styles.border}
          ${styles.glow} ${styles.hoverGlow}
          transition-all duration-500 ease-out
          active:scale-95 sm:hover:scale-105
          ${isActive ? 'text-white' : 'text-white/90 hover:text-white'}
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

  return (
    <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 pb-32 px-3 sm:px-4">
      <SessionPanel sessionManager={sessionManager} />

      {/* Category Navigation with Enhanced Design - Mobile optimized */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
        <CategoryButton category="frequencies" label={t.categories.frequencies} />
        <CategoryButton category="kidsSleepSounds" label={t.categories.kidsSleepSounds} />
        <CategoryButton category="peacefulSounds" label={t.categories.peacefulSounds} />
        <CategoryButton category="moodSpace" label={t.categories.moodSpace} />
      </div>

      {/* Mood Space Category */}
      {activeCategory === 'moodSpace' && <MoodSpace />}

      {/* Frequencies Category */}
      {activeCategory === 'frequencies' && (
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
                  description: t.frequencies[freq.hz] || '',
                }}
                isPlaying={isFrequencyPlaying(freq.hz)}
                onToggle={() => handleToggle(freq.hz)}
                isInPlaylist={playlistManager.isFrequencyInPlaylist(freq.hz)}
                onAddToPlaylist={() => playlistManager.addFrequencyToPlaylist(freq.hz)}
                isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Kids Sleep Sounds Category */}
      {activeCategory === 'kidsSleepSounds' && (
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
                  onAddToPlaylist={() => playlistManager.addSoundToPlaylist(sound.id)}
                  isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
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
                  onAddToPlaylist={() => playlistManager.addSoundToPlaylist(sound.id)}
                  isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
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
                  onAddToPlaylist={() => playlistManager.addSoundToPlaylist(sound.id)}
                  isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
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
                  onAddToPlaylist={() => playlistManager.addSoundToPlaylist(sound.id)}
                  isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Peaceful Sounds Category */}
      {activeCategory === 'peacefulSounds' && (
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
                onAddToPlaylist={() => playlistManager.addSoundToPlaylist(sound.id)}
                isDisabled={sessionManager.activeSession !== null || playlistManager.isPlaylistActive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
